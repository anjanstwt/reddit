package users

import (
	"gorm.io/gorm"

	"reddit/server/internal/config"
)

// Handler holds what the users handlers need.
type Handler struct {
	DB  *gorm.DB
	Cfg config.Config
}

func New(db *gorm.DB, cfg config.Config) *Handler {
	return &Handler{DB: db, Cfg: cfg}
}
