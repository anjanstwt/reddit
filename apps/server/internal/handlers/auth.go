package handlers

import (
	"errors"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	"reddit/server/internal/auth"
	"reddit/server/internal/middleware"
	"reddit/server/internal/models"
	"reddit/server/internal/response"
)

type tokenPair struct {
	AccessToken          string    `json:"accessToken"`
	RefreshToken         string    `json:"refreshToken"`
	AccessTokenExpiresAt time.Time `json:"accessTokenExpiresAt"`
}

type authResponse struct {
	User *models.User `json:"user"`
	tokenPair
}

// POST /api/v1/auth/google
// Called by NextAuth after Google sign-in. Body: {"idToken": "..."}.
// Verifies the Google ID token, upserts the user and returns our own token pair.
func (h *Handler) GoogleSignIn(c *gin.Context) {
	var body struct {
		IDToken string `json:"idToken" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		response.Error(c, "BAD_REQUEST", "idToken is required", http.StatusBadRequest)
		return
	}

	googleUser, err := auth.VerifyIDToken(c.Request.Context(), body.IDToken, h.Cfg.GoogleClientID)
	if err != nil {
		log.Printf("google sign-in: %v", err)
		response.NotAuthorized(c)
		return
	}

	user, err := h.upsertGoogleUser(googleUser)
	if err != nil {
		log.Printf("google sign-in: upsert user: %v", err)
		response.SystemError(c)
		return
	}

	tokens, err := h.issueTokens(user)
	if err != nil {
		response.SystemError(c)
		return
	}

	response.Success(c, authResponse{User: user, tokenPair: *tokens}, "Signed in", http.StatusOK)
}

// POST /api/v1/auth/refresh
// Body: {"refreshToken": "..."}. Issues a new access + refresh token pair.
func (h *Handler) Refresh(c *gin.Context) {
	var body struct {
		RefreshToken string `json:"refreshToken" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		response.NotAuthorized(c)
		return
	}

	claims, err := auth.ParseToken(body.RefreshToken, h.Cfg.JWTRefreshSecret)
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

// GET /api/v1/auth/me (requires auth)
func (h *Handler) Me(c *gin.Context) {
	userID := c.GetString(middleware.UserIDKey)

	var user models.User
	err := h.DB.First(&user, "id = ?", userID).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		response.NotAuthorized(c)
		return
	}
	if err != nil {
		response.SystemError(c)
		return
	}

	response.Success(c, user, "User fetched successfully", http.StatusOK)
}

// upsertGoogleUser creates the user on first login, or updates their profile on later logins.
func (h *Handler) upsertGoogleUser(g *auth.GoogleUser) (*models.User, error) {
	user := models.User{
		GoogleID: g.Sub,
		Email:    g.Email,
		Name:     g.Name,
	}
	if g.Picture != "" {
		user.Image = &g.Picture
	}

	err := h.DB.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "google_id"}},
		DoUpdates: clause.AssignmentColumns([]string{"email", "name", "image", "updated_at"}),
	}).Create(&user).Error
	if err != nil {
		return nil, err
	}

	// Re-read so ID/CreatedAt are correct on both insert and update.
	if err := h.DB.First(&user, "google_id = ?", g.Sub).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (h *Handler) issueTokens(user *models.User) (*tokenPair, error) {
	accessToken, err := auth.GenerateToken(user.ID, user.Email, h.Cfg.JWTSecret, auth.AccessTokenTTL)
	if err != nil {
		return nil, err
	}
	refreshToken, err := auth.GenerateToken(user.ID, user.Email, h.Cfg.JWTRefreshSecret, auth.RefreshTokenTTL)
	if err != nil {
		return nil, err
	}

	return &tokenPair{
		AccessToken:          accessToken,
		RefreshToken:         refreshToken,
		AccessTokenExpiresAt: time.Now().Add(auth.AccessTokenTTL),
	}, nil
}
