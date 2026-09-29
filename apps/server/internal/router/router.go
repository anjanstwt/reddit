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
	"reddit/server/internal/handlers/media"
	"reddit/server/internal/handlers/threads"
	"reddit/server/internal/handlers/users"
	"reddit/server/internal/middleware"
	"reddit/server/internal/response"
	"reddit/server/internal/storage"
)

func New(cfg config.Config, db *gorm.DB, store *storage.Storage) *gin.Engine {
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
	usersH := users.New(db, cfg, store)
	communitiesH := communities.New(db, cfg, store)
	threadsH := threads.New(db, cfg, store)
	mediaH := media.New(db, cfg, store)

	r.GET("/health", healthH.Health)

	requireAuth := middleware.RequireAuth(cfg.JWTSecret)
	optionalAuth := middleware.OptionalAuth(cfg.JWTSecret)

	v1 := r.Group("/api/v1")
	{
		authGroup := v1.Group("/auth")
		authGroup.POST("/google", authH.GoogleSignIn)
		authGroup.POST("/refresh", authH.Refresh)

		usersGroup := v1.Group("/users")
		usersGroup.GET("/me", requireAuth, usersH.GetMe)
		usersGroup.PATCH("/me", requireAuth, usersH.UpdateMe)
		usersGroup.GET("/me/saved", requireAuth, threadsH.ListSaved)
		usersGroup.GET("/me/communities", requireAuth, communitiesH.ListMine)
		usersGroup.GET("/me/feed", requireAuth, threadsH.ListHomeFeed)
		usersGroup.GET("/:username", usersH.GetUser)
		usersGroup.GET("/:username/followers", usersH.ListFollowers)
		usersGroup.GET("/:username/following", usersH.ListFollowing)
		usersGroup.GET("/:username/threads", optionalAuth, threadsH.ListUserThreads)
		usersGroup.POST("/:username/follow", requireAuth, usersH.Follow)
		usersGroup.DELETE("/:username/follow", requireAuth, usersH.Unfollow)

		communitiesGroup := v1.Group("/communities")
		communitiesGroup.GET("", optionalAuth, communitiesH.ListCommunities)
		communitiesGroup.POST("", requireAuth, communitiesH.CreateCommunity)
		communitiesGroup.GET("/:name", optionalAuth, communitiesH.GetCommunity)
		communitiesGroup.PATCH("/:name", requireAuth, communitiesH.UpdateCommunity)
		communitiesGroup.POST("/:name/join", requireAuth, communitiesH.Join)
		communitiesGroup.DELETE("/:name/join", requireAuth, communitiesH.Leave)
		communitiesGroup.GET("/:name/members", communitiesH.ListMembers)
		communitiesGroup.PUT("/:name/members/:username/role", requireAuth, communitiesH.SetMemberRole)
		communitiesGroup.GET("/:name/threads", optionalAuth, threadsH.ListCommunityPosts)
		communitiesGroup.POST("/:name/threads", requireAuth, threadsH.CreatePost)

		threadsGroup := v1.Group("/threads")
		threadsGroup.GET("", optionalAuth, threadsH.ListAllPosts)
		threadsGroup.GET("/:id", optionalAuth, threadsH.GetThread)
		threadsGroup.GET("/:id/comments", optionalAuth, threadsH.ListComments)
		threadsGroup.POST("/:id/replies", requireAuth, threadsH.CreateReply)
		threadsGroup.PATCH("/:id", requireAuth, threadsH.UpdateThread)
		threadsGroup.DELETE("/:id", requireAuth, threadsH.DeleteThread)
		threadsGroup.PUT("/:id/vote", requireAuth, threadsH.Vote)
		threadsGroup.POST("/:id/save", requireAuth, threadsH.Save)
		threadsGroup.DELETE("/:id/save", requireAuth, threadsH.Unsave)
		threadsGroup.PUT("/:id/pin", requireAuth, threadsH.Pin)
		threadsGroup.PUT("/:id/lock", requireAuth, threadsH.Lock)

		mediaGroup := v1.Group("/media")
		mediaGroup.POST("/uploads", requireAuth, mediaH.CreateUpload)
		mediaGroup.POST("/:id/complete", requireAuth, mediaH.CompleteUpload)
		mediaGroup.GET("/:id", optionalAuth, mediaH.GetMedia)
	}

	r.NoRoute(func(c *gin.Context) {
		response.Error(c, "NOT_FOUND", "Route not found", http.StatusNotFound)
	})

	return r
}
