package users

import (
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"reddit/server/internal/models"
	"reddit/server/internal/response"
)

// profile is the public view of a user. Unlike models.User it leaves out the email.
type profile struct {
	ID             string    `json:"id"`
	Username       *string   `json:"username"`
	Name           string    `json:"name"`
	Image          *string   `json:"image"`
	Bio            string    `json:"bio"`
	FollowerCount  int       `json:"followerCount"`
	FollowingCount int       `json:"followingCount"`
	CreatedAt      time.Time `json:"createdAt"`
}

func toProfile(u *models.User) profile {
	return profile{
		ID:             u.ID,
		Username:       u.Username,
		Name:           u.Name,
		Image:          u.Image,
		Bio:            u.Bio,
		FollowerCount:  u.FollowerCount,
		FollowingCount: u.FollowingCount,
		CreatedAt:      u.CreatedAt,
	}
}

// controller for finding user from username
func (h *Handler) GetUser(c *gin.Context) {
	user, ok := h.findUserByUsername(c)
	if !ok {
		return
	}
	response.Success(c, toProfile(user), "User fetched successfully", http.StatusOK)
}

func (h *Handler) findUserByUsername(c *gin.Context) (*models.User, bool) {
	var user models.User
	err := h.DB.First(&user, "username = ?", strings.ToLower(c.Param("username"))).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		response.Error(c, "NOT_FOUND", "User not found", http.StatusNotFound)
		return nil, false
	}
	if err != nil {
		response.SystemError(c)
		return nil, false
	}
	return &user, true
}
