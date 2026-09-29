package threads

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"reddit/server/internal/middleware"
	"reddit/server/internal/models"
	"reddit/server/internal/response"
)

// controller for pinning or unpinning a post
func (h *Handler) Pin(c *gin.Context) {
	h.setPostFlag(c, "pinned")
}

// controller for locking or unlocking a post
func (h *Handler) Lock(c *gin.Context) {
	h.setPostFlag(c, "locked")
}

func (h *Handler) setPostFlag(c *gin.Context, column string) {
	var body map[string]any
	if err := c.ShouldBindJSON(&body); err != nil {
		response.Error(c, "BAD_REQUEST", "Invalid request body", http.StatusBadRequest)
		return
	}
	value, ok := body[column].(bool)
	if !ok {
		response.Error(c, "BAD_REQUEST", column+" must be true or false", http.StatusBadRequest)
		return
	}

	thread, ok := h.findThread(c)
	if !ok {
		return
	}
	if thread.ParentID != nil {
		response.Error(c, "NOT_A_POST", "Only posts can be "+column, http.StatusBadRequest)
		return
	}
	if thread.DeletedAt != nil {
		response.Error(c, "THREAD_DELETED", "Can't change a deleted post", http.StatusBadRequest)
		return
	}

	isMod, err := h.isModerator(thread.CommunityID, c.GetString(middleware.UserIDKey))
	if err != nil {
		response.SystemError(c)
		return
	}
	if !isMod {
		response.Error(c, "FORBIDDEN", "Only owners and moderators can do this", http.StatusForbidden)
		return
	}

	if err := h.DB.Model(&models.Thread{}).Where("id = ?", thread.ID).Update(column, value).Error; err != nil {
		response.SystemError(c)
		return
	}

	h.respondWithThread(c, thread.ID, "Post updated", http.StatusOK)
}

func (h *Handler) isModerator(communityID, userID string) (bool, error) {
	var count int64
	err := h.DB.Model(&models.CommunityMember{}).
		Where("community_id = ? AND user_id = ? AND role IN ?", communityID, userID,
			[]models.CommunityRole{models.RoleModerator, models.RoleOwner}).
		Count(&count).Error
	return count > 0, err
}
