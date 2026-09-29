package threads

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"reddit/server/internal/middleware"
	"reddit/server/internal/models"
	"reddit/server/internal/pagination"
	"reddit/server/internal/response"
)

var historyFilters = map[string]string{
	"posts":    "parent_id IS NULL",
	"comments": "parent_id IS NOT NULL",
}

// controller for fetching a user's posts or comments
func (h *Handler) ListUserThreads(c *gin.Context) {
	user, ok := h.findUser(c)
	if !ok {
		return
	}
	filter, ok := historyFilters[c.DefaultQuery("type", "posts")]
	if !ok {
		response.Error(c, "INVALID_TYPE", "type must be posts or comments", http.StatusBadRequest)
		return
	}
	limit, offset, ok := pagination.Parse(c)
	if !ok {
		return
	}

	var threads []models.Thread
	err := h.DB.Preload("Author").Preload("Community").
		Where("author_id = ? AND deleted_at IS NULL AND "+filter, user.ID).
		Order("created_at DESC").Limit(limit).Offset(offset).
		Find(&threads).Error
	if err != nil {
		response.SystemError(c)
		return
	}

	res := make([]*threadResponse, len(threads))
	for i := range threads {
		res[i] = toThreadResponse(&threads[i])
	}
	if err := h.decorate(c.GetString(middleware.UserIDKey), res...); err != nil {
		response.SystemError(c)
		return
	}
	response.Success(c, res, "Threads fetched successfully", http.StatusOK)
}
