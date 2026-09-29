package threads

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm/clause"

	"reddit/server/internal/middleware"
	"reddit/server/internal/response"
)

// controller for soft deleting a thread
func (h *Handler) DeleteThread(c *gin.Context) {
	thread, ok := h.findThread(c)
	if !ok {
		return
	}
	if me := c.GetString(middleware.UserIDKey); thread.AuthorID != me {
		isMod, err := h.isModerator(thread.CommunityID, me)
		if err != nil {
			response.SystemError(c)
			return
		}
		if !isMod {
			response.Error(c, "FORBIDDEN", "Only the author or a moderator can delete this thread", http.StatusForbidden)
			return
		}
	}

	if thread.DeletedAt == nil {
		if err := h.DB.Model(thread).Omit(clause.Associations).Update("deleted_at", time.Now()).Error; err != nil {
			response.SystemError(c)
			return
		}
	}

	response.Success(c, nil, "Thread deleted", http.StatusOK)
}
