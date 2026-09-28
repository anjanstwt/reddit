package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"reddit/server/internal/response"
)

func Health(c *gin.Context) {
	response.Success(c, gin.H{"status": "ok"}, "Server is healthy", http.StatusOK)
}
