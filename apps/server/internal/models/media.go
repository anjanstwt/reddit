package models

import "time"

// upload limits
const (
	MaxImageBytes = 10 << 20  // 10 MB
	MaxVideoBytes = 100 << 20 // 100 MB
)

type MediaKind string

const (
	MediaImage MediaKind = "image"
	MediaVideo MediaKind = "video"
)

type MediaStatus string

const (
	MediaPending MediaStatus = "pending"
	MediaReady   MediaStatus = "ready"
)

// Media is one uploaded file. Only the storage key is stored; the full URL is
// built from MEDIA_BASE_URL when responding, so switching storage is an env change.
type Media struct {
	ID string `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`

	OwnerID string `gorm:"type:uuid;not null;index" json:"ownerId"`
	Owner   *User  `gorm:"constraint:OnDelete:RESTRICT" json:"-"`

	Kind       MediaKind `gorm:"size:16;not null;check:media_kind,kind IN ('image', 'video')" json:"kind"`
	StorageKey string    `gorm:"size:512;not null;uniqueIndex" json:"-"`
	MimeType   string    `gorm:"size:100;not null" json:"mimeType"`
	SizeBytes  int64     `gorm:"not null;check:media_size,size_bytes > 0 AND ((kind = 'image' AND size_bytes <= 10485760) OR (kind = 'video' AND size_bytes <= 104857600))" json:"sizeBytes"`

	Width      *int `json:"width"`
	Height     *int `json:"height"`
	DurationMs *int `json:"durationMs"` // videos only

	// (status, created_at) lets a cleanup job find stale pending uploads.
	Status    MediaStatus `gorm:"size:16;not null;default:'pending';index:idx_media_status_created,priority:1;check:media_status,status IN ('pending', 'ready')" json:"status"`
	CreatedAt time.Time   `gorm:"index:idx_media_status_created,priority:2" json:"createdAt"`
	UpdatedAt time.Time   `json:"updatedAt"`
}

// thread media records which media a thread's body uses
// rebuilt from the body on every create/edit, and media not liked anywhere is an orphan
type ThreadMedia struct {
	ThreadID string `gorm:"type:uuid;primaryKey" json:"threadId"`
	MediaID  string `gorm:"type:uuid;primaryKey;index" json:"mediaId"`
	Position int    `gorm:"not null" json:"position"`

	Thread *Thread `gorm:"constraint:OnDelete:CASCADE" json:"-"`
	Media  *Media  `gorm:"constraint:OnDelete:RESTRICT" json:"media,omitempty"`
}
