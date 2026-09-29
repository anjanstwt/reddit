package communities

import (
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"reddit/server/internal/mediaref"
	"reddit/server/internal/middleware"
	"reddit/server/internal/models"
	"reddit/server/internal/pagination"
	"reddit/server/internal/response"
)

const roleOrder = "CASE role WHEN 'owner' THEN 0 WHEN 'moderator' THEN 1 ELSE 2 END"

type memberUser struct {
	ID        string  `json:"id"`
	Username  *string `json:"username"`
	Name      string  `json:"name"`
	AvatarURL *string `json:"avatarUrl"`
}

type memberResponse struct {
	User     memberUser           `json:"user"`
	Role     models.CommunityRole `json:"role"`
	JoinedAt time.Time            `json:"joinedAt"`
}

// controller for fetching members of a community
func (h *Handler) ListMembers(c *gin.Context) {
	community, ok := h.findCommunityByName(c)
	if !ok {
		return
	}
	limit, offset, ok := pagination.Parse(c)
	if !ok {
		return
	}

	query := h.DB.Preload("User").Where("community_id = ?", community.ID)
	if role := c.Query("role"); role != "" {
		switch models.CommunityRole(role) {
		case models.RoleOwner, models.RoleModerator, models.RoleMember:
			query = query.Where("role = ?", role)
		default:
			response.Error(c, "INVALID_ROLE", "role must be owner, moderator or member", http.StatusBadRequest)
			return
		}
	}

	var members []models.CommunityMember
	if err := query.Order(roleOrder + ", joined_at ASC").Limit(limit).Offset(offset).Find(&members).Error; err != nil {
		response.SystemError(c)
		return
	}

	res, err := h.toMemberResponses(members)
	if err != nil {
		response.SystemError(c)
		return
	}
	response.Success(c, res, "Members fetched successfully", http.StatusOK)
}

// controller for making a member a moderator or back to a member
func (h *Handler) SetMemberRole(c *gin.Context) {
	var body struct {
		Role models.CommunityRole `json:"role"`
	}
	if err := c.ShouldBindJSON(&body); err != nil || (body.Role != models.RoleModerator && body.Role != models.RoleMember) {
		response.Error(c, "INVALID_ROLE", "role must be moderator or member", http.StatusBadRequest)
		return
	}

	community, ok := h.findCommunityByName(c)
	if !ok {
		return
	}
	myRole, err := h.memberRole(community.ID, c.GetString(middleware.UserIDKey))
	if err != nil {
		response.SystemError(c)
		return
	}
	if myRole == nil || *myRole != models.RoleOwner {
		response.Error(c, "FORBIDDEN", "Only the owner can change roles", http.StatusForbidden)
		return
	}

	var member models.CommunityMember
	err = h.DB.Preload("User").
		Joins("JOIN users ON users.id = community_members.user_id AND users.deleted_at IS NULL").
		Where("community_members.community_id = ? AND users.username = ?", community.ID, strings.ToLower(c.Param("username"))).
		First(&member).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		response.Error(c, "NOT_A_MEMBER", "That user isn't a member of this community", http.StatusBadRequest)
		return
	}
	if err != nil {
		response.SystemError(c)
		return
	}
	if member.Role == models.RoleOwner {
		response.Error(c, "CANNOT_CHANGE_OWNER", "The owner's role can't be changed", http.StatusBadRequest)
		return
	}

	err = h.DB.Model(&models.CommunityMember{}).
		Where("community_id = ? AND user_id = ?", community.ID, member.UserID).
		Update("role", body.Role).Error
	if err != nil {
		response.SystemError(c)
		return
	}
	member.Role = body.Role

	res, err := h.toMemberResponses([]models.CommunityMember{member})
	if err != nil {
		response.SystemError(c)
		return
	}
	response.Success(c, res[0], "Role updated", http.StatusOK)
}

func (h *Handler) toMemberResponses(members []models.CommunityMember) ([]memberResponse, error) {
	var avatarIDs []string
	for _, m := range members {
		if m.User != nil && m.User.AvatarMediaID != nil {
			avatarIDs = append(avatarIDs, *m.User.AvatarMediaID)
		}
	}
	urls, err := mediaref.URLs(h.DB, h.Storage, avatarIDs)
	if err != nil {
		return nil, err
	}

	res := make([]memberResponse, 0, len(members))
	for _, m := range members {
		if m.User == nil {
			continue
		}
		avatar := m.User.Image
		if m.User.AvatarMediaID != nil {
			if url, ok := urls[*m.User.AvatarMediaID]; ok {
				avatar = &url
			}
		}
		res = append(res, memberResponse{
			User:     memberUser{ID: m.User.ID, Username: m.User.Username, Name: m.User.Name, AvatarURL: avatar},
			Role:     m.Role,
			JoinedAt: m.JoinedAt,
		})
	}
	return res, nil
}
