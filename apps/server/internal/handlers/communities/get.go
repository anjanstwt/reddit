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
	ViewerRole *models.CommunityRole `json:"viewerRole"` // null when logged out or not a member
}

// controller for fetching any community via name
func (h *Handler) GetCommunity(c *gin.Context) {
	community, ok := h.findCommunityByName(c)
	if !ok {
		return
	}

	res := communityResponse{Community: community}
	if me := c.GetString(middleware.UserIDKey); me != "" {
		role, err := h.memberRole(community.ID, me)
		if err != nil {
			response.SystemError(c)
			return
		}
		res.ViewerRole = role
	}

	response.Success(c, res, "Community fetched successfully", http.StatusOK)
}

func (h *Handler) findCommunityByName(c *gin.Context) (*models.Community, bool) {
	var community models.Community
	err := h.DB.First(&community, "name = ?", strings.ToLower(c.Param("name"))).Error
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
