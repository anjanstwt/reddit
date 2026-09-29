package threads

import (
	"encoding/json"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"reddit/server/internal/middleware"
	"reddit/server/internal/models"
	"reddit/server/internal/response"
	"reddit/server/internal/tiptap"
)

// controller for creating a post in a community
func (h *Handler) CreatePost(c *gin.Context) {
	var body struct {
		Title string          `json:"title"`
		Body  json.RawMessage `json:"body"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		response.Error(c, "BAD_REQUEST", "Invalid request body", http.StatusBadRequest)
		return
	}

	community, ok := h.findCommunity(c)
	if !ok {
		return
	}
	title, ok := validTitle(c, body.Title)
	if !ok {
		return
	}
	content, ok := validBody(c, body.Body, false)
	if !ok {
		return
	}
	me := c.GetString(middleware.UserIDKey)
	refs, ok := h.validRefs(c, content, me)
	if !ok {
		return
	}

	post := models.Thread{
		CommunityID: community.ID,
		AuthorID:    me,
		Title:       &title,
		Body:        content,
	}
	if err := h.createWithRefs(&post, refs, nil); err != nil {
		response.SystemError(c)
		return
	}

	h.respondWithThread(c, post.ID, "Post created", http.StatusCreated)
}

// controller for replying to a thread
func (h *Handler) CreateReply(c *gin.Context) {
	var body struct {
		Body json.RawMessage `json:"body"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		response.Error(c, "BAD_REQUEST", "Invalid request body", http.StatusBadRequest)
		return
	}

	parent, ok := h.findThread(c)
	if !ok {
		return
	}
	if parent.DeletedAt != nil {
		response.Error(c, "THREAD_DELETED", "Can't reply to a deleted thread", http.StatusBadRequest)
		return
	}

	root := parent
	if parent.RootID != nil {
		root = &models.Thread{}
		if err := h.DB.Select("id", "locked", "deleted_at").First(root, "id = ?", *parent.RootID).Error; err != nil {
			response.SystemError(c)
			return
		}
	}
	if root.Locked {
		response.Error(c, "THREAD_LOCKED", "This post is locked", http.StatusForbidden)
		return
	}
	if root.DeletedAt != nil {
		response.Error(c, "THREAD_DELETED", "Can't reply under a deleted post", http.StatusBadRequest)
		return
	}

	content, ok := validBody(c, body.Body, true)
	if !ok {
		return
	}
	me := c.GetString(middleware.UserIDKey)
	refs, ok := h.validRefs(c, content, me)
	if !ok {
		return
	}

	reply := models.Thread{
		CommunityID: parent.CommunityID,
		AuthorID:    me,
		ParentID:    &parent.ID,
		RootID:      &root.ID,
		Depth:       parent.Depth + 1,
		Body:        content,
	}

	err := h.createWithRefs(&reply, refs, func(tx *gorm.DB) error {
		if err := incrementColumn(tx, parent.ID, "reply_count"); err != nil {
			return err
		}
		return incrementColumn(tx, root.ID, "comment_count")
	})
	if err != nil {
		response.SystemError(c)
		return
	}

	h.respondWithThread(c, reply.ID, "Reply created", http.StatusCreated)
}

func (h *Handler) createWithRefs(thread *models.Thread, refs tiptap.Refs, extra func(tx *gorm.DB) error) error {
	return h.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(thread).Error; err != nil {
			return err
		}
		if err := syncRefs(tx, thread.ID, refs); err != nil {
			return err
		}
		if extra != nil {
			return extra(tx)
		}
		return nil
	})
}

func incrementColumn(tx *gorm.DB, threadID, column string) error {
	return tx.Model(&models.Thread{}).Where("id = ?", threadID).
		UpdateColumn(column, gorm.Expr(column+" + 1")).Error
}

func (h *Handler) respondWithThread(c *gin.Context, id, message string, status int) {
	var thread models.Thread
	if err := h.DB.Preload("Author").Preload("Community").First(&thread, "id = ?", id).Error; err != nil {
		response.SystemError(c)
		return
	}
	res := toThreadResponse(&thread)
	if err := h.decorate(c.GetString(middleware.UserIDKey), res); err != nil {
		response.SystemError(c)
		return
	}
	response.Success(c, res, message, status)
}
