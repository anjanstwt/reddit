package main

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"reddit/server/internal/config"
	"reddit/server/internal/router"
)

func main() {
	cfg := config.Load()

	srv := &http.Server{
		Addr:              ":" + cfg.Port,
		Handler:           router.New(cfg),
		ReadHeaderTimeout: 5 * time.Second,
	}

	go func() {
		log.Printf("Server running on port %s", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatal(err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)
	sig := <-quit
	log.Printf("%s received. Starting graceful shutdown...", sig)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Printf("Shutdown error: %v", err)
	}
}
