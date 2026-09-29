package users

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"reddit/server/internal/middleware"
	"reddit/server/internal/models"
	"reddit/server/internal/response"
)

type meResponse struct {
	*models.User
	AvatarURL *string `json:"avatarUrl"`
}

// controller for fetching the logged in user
func (h *Handler) GetMe(c *gin.Context) {
	var user models.User
	err := h.DB.First(&user, "id = ?", c.GetString(middleware.UserIDKey)).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		response.NotAuthorized(c)
		return
	}
	if err != nil {
		response.SystemError(c)
		return
	}

	h.respondWithMe(c, &user, "User fetched successfully")
}

func (h *Handler) respondWithMe(c *gin.Context, user *models.User, message string) {
	avatars, err := h.avatarURLs([]models.User{*user})
	if err != nil {
		response.SystemError(c)
		return
	}
	response.Success(c, meResponse{User: user, AvatarURL: avatars[user.ID]}, message, http.StatusOK)
}
