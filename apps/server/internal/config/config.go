package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Env    string
	Port   string
	WebURL string
}

func (c Config) IsProduction() bool {
	return c.Env == "production"
}

func Load() Config {
	_ = godotenv.Load("../../.env")

	return Config{
		Env:    getEnv("SERVER_ENV", "development"),
		Port:   getEnv("SERVER_PORT", "8080"),
		WebURL: getEnv("SERVER_WEB_URL", "http://localhost:3000"),
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
