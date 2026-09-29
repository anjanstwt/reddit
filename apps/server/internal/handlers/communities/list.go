package communities

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"

	"reddit/server/internal/middleware"
	"reddit/server/internal/models"
	"reddit/server/internal/pagination"
	"reddit/server/internal/response"
)

var likeEscaper = strings.NewReplacer(`\`, `\\`, `%`, `\%`, `_`, `\_`)

// controller for listing and searching communities
func (h *Handler) ListCommunities(c *gin.Context) {
	limit, offset, ok := pagination.Parse(c)
	if !ok {
		return
	}

	query := h.DB.Preload("IconMedia").Preload("BannerMedia")
	if q := strings.TrimSpace(c.Query("q")); q != "" {
		pattern := "%" + likeEscaper.Replace(strings.ToLower(q)) + "%"
		query = query.Where("name LIKE ? OR LOWER(title) LIKE ?", pattern, pattern)
	}

	var communities []models.Community
	if err := query.Order("member_count DESC, name ASC").Limit(limit).Offset(offset).Find(&communities).Error; err != nil {
		response.SystemError(c)
		return
	}

	ids := make([]string, len(communities))
	for i := range communities {
		ids[i] = communities[i].ID
	}
	roles, err := h.viewerRoles(c.GetString(middleware.UserIDKey), ids)
	if err != nil {
		response.SystemError(c)
		return
	}

	res := make([]communityResponse, len(communities))
	for i := range communities {
		res[i] = h.toCommunityResponse(&communities[i], roles[communities[i].ID])
	}
	response.Success(c, res, "Communities fetched successfully", http.StatusOK)
}

// controller for fetching the communities the logged in user has joined
func (h *Handler) ListMine(c *gin.Context) {
	limit, offset, ok := pagination.Parse(c)
	if !ok {
		return
	}

	var members []models.CommunityMember
	err := h.DB.Preload("Community.IconMedia").Preload("Community.BannerMedia").
		Where("user_id = ?", c.GetString(middleware.UserIDKey)).
		Order("joined_at DESC").Limit(limit).Offset(offset).
		Find(&members).Error
	if err != nil {
		response.SystemError(c)
		return
	}

	res := make([]communityResponse, 0, len(members))
	for i := range members {
		if members[i].Community != nil {
			res = append(res, h.toCommunityResponse(members[i].Community, &members[i].Role))
		}
	}
	response.Success(c, res, "Communities fetched successfully", http.StatusOK)
}

func (h *Handler) viewerRoles(userID string, communityIDs []string) (map[string]*models.CommunityRole, error) {
	roles := map[string]*models.CommunityRole{}
	if userID == "" || len(communityIDs) == 0 {
		return roles, nil
	}

	var members []models.CommunityMember
	err := h.DB.Select("community_id", "role").
		Where("user_id = ? AND community_id IN ?", userID, communityIDs).
		Find(&members).Error
	if err != nil {
		return nil, err
	}
	for i := range members {
		roles[members[i].CommunityID] = &members[i].Role
	}
	return roles, nil
}
