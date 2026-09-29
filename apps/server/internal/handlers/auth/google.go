package auth

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm/clause"

	authlib "reddit/server/internal/auth"
	"reddit/server/internal/models"
	"reddit/server/internal/response"
)

// nextauth google token verification and returning our own token
func (h *Handler) GoogleSignIn(c *gin.Context) {
	var body struct {
		IDToken string `json:"idToken" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		response.Error(c, "BAD_REQUEST", "idToken is required", http.StatusBadRequest)
		return
	}

	googleUser, err := authlib.VerifyIDToken(c.Request.Context(), body.IDToken, h.Cfg.GoogleClientID)
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

func (h *Handler) upsertGoogleUser(g *authlib.GoogleUser) (*models.User, error) {
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
		DoUpdates: clause.AssignmentColumns([]string{"email", "image", "updated_at"}),
	}).Create(&user).Error
	if err != nil {
		return nil, err
	}

	if err := h.DB.First(&user, "google_id = ?", g.Sub).Error; err != nil {
		return nil, err
	}
	return &user, nil
}
