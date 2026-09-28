package middleware

import (
	"strings"

	"github.com/gin-gonic/gin"

	"reddit/server/internal/auth"
	"reddit/server/internal/response"
)

const UserIDKey = "userID"

// RequireAuth reads the access token from the "Authorization: Bearer <token>"
// header and stores the user ID on the context.
func RequireAuth(jwtSecret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		token, ok := strings.CutPrefix(c.GetHeader("Authorization"), "Bearer ")
		if !ok || token == "" {
			response.NotAuthorized(c)
			c.Abort()
			return
		}

		claims, err := auth.ParseToken(token, jwtSecret)
		if err != nil {
			response.NotAuthorized(c)
			c.Abort()
			return
		}

		c.Set(UserIDKey, claims.UserID)
		c.Next()
	}
}
