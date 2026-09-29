package threads

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"reddit/server/internal/middleware"
	"reddit/server/internal/models"
	"reddit/server/internal/pagination"
	"reddit/server/internal/response"
)

var postOrders = map[string]string{
	"new": "threads.pinned DESC, threads.created_at DESC",
	"top": "threads.pinned DESC, threads.score DESC, threads.created_at DESC",
}

var feedOrders = map[string]string{
	"new": "threads.created_at DESC",
	"top": "threads.score DESC, threads.created_at DESC",
}

// controller for fetching a community's posts
func (h *Handler) ListCommunityPosts(c *gin.Context) {
	community, ok := h.findCommunity(c)
	if !ok {
		return
	}
	h.listPosts(c, postOrders, func(q *gorm.DB) *gorm.DB {
		return q.Where("threads.community_id = ?", community.ID)
	})
}

// controller for fetching posts from every community
func (h *Handler) ListAllPosts(c *gin.Context) {
	h.listPosts(c, feedOrders, func(q *gorm.DB) *gorm.DB { return q })
}

// controller for fetching posts from the communities the logged in user has joined
func (h *Handler) ListHomeFeed(c *gin.Context) {
	me := c.GetString(middleware.UserIDKey)
	h.listPosts(c, feedOrders, func(q *gorm.DB) *gorm.DB {
		return q.Where("threads.community_id IN (?)",
			h.DB.Model(&models.CommunityMember{}).Select("community_id").Where("user_id = ?", me))
	})
}

func (h *Handler) listPosts(c *gin.Context, orders map[string]string, scope func(q *gorm.DB) *gorm.DB) {
	order, ok := orders[c.DefaultQuery("sort", "new")]
	if !ok {
		response.Error(c, "INVALID_SORT", "sort must be new or top", http.StatusBadRequest)
		return
	}
	limit, offset, ok := pagination.Parse(c)
	if !ok {
		return
	}

	query := h.DB.Preload("Author").Preload("Community").
		Joins("JOIN communities ON communities.id = threads.community_id AND communities.deleted_at IS NULL").
		Where("threads.parent_id IS NULL AND threads.deleted_at IS NULL")

	var posts []models.Thread
	if err := scope(query).Order(order).Limit(limit).Offset(offset).Find(&posts).Error; err != nil {
		response.SystemError(c)
		return
	}

	res := make([]*threadResponse, len(posts))
	for i := range posts {
		res[i] = toThreadResponse(&posts[i])
	}
	if err := h.decorate(c.GetString(middleware.UserIDKey), res...); err != nil {
		response.SystemError(c)
		return
	}
	response.Success(c, res, "Posts fetched successfully", http.StatusOK)
}
