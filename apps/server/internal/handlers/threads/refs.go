package threads

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"reddit/server/internal/mediaref"
	"reddit/server/internal/models"
	"reddit/server/internal/response"
	"reddit/server/internal/tiptap"
)

const maxMediaPerThread = 20

func (h *Handler) validRefs(c *gin.Context, body json.RawMessage, authorID string) (tiptap.Refs, bool) {
	refs, err := tiptap.Extract(body)
	if err != nil {
		response.Error(c, "INVALID_MEDIA", "Images and videos must reference uploaded media", http.StatusBadRequest)
		return tiptap.Refs{}, false
	}
	if len(refs.Media) > maxMediaPerThread {
		response.Error(c, "TOO_MANY_MEDIA", "A thread can have at most 20 images and videos", http.StatusBadRequest)
		return tiptap.Refs{}, false
	}

	ids := make([]string, len(refs.Media))
	for i, m := range refs.Media {
		ids[i] = m.ID
	}
	media, err := mediaref.LoadUsable(h.DB, authorID, ids)
	if errors.Is(err, mediaref.ErrUnusable) {
		response.Error(c, "INVALID_MEDIA", "Media must be your own completed uploads", http.StatusBadRequest)
		return tiptap.Refs{}, false
	}
	if err != nil {
		response.SystemError(c)
		return tiptap.Refs{}, false
	}
	for _, m := range refs.Media {
		if string(media[m.ID].Kind) != m.Kind {
			response.Error(c, "INVALID_MEDIA", "An image node must use an image and a video node a video", http.StatusBadRequest)
			return tiptap.Refs{}, false
		}
	}
	return refs, true
}

func syncRefs(tx *gorm.DB, threadID string, refs tiptap.Refs) error {
	for _, link := range []any{&models.ThreadMedia{}, &models.ThreadUserMention{}, &models.ThreadCommunityMention{}} {
		if err := tx.Where("thread_id = ?", threadID).Delete(link).Error; err != nil {
			return err
		}
	}

	if len(refs.Media) > 0 {
		media := make([]models.ThreadMedia, len(refs.Media))
		for i, m := range refs.Media {
			media[i] = models.ThreadMedia{ThreadID: threadID, MediaID: m.ID, Position: i}
		}
		if err := tx.Create(&media).Error; err != nil {
			return err
		}
	}

	if len(refs.UserIDs) > 0 {
		var ids []string
		if err := tx.Model(&models.User{}).Where("id IN ?", refs.UserIDs).Pluck("id", &ids).Error; err != nil {
			return err
		}
		mentions := make([]models.ThreadUserMention, len(ids))
		for i, id := range ids {
			mentions[i] = models.ThreadUserMention{ThreadID: threadID, UserID: id}
		}
		if len(mentions) > 0 {
			if err := tx.Create(&mentions).Error; err != nil {
				return err
			}
		}
	}

	if len(refs.CommunityIDs) > 0 {
		var ids []string
		if err := tx.Model(&models.Community{}).Where("id IN ?", refs.CommunityIDs).Pluck("id", &ids).Error; err != nil {
			return err
		}
		mentions := make([]models.ThreadCommunityMention, len(ids))
		for i, id := range ids {
			mentions[i] = models.ThreadCommunityMention{ThreadID: threadID, CommunityID: id}
		}
		if len(mentions) > 0 {
			if err := tx.Create(&mentions).Error; err != nil {
				return err
			}
		}
	}
	return nil
}
