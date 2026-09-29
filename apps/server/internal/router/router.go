package router

import (
	"net/http"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"reddit/server/internal/config"
	"reddit/server/internal/handlers/auth"
	"reddit/server/internal/handlers/communities"
	"reddit/server/internal/handlers/health"
	"reddit/server/internal/handlers/users"
	"reddit/server/internal/middleware"
	"reddit/server/internal/response"
)

func New(cfg config.Config, db *gorm.DB) *gin.Engine {
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

	healthH := health.New(db)
	authH := auth.New(db, cfg)
	usersH := users.New(db, cfg)
	communitiesH := communities.New(db, cfg)

	r.GET("/health", healthH.Health)

	requireAuth := middleware.RequireAuth(cfg.JWTSecret)
	optionalAuth := middleware.OptionalAuth(cfg.JWTSecret)

	v1 := r.Group("/api/v1")
	{
		authGroup := v1.Group("/auth")
		authGroup.POST("/google", authH.GoogleSignIn)
		authGroup.POST("/refresh", authH.Refresh)
		authGroup.GET("/me", requireAuth, authH.Me)

		usersGroup := v1.Group("/users")
		usersGroup.PATCH("/me", requireAuth, usersH.UpdateMe)
		usersGroup.GET("/:username", usersH.GetUser)
		usersGroup.POST("/:username/follow", requireAuth, usersH.Follow)
		usersGroup.DELETE("/:username/follow", requireAuth, usersH.Unfollow)

		communitiesGroup := v1.Group("/communities")
		communitiesGroup.POST("", requireAuth, communitiesH.CreateCommunity)
		communitiesGroup.GET("/:name", optionalAuth, communitiesH.GetCommunity)
		communitiesGroup.PATCH("/:name", requireAuth, communitiesH.UpdateCommunity)
		communitiesGroup.POST("/:name/join", requireAuth, communitiesH.Join)
		communitiesGroup.DELETE("/:name/join", requireAuth, communitiesH.Leave)
	}

	r.NoRoute(func(c *gin.Context) {
		response.Error(c, "NOT_FOUND", "Route not found", http.StatusNotFound)
	})

	return r
}
