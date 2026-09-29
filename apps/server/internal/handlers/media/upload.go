package media

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"reddit/server/internal/middleware"
	"reddit/server/internal/models"
	"reddit/server/internal/response"
	"reddit/server/internal/storage"
)

const uploadTTL = 15 * time.Minute

// controller for starting an upload
func (h *Handler) CreateUpload(c *gin.Context) {
	var body struct {
		MimeType  string `json:"mimeType"`
		SizeBytes int64  `json:"sizeBytes"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		response.Error(c, "BAD_REQUEST", "Invalid request body", http.StatusBadRequest)
		return
	}

	t, ok := allowedTypes[body.MimeType]
	if !ok {
		response.Error(c, "UNSUPPORTED_TYPE", "Only jpeg, png, gif, webp, mp4, webm and mov files are allowed", http.StatusBadRequest)
		return
	}
	if body.SizeBytes <= 0 || body.SizeBytes > maxBytes(t.kind) {
		response.Error(c, "FILE_TOO_LARGE", "Images can be up to 10 MB and videos up to 100 MB", http.StatusBadRequest)
		return
	}

	key, err := newStorageKey(t.ext)
	if err != nil {
		response.SystemError(c)
		return
	}

	media := models.Media{
		OwnerID:    c.GetString(middleware.UserIDKey),
		Kind:       t.kind,
		StorageKey: key,
		MimeType:   body.MimeType,
		SizeBytes:  body.SizeBytes,
		Status:     models.MediaPending,
	}
	if err := h.DB.Create(&media).Error; err != nil {
		response.SystemError(c)
		return
	}

	upload, err := h.Storage.PresignUpload(c.Request.Context(), key, body.MimeType, body.SizeBytes, uploadTTL)
	if err != nil {
		h.DB.Delete(&media)
		response.SystemError(c)
		return
	}

	response.Success(c, gin.H{"media": h.toMediaResponse(&media), "upload": upload}, "Upload created", http.StatusCreated)
}

// controller for finishing an upload
func (h *Handler) CompleteUpload(c *gin.Context) {
	var body struct {
		Width      *int `json:"width"`
		Height     *int `json:"height"`
		DurationMs *int `json:"durationMs"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		response.Error(c, "BAD_REQUEST", "Invalid request body", http.StatusBadRequest)
		return
	}

	media, ok := h.findMedia(c)
	if !ok {
		return
	}
	if media.OwnerID != c.GetString(middleware.UserIDKey) {
		response.Error(c, "FORBIDDEN", "Only the uploader can complete this upload", http.StatusForbidden)
		return
	}
	if media.Status == models.MediaReady {
		response.Success(c, h.toMediaResponse(media), "Upload completed", http.StatusOK)
		return
	}

	for _, v := range []*int{body.Width, body.Height, body.DurationMs} {
		if v != nil && *v <= 0 {
			response.Error(c, "INVALID_DIMENSIONS", "width, height and durationMs must be positive", http.StatusBadRequest)
			return
		}
	}
	if media.Kind == models.MediaImage && body.DurationMs != nil {
		response.Error(c, "INVALID_DIMENSIONS", "Images don't have a duration", http.StatusBadRequest)
		return
	}

	obj, err := h.Storage.Stat(c.Request.Context(), media.StorageKey)
	if errors.Is(err, storage.ErrNotFound) {
		response.Error(c, "UPLOAD_MISSING", "The file hasn't been uploaded yet", http.StatusBadRequest)
		return
	}
	if err != nil {
		response.SystemError(c)
		return
	}
	if obj.Size > maxBytes(media.Kind) || obj.ContentType != media.MimeType {
		_ = h.Storage.Remove(c.Request.Context(), media.StorageKey)
		response.Error(c, "INVALID_UPLOAD", "The uploaded file doesn't match the upload request", http.StatusBadRequest)
		return
	}

	updates := map[string]any{
		"status":      models.MediaReady,
		"size_bytes":  obj.Size,
		"width":       body.Width,
		"height":      body.Height,
		"duration_ms": body.DurationMs,
	}
	if err := h.DB.Model(media).Updates(updates).Error; err != nil {
		response.SystemError(c)
		return
	}
	media.Status, media.SizeBytes = models.MediaReady, obj.Size
	media.Width, media.Height, media.DurationMs = body.Width, body.Height, body.DurationMs

	response.Success(c, h.toMediaResponse(media), "Upload completed", http.StatusOK)
}

func newStorageKey(ext string) (string, error) {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return fmt.Sprintf("uploads/%s%s", hex.EncodeToString(b), ext), nil
}
