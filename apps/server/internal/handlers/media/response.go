package media

import (
	"time"

	"reddit/server/internal/models"
)

type mediaType struct {
	kind models.MediaKind
	ext  string
}

var allowedTypes = map[string]mediaType{
	"image/jpeg":      {models.MediaImage, ".jpg"},
	"image/png":       {models.MediaImage, ".png"},
	"image/gif":       {models.MediaImage, ".gif"},
	"image/webp":      {models.MediaImage, ".webp"},
	"video/mp4":       {models.MediaVideo, ".mp4"},
	"video/webm":      {models.MediaVideo, ".webm"},
	"video/quicktime": {models.MediaVideo, ".mov"},
}

func maxBytes(kind models.MediaKind) int64 {
	if kind == models.MediaVideo {
		return models.MaxVideoBytes
	}
	return models.MaxImageBytes
}

type mediaResponse struct {
	ID         string             `json:"id"`
	Kind       models.MediaKind   `json:"kind"`
	MimeType   string             `json:"mimeType"`
	SizeBytes  int64              `json:"sizeBytes"`
	Width      *int               `json:"width"`
	Height     *int               `json:"height"`
	DurationMs *int               `json:"durationMs"`
	Status     models.MediaStatus `json:"status"`
	URL        *string            `json:"url"`
	CreatedAt  time.Time          `json:"createdAt"`
}

func (h *Handler) toMediaResponse(m *models.Media) mediaResponse {
	res := mediaResponse{
		ID:         m.ID,
		Kind:       m.Kind,
		MimeType:   m.MimeType,
		SizeBytes:  m.SizeBytes,
		Width:      m.Width,
		Height:     m.Height,
		DurationMs: m.DurationMs,
		Status:     m.Status,
		CreatedAt:  m.CreatedAt,
	}
	if m.Status == models.MediaReady {
		url := h.Storage.URL(m.StorageKey)
		res.URL = &url
	}
	return res
}
