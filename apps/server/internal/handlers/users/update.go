package users

import (
	"errors"
	"net/http"
	"regexp"
	"strings"
	"unicode/utf8"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"reddit/server/internal/mediaref"
	"reddit/server/internal/middleware"
	"reddit/server/internal/models"
	"reddit/server/internal/response"
)

// Mirrors the user_username_format check on the users table.
var usernamePattern = regexp.MustCompile(`^[a-z0-9_]{3,20}$`)

const (
	maxNameLength = 50
	maxBioLength  = 200
)

// controller for updating user details
func (h *Handler) UpdateMe(c *gin.Context) {
	var body struct {
		Username      *string `json:"username"`
		Name          *string `json:"name"`
		Bio           *string `json:"bio"`
		AvatarMediaID *string `json:"avatarMediaId"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		response.Error(c, "BAD_REQUEST", "Invalid request body", http.StatusBadRequest)
		return
	}

	var user models.User
	if err := h.DB.First(&user, "id = ?", c.GetString(middleware.UserIDKey)).Error; err != nil {
		response.NotAuthorized(c)
		return
	}

	updates := map[string]any{}

	if body.Username != nil {
		if user.Username != nil {
			response.Error(c, "USERNAME_ALREADY_SET", "Username can't be changed", http.StatusConflict)
			return
		}
		username := strings.ToLower(strings.TrimSpace(*body.Username))
		if !usernamePattern.MatchString(username) {
			response.Error(c, "INVALID_USERNAME", "Username must be 3-20 characters: a-z, 0-9 or _", http.StatusBadRequest)
			return
		}
		updates["username"] = username
	}

	if body.Name != nil {
		name := strings.TrimSpace(*body.Name)
		if name == "" || utf8.RuneCountInString(name) > maxNameLength {
			response.Error(c, "INVALID_NAME", "Name must be 1-50 characters", http.StatusBadRequest)
			return
		}
		updates["name"] = name
	}

	if body.Bio != nil {
		bio := strings.TrimSpace(*body.Bio)
		if utf8.RuneCountInString(bio) > maxBioLength {
			response.Error(c, "INVALID_BIO", "Bio must be at most 200 characters", http.StatusBadRequest)
			return
		}
		updates["bio"] = bio
	}

	if body.AvatarMediaID != nil {
		if *body.AvatarMediaID == "" {
			updates["avatar_media_id"] = nil
		} else {
			if !h.usableImage(c, user.ID, *body.AvatarMediaID) {
				return
			}
			updates["avatar_media_id"] = *body.AvatarMediaID
		}
	}

	if len(updates) == 0 {
		response.Error(c, "BAD_REQUEST", "Nothing to update", http.StatusBadRequest)
		return
	}

	err := h.DB.Model(&user).Updates(updates).Error
	if errors.Is(err, gorm.ErrDuplicatedKey) {
		response.Error(c, "USERNAME_TAKEN", "Username is already taken", http.StatusConflict)
		return
	}
	if err != nil {
		response.SystemError(c)
		return
	}

	if err := h.DB.First(&user, "id = ?", user.ID).Error; err != nil {
		response.SystemError(c)
		return
	}
	h.respondWithMe(c, &user, "Profile updated")
}

func (h *Handler) usableImage(c *gin.Context, ownerID, mediaID string) bool {
	media, err := mediaref.LoadUsable(h.DB, ownerID, []string{mediaID})
	if errors.Is(err, mediaref.ErrUnusable) || (err == nil && media[mediaID].Kind != models.MediaImage) {
		response.Error(c, "INVALID_MEDIA", "Avatar must be one of your completed image uploads", http.StatusBadRequest)
		return false
	}
	if err != nil {
		response.SystemError(c)
		return false
	}
	return true
}
