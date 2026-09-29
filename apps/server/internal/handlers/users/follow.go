package users

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	"reddit/server/internal/middleware"
	"reddit/server/internal/models"
	"reddit/server/internal/response"
)

// controller for following an user
func (h *Handler) Follow(c *gin.Context) {
	me := c.GetString(middleware.UserIDKey)
	target, ok := h.findUserByUsername(c)
	if !ok {
		return
	}
	if target.ID == me {
		response.Error(c, "BAD_REQUEST", "You can't follow yourself", http.StatusBadRequest)
		return
	}

	err := h.DB.Transaction(func(tx *gorm.DB) error {
		res := tx.Clauses(clause.OnConflict{DoNothing: true}).
			Create(&models.Follow{FollowerID: me, FolloweeID: target.ID})
		if res.Error != nil || res.RowsAffected == 0 {
			return res.Error
		}
		return h.adjustFollowCounts(tx, me, target.ID, 1)
	})
	if err != nil {
		response.SystemError(c)
		return
	}

	response.Success(c, nil, "Followed", http.StatusOK)
}

// DELETE /api/v1/users/:username/follow (requires auth)
// Unfollowing someone you don't follow is a no-op.
func (h *Handler) Unfollow(c *gin.Context) {
	me := c.GetString(middleware.UserIDKey)
	target, ok := h.findUserByUsername(c)
	if !ok {
		return
	}

	err := h.DB.Transaction(func(tx *gorm.DB) error {
		res := tx.Delete(&models.Follow{}, "follower_id = ? AND followee_id = ?", me, target.ID)
		if res.Error != nil || res.RowsAffected == 0 {
			return res.Error
		}
		return h.adjustFollowCounts(tx, me, target.ID, -1)
	})
	if err != nil {
		response.SystemError(c)
		return
	}

	response.Success(c, nil, "Unfollowed", http.StatusOK)
}

// adjustFollowCounts keeps the stored counts in step with the follows table.
// Must run in the same transaction as the insert/delete.
func (h *Handler) adjustFollowCounts(tx *gorm.DB, followerID, followeeID string, delta int) error {
	err := tx.Model(&models.User{}).Where("id = ?", followerID).
		UpdateColumn("following_count", gorm.Expr("following_count + ?", delta)).Error
	if err != nil {
		return err
	}
	return tx.Model(&models.User{}).Where("id = ?", followeeID).
		UpdateColumn("follower_count", gorm.Expr("follower_count + ?", delta)).Error
}
