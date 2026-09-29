package media

import (
	"errors"
	"net/http"
	"regexp"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"reddit/server/internal/middleware"
	"reddit/server/internal/models"
	"reddit/server/internal/response"
)

var uuidPattern = regexp.MustCompile(`^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$`)

// controller for fetching a media file
func (h *Handler) GetMedia(c *gin.Context) {
	media, ok := h.findMedia(c)
	if !ok {
		return
	}
	if media.Status != models.MediaReady && media.OwnerID != c.GetString(middleware.UserIDKey) {
		response.Error(c, "NOT_FOUND", "Media not found", http.StatusNotFound)
		return
	}
	response.Success(c, h.toMediaResponse(media), "Media fetched successfully", http.StatusOK)
}

func (h *Handler) findMedia(c *gin.Context) (*models.Media, bool) {
	id := c.Param("id")
	if !uuidPattern.MatchString(id) {
		response.Error(c, "NOT_FOUND", "Media not found", http.StatusNotFound)
		return nil, false
	}

	var media models.Media
	err := h.DB.First(&media, "id = ?", id).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		response.Error(c, "NOT_FOUND", "Media not found", http.StatusNotFound)
		return nil, false
	}
	if err != nil {
		response.SystemError(c)
		return nil, false
	}
	return &media, true
}
