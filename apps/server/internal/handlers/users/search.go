package users

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

// controller for searching people
func (h *Handler) ListUsers(c *gin.Context) {
	limit, offset, ok := pagination.Parse(c)
	if !ok {
		return
	}

	query := h.DB.Where("username IS NOT NULL")
	if q := strings.TrimSpace(strings.TrimPrefix(c.Query("q"), "u/")); q != "" {
		escaped := likeEscaper.Replace(strings.ToLower(q))
		query = query.Where("username LIKE ? OR LOWER(name) LIKE ?", escaped+"%", "%"+escaped+"%")
	}

	var users []models.User
	if err := query.Order("follower_count DESC, username ASC").Limit(limit).Offset(offset).Find(&users).Error; err != nil {
		response.SystemError(c)
		return
	}

	profiles, err := h.toProfiles(users, c.GetString(middleware.UserIDKey))
	if err != nil {
		response.SystemError(c)
		return
	}
	response.Success(c, profiles, "Users fetched successfully", http.StatusOK)
}
