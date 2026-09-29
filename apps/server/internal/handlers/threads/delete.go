package threads

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"reddit/server/internal/middleware"
	"reddit/server/internal/response"
)

// controller for soft deleting a thread
func (h *Handler) DeleteThread(c *gin.Context) {
	thread, ok := h.findThread(c)
	if !ok {
		return
	}
	if thread.AuthorID != c.GetString(middleware.UserIDKey) {
		response.Error(c, "FORBIDDEN", "Only the author can delete this thread", http.StatusForbidden)
		return
	}

	if thread.DeletedAt == nil {
		if err := h.DB.Model(thread).Update("deleted_at", time.Now()).Error; err != nil {
			response.SystemError(c)
			return
		}
	}

	response.Success(c, nil, "Thread deleted", http.StatusOK)
}
