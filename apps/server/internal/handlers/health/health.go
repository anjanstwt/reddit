package health

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"reddit/server/internal/response"
)

type Handler struct {
	DB *gorm.DB
}

func New(db *gorm.DB) *Handler {
	return &Handler{DB: db}
}

// health endpoint
func (h *Handler) Health(c *gin.Context) {
	sqlDB, err := h.DB.DB()
	if err != nil || sqlDB.PingContext(c.Request.Context()) != nil {
		response.Error(c, "DB_UNAVAILABLE", "Database is unreachable", http.StatusServiceUnavailable)
		return
	}

	response.Success(c, gin.H{"status": "ok", "database": "ok"}, "Server is healthy", http.StatusOK)
}
