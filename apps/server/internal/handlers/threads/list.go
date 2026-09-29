package threads

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"reddit/server/internal/middleware"
	"reddit/server/internal/models"
	"reddit/server/internal/pagination"
	"reddit/server/internal/response"
)

var postOrders = map[string]string{
	"new": "pinned DESC, created_at DESC",
	"top": "pinned DESC, score DESC, created_at DESC",
}

// controller for fetching a community's posts
func (h *Handler) ListCommunityPosts(c *gin.Context) {
	community, ok := h.findCommunity(c)
	if !ok {
		return
	}

	order, ok := postOrders[c.DefaultQuery("sort", "new")]
	if !ok {
		response.Error(c, "INVALID_SORT", "sort must be new or top", http.StatusBadRequest)
		return
	}
	limit, offset, ok := pagination.Parse(c)
	if !ok {
		return
	}

	var posts []models.Thread
	err := h.DB.Preload("Author").
		Where("community_id = ? AND parent_id IS NULL AND deleted_at IS NULL", community.ID).
		Order(order).Limit(limit).Offset(offset).
		Find(&posts).Error
	if err != nil {
		response.SystemError(c)
		return
	}

	res := make([]*threadResponse, len(posts))
	for i := range posts {
		posts[i].Community = community
		res[i] = toThreadResponse(&posts[i])
	}
	if err := h.decorate(c.GetString(middleware.UserIDKey), res...); err != nil {
		response.SystemError(c)
		return
	}
	response.Success(c, res, "Posts fetched successfully", http.StatusOK)
}
