package threads

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"reddit/server/internal/middleware"
	"reddit/server/internal/models"
	"reddit/server/internal/response"
)

var commentOrders = map[string]string{
	"top": "score DESC, created_at ASC",
	"new": "created_at DESC",
	"old": "created_at ASC",
}

// controller for fetching a thread
func (h *Handler) GetThread(c *gin.Context) {
	thread, ok := h.findThread(c)
	if !ok {
		return
	}
	res := toThreadResponse(thread)
	if err := h.decorate(c.GetString(middleware.UserIDKey), res); err != nil {
		response.SystemError(c)
		return
	}
	response.Success(c, res, "Thread fetched successfully", http.StatusOK)
}

// controller for fetching comments of a post
func (h *Handler) ListComments(c *gin.Context) {
	post, ok := h.findThread(c)
	if !ok {
		return
	}
	if post.ParentID != nil {
		response.Error(c, "NOT_A_POST", "Comments can only be listed for a post", http.StatusBadRequest)
		return
	}

	order, ok := commentOrders[c.DefaultQuery("sort", "top")]
	if !ok {
		response.Error(c, "INVALID_SORT", "sort must be top, new or old", http.StatusBadRequest)
		return
	}

	var comments []models.Thread
	if err := h.DB.Preload("Author").Where("root_id = ?", post.ID).Order(order).Find(&comments).Error; err != nil {
		response.SystemError(c)
		return
	}

	tree := buildTree(comments)
	if err := h.decorate(c.GetString(middleware.UserIDKey), tree...); err != nil {
		response.SystemError(c)
		return
	}
	response.Success(c, tree, "Comments fetched successfully", http.StatusOK)
}
