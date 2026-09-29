package auth

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"reddit/server/internal/middleware"
	"reddit/server/internal/models"
	"reddit/server/internal/response"
)

// fetching user details
func (h *Handler) Me(c *gin.Context) {
	userID := c.GetString(middleware.UserIDKey)

	var user models.User
	err := h.DB.First(&user, "id = ?", userID).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		response.NotAuthorized(c)
		return
	}
	if err != nil {
		response.SystemError(c)
		return
	}

	response.Success(c, user, "User fetched successfully", http.StatusOK)
}
