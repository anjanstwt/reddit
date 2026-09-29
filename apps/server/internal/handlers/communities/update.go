package communities

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm/clause"

	"reddit/server/internal/mediaref"
	"reddit/server/internal/middleware"
	"reddit/server/internal/models"
	"reddit/server/internal/response"
)

// controller for updating community
func (h *Handler) UpdateCommunity(c *gin.Context) {
	var body struct {
		Title         *string `json:"title"`
		Description   *string `json:"description"`
		IconMediaID   *string `json:"iconMediaId"`
		BannerMediaID *string `json:"bannerMediaId"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		response.Error(c, "BAD_REQUEST", "Invalid request body", http.StatusBadRequest)
		return
	}

	community, ok := h.findCommunityByName(c)
	if !ok {
		return
	}

	role, err := h.memberRole(community.ID, c.GetString(middleware.UserIDKey))
	if err != nil {
		response.SystemError(c)
		return
	}
	if role == nil || *role == models.RoleMember {
		response.Error(c, "FORBIDDEN", "Only owners and moderators can edit a community", http.StatusForbidden)
		return
	}

	updates := map[string]any{}
	if body.Title != nil {
		title, ok := validTitle(c, *body.Title)
		if !ok {
			return
		}
		updates["title"] = title
	}
	if body.Description != nil {
		description, ok := validDescription(c, *body.Description)
		if !ok {
			return
		}
		updates["description"] = description
	}
	for column, id := range map[string]*string{"icon_media_id": body.IconMediaID, "banner_media_id": body.BannerMediaID} {
		if id == nil {
			continue
		}
		if *id == "" {
			updates[column] = nil
			continue
		}
		if !h.usableImage(c, c.GetString(middleware.UserIDKey), *id) {
			return
		}
		updates[column] = *id
	}
	if len(updates) == 0 {
		response.Error(c, "BAD_REQUEST", "Nothing to update", http.StatusBadRequest)
		return
	}

	if err := h.DB.Model(community).Omit(clause.Associations).Updates(updates).Error; err != nil {
		response.SystemError(c)
		return
	}
	var updated models.Community
	if err := h.DB.Preload("IconMedia").Preload("BannerMedia").First(&updated, "id = ?", community.ID).Error; err != nil {
		response.SystemError(c)
		return
	}

	response.Success(c, h.toCommunityResponse(&updated, role), "Community updated", http.StatusOK)
}

func (h *Handler) usableImage(c *gin.Context, ownerID, mediaID string) bool {
	media, err := mediaref.LoadUsable(h.DB, ownerID, []string{mediaID})
	if errors.Is(err, mediaref.ErrUnusable) || (err == nil && media[mediaID].Kind != models.MediaImage) {
		response.Error(c, "INVALID_MEDIA", "Icon and banner must be your own completed image uploads", http.StatusBadRequest)
		return false
	}
	if err != nil {
		response.SystemError(c)
		return false
	}
	return true
}
