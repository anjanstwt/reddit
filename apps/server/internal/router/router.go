package router

import (
	"net/http"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"reddit/server/internal/config"
	"reddit/server/internal/handlers"
	"reddit/server/internal/response"
)

func New(cfg config.Config) *gin.Engine {
	if cfg.IsProduction() {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{cfg.WebURL},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	r.GET("/health", handlers.Health)

	r.NoRoute(func(c *gin.Context) {
		response.Error(c, "NOT_FOUND", "Route not found", http.StatusNotFound)
	})

	return r
}
