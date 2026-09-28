package router

import (
	"net/http"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"reddit/server/internal/config"
	"reddit/server/internal/handlers"
	"reddit/server/internal/middleware"
	"reddit/server/internal/response"
)

func New(cfg config.Config, h *handlers.Handler) *gin.Engine {
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

	r.GET("/health", h.Health)

	v1 := r.Group("/api/v1")
	{
		authGroup := v1.Group("/auth")
		authGroup.POST("/google", h.GoogleSignIn)
		authGroup.POST("/refresh", h.Refresh)
		authGroup.GET("/me", middleware.RequireAuth(cfg.JWTSecret), h.Me)
	}

	r.NoRoute(func(c *gin.Context) {
		response.Error(c, "NOT_FOUND", "Route not found", http.StatusNotFound)
	})

	return r
}
