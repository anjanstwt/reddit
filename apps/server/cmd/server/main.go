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
	"reddit/server/internal/database"
	"reddit/server/internal/jobs"
	"reddit/server/internal/router"
	"reddit/server/internal/storage"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatal(err)
	}

	db, err := database.Connect(cfg.DatabaseURL, !cfg.IsProduction())
	if err != nil {
		log.Fatal(err)
	}
	if err := database.Migrate(db); err != nil {
		log.Fatalf("migrate: %v", err)
	}

	storageCtx, cancelStorage := context.WithTimeout(context.Background(), 10*time.Second)
	store, err := storage.New(storageCtx, cfg)
	cancelStorage()
	if err != nil {
		log.Fatal(err)
	}

	jobsCtx, stopJobs := context.WithCancel(context.Background())
	defer stopJobs()
	go jobs.RunMediaCleanup(jobsCtx, db, store)

	srv := &http.Server{
		Addr:              ":" + cfg.Port,
		Handler:           router.New(cfg, db, store),
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
	stopJobs()

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Printf("Shutdown error: %v", err)
	}

	if sqlDB, err := db.DB(); err == nil {
		sqlDB.Close()
	}
}
