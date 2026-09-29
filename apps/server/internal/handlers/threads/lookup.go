package threads

import (
	"errors"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"reddit/server/internal/models"
	"reddit/server/internal/response"
)

func (h *Handler) findThread(c *gin.Context) (*models.Thread, bool) {
	id := c.Param("id")
	if !uuidPattern.MatchString(id) {
		response.Error(c, "NOT_FOUND", "Thread not found", http.StatusNotFound)
		return nil, false
	}

	var thread models.Thread
	err := h.DB.Preload("Author").Preload("Community").First(&thread, "id = ?", id).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		response.Error(c, "NOT_FOUND", "Thread not found", http.StatusNotFound)
		return nil, false
	}
	if err != nil {
		response.SystemError(c)
		return nil, false
	}
	return &thread, true
}

func (h *Handler) findCommunity(c *gin.Context) (*models.Community, bool) {
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
