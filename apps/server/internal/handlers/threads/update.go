package threads

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	"reddit/server/internal/middleware"
	"reddit/server/internal/response"
)

// controller for updating a thread
func (h *Handler) UpdateThread(c *gin.Context) {
	var body struct {
		Body json.RawMessage `json:"body"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		response.Error(c, "BAD_REQUEST", "Invalid request body", http.StatusBadRequest)
		return
	}

	thread, ok := h.findThread(c)
	if !ok {
		return
	}
	if thread.AuthorID != c.GetString(middleware.UserIDKey) {
		response.Error(c, "FORBIDDEN", "Only the author can edit this thread", http.StatusForbidden)
		return
	}
	if thread.DeletedAt != nil {
		response.Error(c, "THREAD_DELETED", "Can't edit a deleted thread", http.StatusBadRequest)
		return
	}

	content, ok := validBody(c, body.Body, thread.ParentID != nil)
	if !ok {
		return
	}
	refs, ok := h.validRefs(c, content, thread.AuthorID)
	if !ok {
		return
	}

	now := time.Now()
	err := h.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Model(thread).Omit(clause.Associations).Updates(map[string]any{"body": content, "edited_at": now}).Error; err != nil {
			return err
		}
		return syncRefs(tx, thread.ID, refs)
	})
	if err != nil {
		response.SystemError(c)
		return
	}
	thread.Body, thread.EditedAt = content, &now

	res := toThreadResponse(thread)
	if err := h.decorate(thread.AuthorID, res); err != nil {
		response.SystemError(c)
		return
	}
	response.Success(c, res, "Thread updated", http.StatusOK)
}
