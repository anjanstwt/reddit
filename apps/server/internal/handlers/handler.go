package handlers

import (
	"gorm.io/gorm"

	"reddit/server/internal/config"
)

// Handler holds the dependencies every handler needs.
type Handler struct {
	DB  *gorm.DB
	Cfg config.Config
}

func New(db *gorm.DB, cfg config.Config) *Handler {
	return &Handler{DB: db, Cfg: cfg}
}
