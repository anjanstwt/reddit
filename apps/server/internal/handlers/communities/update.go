package communities

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"reddit/server/internal/middleware"
	"reddit/server/internal/models"
	"reddit/server/internal/response"
)

// controller for updating community
func (h *Handler) UpdateCommunity(c *gin.Context) {
	var body struct {
		Title       *string `json:"title"`
		Description *string `json:"description"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		response.Error(c, "BAD_REQUEST", "Invalid request body", http.StatusBadRequest)
		return
	}

	community, ok := h.findCommunityByName(c)
	if !ok {
		return
	}

	role, err := h.memberRole(community.ID, c.GetString(middleware.UserIDKey))
	if err != nil {
		response.SystemError(c)
		return
	}
	if role == nil || *role == models.RoleMember {
		response.Error(c, "FORBIDDEN", "Only owners and moderators can edit a community", http.StatusForbidden)
		return
	}

	updates := map[string]any{}
	if body.Title != nil {
		title, ok := validTitle(c, *body.Title)
		if !ok {
			return
		}
		updates["title"] = title
	}
	if body.Description != nil {
		description, ok := validDescription(c, *body.Description)
		if !ok {
			return
		}
		updates["description"] = description
	}
	if len(updates) == 0 {
		response.Error(c, "BAD_REQUEST", "Nothing to update", http.StatusBadRequest)
		return
	}

	if err := h.DB.Model(community).Updates(updates).Error; err != nil {
		response.SystemError(c)
		return
	}
	if err := h.DB.First(community, "id = ?", community.ID).Error; err != nil {
		response.SystemError(c)
		return
	}

	response.Success(c, communityResponse{Community: community, ViewerRole: role}, "Community updated", http.StatusOK)
}
