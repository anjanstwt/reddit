package config

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Env              string
	Port             string
	WebURL           string
	DatabaseURL      string
	JWTSecret        string
	JWTRefreshSecret string
	GoogleClientID   string

	StorageEndpoint  string
	StorageAccessKey string
	StorageSecretKey string
	StorageBucket    string
	StorageUseSSL    bool
	MediaBaseURL     string
}

func (c Config) IsProduction() bool {
	return c.Env == "production"
}

func Load() (Config, error) {
	_ = godotenv.Load("../../.env")

	cfg := Config{
		Env:              getEnv("SERVER_ENV", "development"),
		Port:             getEnv("SERVER_PORT", "8080"),
		WebURL:           getEnv("SERVER_WEB_URL", "http://localhost:3000"),
		DatabaseURL:      os.Getenv("DATABASE_URL"),
		JWTSecret:        os.Getenv("SERVER_JWT_SECRET"),
		JWTRefreshSecret: os.Getenv("SERVER_JWT_REFRESH_SECRET"),
		GoogleClientID:   os.Getenv("GOOGLE_CLIENT_ID"),

		StorageEndpoint:  getEnv("SERVER_STORAGE_ENDPOINT", "localhost:9000"),
		StorageAccessKey: os.Getenv("SERVER_STORAGE_ACCESS_KEY"),
		StorageSecretKey: os.Getenv("SERVER_STORAGE_SECRET_KEY"),
		StorageBucket:    getEnv("SERVER_STORAGE_BUCKET", "reddit-media"),
		StorageUseSSL:    os.Getenv("SERVER_STORAGE_USE_SSL") == "true",
		MediaBaseURL:     getEnv("SERVER_MEDIA_BASE_URL", "http://localhost:9000/reddit-media"),
	}

	required := map[string]string{
		"DATABASE_URL":              cfg.DatabaseURL,
		"SERVER_JWT_SECRET":         cfg.JWTSecret,
		"SERVER_JWT_REFRESH_SECRET": cfg.JWTRefreshSecret,
		"GOOGLE_CLIENT_ID":          cfg.GoogleClientID,
	}
	for key, val := range required {
		if val == "" {
			return Config{}, fmt.Errorf("missing required env var %s", key)
		}
	}
	if len(cfg.JWTSecret) < 32 || len(cfg.JWTRefreshSecret) < 32 {
		return Config{}, fmt.Errorf("JWT secrets must be at least 32 characters")
	}

	return cfg, nil
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
