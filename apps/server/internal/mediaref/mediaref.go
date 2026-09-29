package mediaref

import (
	"errors"
	"regexp"

	"gorm.io/gorm"

	"reddit/server/internal/models"
	"reddit/server/internal/storage"
)

var (
	ErrUnusable = errors.New("media not found, not ready or not yours")
	uuidPattern = regexp.MustCompile(`^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$`)
)

type Info struct {
	URL        string           `json:"url"`
	Kind       models.MediaKind `json:"kind"`
	MimeType   string           `json:"mimeType"`
	Width      *int             `json:"width"`
	Height     *int             `json:"height"`
	DurationMs *int             `json:"durationMs"`
}

func ToInfo(store *storage.Storage, m *models.Media) Info {
	return Info{
		URL:        store.URL(m.StorageKey),
		Kind:       m.Kind,
		MimeType:   m.MimeType,
		Width:      m.Width,
		Height:     m.Height,
		DurationMs: m.DurationMs,
	}
}

func LoadUsable(db *gorm.DB, ownerID string, ids []string) (map[string]*models.Media, error) {
	byID := map[string]*models.Media{}
	if len(ids) == 0 {
		return byID, nil
	}
	for _, id := range ids {
		if !uuidPattern.MatchString(id) {
			return nil, ErrUnusable
		}
	}

	var rows []models.Media
	err := db.Where("id IN ? AND owner_id = ? AND status = ?", ids, ownerID, models.MediaReady).Find(&rows).Error
	if err != nil {
		return nil, err
	}
	for i := range rows {
		byID[rows[i].ID] = &rows[i]
	}
	for _, id := range ids {
		if byID[id] == nil {
			return nil, ErrUnusable
		}
	}
	return byID, nil
}

func URLs(db *gorm.DB, store *storage.Storage, ids []string) (map[string]string, error) {
	urls := map[string]string{}
	if len(ids) == 0 {
		return urls, nil
	}

	var rows []models.Media
	if err := db.Where("id IN ? AND status = ?", ids, models.MediaReady).Find(&rows).Error; err != nil {
		return nil, err
	}
	for i := range rows {
		urls[rows[i].ID] = store.URL(rows[i].StorageKey)
	}
	return urls, nil
}
