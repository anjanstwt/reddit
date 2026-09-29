package auth

import (
	"time"

	authlib "reddit/server/internal/auth"
	"reddit/server/internal/models"
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

func (h *Handler) issueTokens(user *models.User) (*tokenPair, error) {
	accessToken, err := authlib.GenerateToken(user.ID, user.Email, h.Cfg.JWTSecret, authlib.AccessTokenTTL)
	if err != nil {
		return nil, err
	}
	refreshToken, err := authlib.GenerateToken(user.ID, user.Email, h.Cfg.JWTRefreshSecret, authlib.RefreshTokenTTL)
	if err != nil {
		return nil, err
	}

	return &tokenPair{
		AccessToken:          accessToken,
		RefreshToken:         refreshToken,
		AccessTokenExpiresAt: time.Now().Add(authlib.AccessTokenTTL),
	}, nil
}
