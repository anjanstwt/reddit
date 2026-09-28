package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"reddit/server/internal/response"
)

func (h *Handler) Health(c *gin.Context) {
	sqlDB, err := h.DB.DB()
	if err != nil || sqlDB.PingContext(c.Request.Context()) != nil {
		response.Error(c, "DB_UNAVAILABLE", "Database is unreachable", http.StatusServiceUnavailable)
		return
	}

	response.Success(c, gin.H{"status": "ok", "database": "ok"}, "Server is healthy", http.StatusOK)
}
