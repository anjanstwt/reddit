package jobs

import (
	"context"
	"errors"
	"log"
	"time"

	"gorm.io/gorm"

	"reddit/server/internal/models"
	"reddit/server/internal/storage"
)

const (
	pendingMediaMaxAge = 24 * time.Hour
	mediaCleanupEvery  = time.Hour
	mediaCleanupBatch  = 500
)

func RunMediaCleanup(ctx context.Context, db *gorm.DB, store *storage.Storage) {
	ticker := time.NewTicker(mediaCleanupEvery)
	defer ticker.Stop()

	for {
		removed, err := CleanupPendingMedia(ctx, db, store, time.Now().Add(-pendingMediaMaxAge))
		if err != nil {
			log.Printf("media cleanup: %v", err)
		} else if removed > 0 {
			log.Printf("media cleanup: removed %d stale uploads", removed)
		}

		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
		}
	}
}

func CleanupPendingMedia(ctx context.Context, db *gorm.DB, store *storage.Storage, before time.Time) (int, error) {
	if err := store.Ready(ctx); err != nil {
		if errors.Is(err, storage.ErrUnavailable) {
			return 0, nil
		}
		return 0, err
	}

	var stale []models.Media
	err := db.WithContext(ctx).
		Where("status = ? AND created_at < ?", models.MediaPending, before).
		Limit(mediaCleanupBatch).Find(&stale).Error
	if err != nil {
		return 0, err
	}

	removed := 0
	for i := range stale {
		if err := store.Remove(ctx, stale[i].StorageKey); err != nil {
			log.Printf("media cleanup: remove %s: %v", stale[i].StorageKey, err)
			continue
		}
		if err := db.WithContext(ctx).Delete(&stale[i]).Error; err != nil {
			log.Printf("media cleanup: delete %s: %v", stale[i].ID, err)
			continue
		}
		removed++
	}
	return removed, nil
}
