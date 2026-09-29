package auth

import (
	"net/http"

	"github.com/gin-gonic/gin"

	authlib "reddit/server/internal/auth"
	"reddit/server/internal/models"
	"reddit/server/internal/response"
)

// controller for issuing a new refresh token
func (h *Handler) Refresh(c *gin.Context) {
	var body struct {
		RefreshToken string `json:"refreshToken" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		response.NotAuthorized(c)
		return
	}

	claims, err := authlib.ParseToken(body.RefreshToken, h.Cfg.JWTRefreshSecret)
	if err != nil {
		response.NotAuthorized(c)
		return
	}

	var user models.User
	if err := h.DB.First(&user, "id = ?", claims.UserID).Error; err != nil {
		response.NotAuthorized(c)
		return
	}

	tokens, err := h.issueTokens(&user)
	if err != nil {
		response.SystemError(c)
		return
	}

	response.Success(c, tokens, "Token refreshed", http.StatusOK)
}
