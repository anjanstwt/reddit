package users

import (
	"gorm.io/gorm"

	"reddit/server/internal/config"
	"reddit/server/internal/storage"
)

// Handler holds what the users handlers need.
type Handler struct {
	DB      *gorm.DB
	Cfg     config.Config
	Storage *storage.Storage
}

func New(db *gorm.DB, cfg config.Config, store *storage.Storage) *Handler {
	return &Handler{DB: db, Cfg: cfg, Storage: store}
}
