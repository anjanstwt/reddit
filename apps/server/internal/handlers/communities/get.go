package communities

import (
	"errors"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"reddit/server/internal/middleware"
	"reddit/server/internal/models"
	"reddit/server/internal/response"
)

type communityResponse struct {
	*models.Community
	IconURL    *string               `json:"iconUrl"`
	BannerURL  *string               `json:"bannerUrl"`
	ViewerRole *models.CommunityRole `json:"viewerRole"` // null when logged out or not a member
}

func (h *Handler) toCommunityResponse(community *models.Community, role *models.CommunityRole) communityResponse {
	res := communityResponse{Community: community, ViewerRole: role}
	if community.IconMedia != nil {
		url := h.Storage.URL(community.IconMedia.StorageKey)
		res.IconURL = &url
	}
	if community.BannerMedia != nil {
		url := h.Storage.URL(community.BannerMedia.StorageKey)
		res.BannerURL = &url
	}
	return res
}

// controller for fetching any community via name
func (h *Handler) GetCommunity(c *gin.Context) {
	community, ok := h.findCommunityByName(c)
	if !ok {
		return
	}

	var role *models.CommunityRole
	if me := c.GetString(middleware.UserIDKey); me != "" {
		var err error
		if role, err = h.memberRole(community.ID, me); err != nil {
			response.SystemError(c)
			return
		}
	}
	res := h.toCommunityResponse(community, role)

	response.Success(c, res, "Community fetched successfully", http.StatusOK)
}

func (h *Handler) findCommunityByName(c *gin.Context) (*models.Community, bool) {
	var community models.Community
	err := h.DB.Preload("IconMedia").Preload("BannerMedia").
		First(&community, "name = ?", strings.ToLower(c.Param("name"))).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		response.Error(c, "NOT_FOUND", "Community not found", http.StatusNotFound)
		return nil, false
	}
	if err != nil {
		response.SystemError(c)
		return nil, false
	}
	return &community, true
}
