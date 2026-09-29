package communities

import (
	"errors"
	"net/http"
	"regexp"
	"strings"
	"unicode/utf8"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"reddit/server/internal/middleware"
	"reddit/server/internal/models"
	"reddit/server/internal/response"
)

// Mirrors the community_name_format check on the communities table.
var namePattern = regexp.MustCompile(`^[a-z0-9_]{3,21}$`)

const (
	maxTitleLength       = 100
	maxDescriptionLength = 500
)

// controller for creating community
func (h *Handler) CreateCommunity(c *gin.Context) {
	var body struct {
		Name        string `json:"name"`
		Title       string `json:"title"`
		Description string `json:"description"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		response.Error(c, "BAD_REQUEST", "Invalid request body", http.StatusBadRequest)
		return
	}

	name := strings.ToLower(strings.TrimSpace(body.Name))
	if !namePattern.MatchString(name) {
		response.Error(c, "INVALID_NAME", "Name must be 3-21 characters: a-z, 0-9 or _", http.StatusBadRequest)
		return
	}
	title, ok := validTitle(c, body.Title)
	if !ok {
		return
	}
	description, ok := validDescription(c, body.Description)
	if !ok {
		return
	}

	me := c.GetString(middleware.UserIDKey)
	community := models.Community{
		Name:        name,
		Title:       title,
		Description: description,
		CreatedByID: me,
		MemberCount: 1,
	}

	err := h.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&community).Error; err != nil {
			return err
		}
		return tx.Create(&models.CommunityMember{
			CommunityID: community.ID,
			UserID:      me,
			Role:        models.RoleOwner,
		}).Error
	})
	if errors.Is(err, gorm.ErrDuplicatedKey) {
		response.Error(c, "NAME_TAKEN", "A community with this name already exists", http.StatusConflict)
		return
	}
	if err != nil {
		response.SystemError(c)
		return
	}

	owner := models.RoleOwner
	response.Success(c, h.toCommunityResponse(&community, &owner), "Community created", http.StatusCreated)
}

// validTitle trims and checks a title. On failure it writes the response and returns ok = false.
func validTitle(c *gin.Context, title string) (string, bool) {
	title = strings.TrimSpace(title)
	if title == "" || utf8.RuneCountInString(title) > maxTitleLength {
		response.Error(c, "INVALID_TITLE", "Title must be 1-100 characters", http.StatusBadRequest)
		return "", false
	}
	return title, true
}

// validDescription trims and checks a description. On failure it writes the response and returns ok = false.
func validDescription(c *gin.Context, description string) (string, bool) {
	description = strings.TrimSpace(description)
	if utf8.RuneCountInString(description) > maxDescriptionLength {
		response.Error(c, "INVALID_DESCRIPTION", "Description must be at most 500 characters", http.StatusBadRequest)
		return "", false
	}
	return description, true
}
