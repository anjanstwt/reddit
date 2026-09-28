package auth

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/url"
)

const googleTokenInfoURL = "https://oauth2.googleapis.com/tokeninfo"

type GoogleUser struct {
	Sub     string
	Email   string
	Name    string
	Picture string
}

// tokenInfo is Google's tokeninfo response. Note Google sends email_verified as a string.
type tokenInfo struct {
	Aud           string `json:"aud"`
	Sub           string `json:"sub"`
	Email         string `json:"email"`
	EmailVerified string `json:"email_verified"`
	Name          string `json:"name"`
	Picture       string `json:"picture"`
}

// VerifyIDToken asks Google to validate an ID token (signature + expiry) and checks
// it was issued for our client, so a token minted for another app is rejected.
func VerifyIDToken(ctx context.Context, idToken, clientID string) (*GoogleUser, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, googleTokenInfoURL, nil)
	if err != nil {
		return nil, err
	}
	req.URL.RawQuery = url.Values{"id_token": {idToken}}.Encode()

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("verify id token: %w", err)
	}
	defer res.Body.Close()

	if res.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("verify id token: status %d", res.StatusCode)
	}

	var info tokenInfo
	if err := json.NewDecoder(res.Body).Decode(&info); err != nil {
		return nil, fmt.Errorf("decode token info: %w", err)
	}
	if info.Aud != clientID {
		return nil, errors.New("id token audience mismatch")
	}
	if info.EmailVerified != "true" {
		return nil, errors.New("google email is not verified")
	}

	return &GoogleUser{
		Sub:     info.Sub,
		Email:   info.Email,
		Name:    info.Name,
		Picture: info.Picture,
	}, nil
}
