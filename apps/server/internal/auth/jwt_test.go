package auth

import (
	"testing"
	"time"
)

const testSecret = "test-secret-that-is-at-least-32-characters"

func TestTokenRoundTrip(t *testing.T) {
	token, err := GenerateToken("user-1", "a@b.com", testSecret, time.Minute)
	if err != nil {
		t.Fatal(err)
	}

	claims, err := ParseToken(token, testSecret)
	if err != nil {
		t.Fatal(err)
	}
	if claims.UserID != "user-1" || claims.Email != "a@b.com" {
		t.Errorf("got %+v", claims)
	}
}

func TestParseTokenRejects(t *testing.T) {
	expired, _ := GenerateToken("user-1", "a@b.com", testSecret, -time.Minute)
	valid, _ := GenerateToken("user-1", "a@b.com", testSecret, time.Minute)

	tests := []struct {
		name   string
		token  string
		secret string
	}{
		{"expired", expired, testSecret},
		{"wrong secret", valid, "another-secret-that-is-32-characters-long"},
		{"garbage", "not.a.token", testSecret},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if _, err := ParseToken(tt.token, tt.secret); err == nil {
				t.Error("expected error, got nil")
			}
		})
	}
}
