package users

import (
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"reddit/server/internal/mediaref"
	"reddit/server/internal/models"
	"reddit/server/internal/response"
)

// profile is the public view of a user. Unlike models.User it leaves out the email.
type profile struct {
	ID             string    `json:"id"`
	Username       *string   `json:"username"`
	Name           string    `json:"name"`
	AvatarURL      *string   `json:"avatarUrl"`
	Bio            string    `json:"bio"`
	FollowerCount  int       `json:"followerCount"`
	FollowingCount int       `json:"followingCount"`
	CreatedAt      time.Time `json:"createdAt"`
}

func (h *Handler) toProfiles(users []models.User) ([]profile, error) {
	avatars, err := h.avatarURLs(users)
	if err != nil {
		return nil, err
	}

	profiles := make([]profile, len(users))
	for i, u := range users {
		profiles[i] = profile{
			ID:             u.ID,
			Username:       u.Username,
			Name:           u.Name,
			AvatarURL:      avatars[u.ID],
			Bio:            u.Bio,
			FollowerCount:  u.FollowerCount,
			FollowingCount: u.FollowingCount,
			CreatedAt:      u.CreatedAt,
		}
	}
	return profiles, nil
}

func (h *Handler) avatarURLs(users []models.User) (map[string]*string, error) {
	var ids []string
	for _, u := range users {
		if u.AvatarMediaID != nil {
			ids = append(ids, *u.AvatarMediaID)
		}
	}
	urls, err := mediaref.URLs(h.DB, h.Storage, ids)
	if err != nil {
		return nil, err
	}

	avatars := make(map[string]*string, len(users))
	for _, u := range users {
		avatars[u.ID] = u.Image
		if u.AvatarMediaID != nil {
			if url, ok := urls[*u.AvatarMediaID]; ok {
				avatars[u.ID] = &url
			}
		}
	}
	return avatars, nil
}

// controller for finding user from username
func (h *Handler) GetUser(c *gin.Context) {
	user, ok := h.findUserByUsername(c)
	if !ok {
		return
	}
	profiles, err := h.toProfiles([]models.User{*user})
	if err != nil {
		response.SystemError(c)
		return
	}
	response.Success(c, profiles[0], "User fetched successfully", http.StatusOK)
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
