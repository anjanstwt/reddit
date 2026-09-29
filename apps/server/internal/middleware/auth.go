package middleware

import (
	"strings"

	"github.com/gin-gonic/gin"

	"reddit/server/internal/auth"
	"reddit/server/internal/response"
)

const UserIDKey = "userID"

// RequireAuth reads the access token from the "Authorization: Bearer <token>"
// header and stores the user ID on the context. Rejects the request without one.
func RequireAuth(jwtSecret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, ok := userIDFromHeader(c, jwtSecret)
		if !ok {
			response.NotAuthorized(c)
			c.Abort()
			return
		}

		c.Set(UserIDKey, userID)
		c.Next()
	}
}

// OptionalAuth is RequireAuth for public routes: a valid token sets the user ID,
// anything else just continues as a logged-out request.
func OptionalAuth(jwtSecret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		if userID, ok := userIDFromHeader(c, jwtSecret); ok {
			c.Set(UserIDKey, userID)
		}
		c.Next()
	}
}

func userIDFromHeader(c *gin.Context, jwtSecret string) (string, bool) {
	token, ok := strings.CutPrefix(c.GetHeader("Authorization"), "Bearer ")
	if !ok || token == "" {
		return "", false
	}

	claims, err := auth.ParseToken(token, jwtSecret)
	if err != nil {
		return "", false
	}
	return claims.UserID, true
}
