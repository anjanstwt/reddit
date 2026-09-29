package communities

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	"reddit/server/internal/middleware"
	"reddit/server/internal/models"
	"reddit/server/internal/response"
)

// controller for joining a community
func (h *Handler) Join(c *gin.Context) {
	community, ok := h.findCommunityByName(c)
	if !ok {
		return
	}
	me := c.GetString(middleware.UserIDKey)

	err := h.DB.Transaction(func(tx *gorm.DB) error {
		res := tx.Clauses(clause.OnConflict{DoNothing: true}).Create(&models.CommunityMember{
			CommunityID: community.ID,
			UserID:      me,
			Role:        models.RoleMember,
		})
		if res.Error != nil || res.RowsAffected == 0 {
			return res.Error
		}
		return adjustMemberCount(tx, community.ID, 1)
	})
	if err != nil {
		response.SystemError(c)
		return
	}

	response.Success(c, nil, "Joined", http.StatusOK)
}

// controller for leaving a community
func (h *Handler) Leave(c *gin.Context) {
	community, ok := h.findCommunityByName(c)
	if !ok {
		return
	}
	me := c.GetString(middleware.UserIDKey)

	role, err := h.memberRole(community.ID, me)
	if err != nil {
		response.SystemError(c)
		return
	}
	if role != nil && *role == models.RoleOwner {
		response.Error(c, "OWNER_CANNOT_LEAVE", "The owner can't leave their community", http.StatusBadRequest)
		return
	}

	err = h.DB.Transaction(func(tx *gorm.DB) error {
		res := tx.Delete(&models.CommunityMember{}, "community_id = ? AND user_id = ?", community.ID, me)
		if res.Error != nil || res.RowsAffected == 0 {
			return res.Error
		}
		return adjustMemberCount(tx, community.ID, -1)
	})
	if err != nil {
		response.SystemError(c)
		return
	}

	response.Success(c, nil, "Left", http.StatusOK)
}

func (h *Handler) memberRole(communityID, userID string) (*models.CommunityRole, error) {
	var member models.CommunityMember
	err := h.DB.Select("role").First(&member, "community_id = ? AND user_id = ?", communityID, userID).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &member.Role, nil
}

func adjustMemberCount(tx *gorm.DB, communityID string, delta int) error {
	return tx.Model(&models.Community{}).Where("id = ?", communityID).
		UpdateColumn("member_count", gorm.Expr("member_count + ?", delta)).Error
}
