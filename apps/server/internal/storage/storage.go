package storage

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/url"
	"strings"
	"sync"
	"time"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"

	"reddit/server/internal/config"
)

var (
	ErrNotFound    = errors.New("object not found")
	ErrUnavailable = errors.New("storage unavailable")
)

const setupTimeout = 10 * time.Second

type Storage struct {
	client    *minio.Client
	bucket    string
	baseURL   string
	publicURL *url.URL

	mu    sync.Mutex
	ready bool
}

type Upload struct {
	URL       string            `json:"url"`
	Fields    map[string]string `json:"fields"`
	ExpiresAt time.Time         `json:"expiresAt"`
}

type Object struct {
	Size        int64
	ContentType string
}

func New(cfg config.Config) *Storage {
	s := &Storage{
		bucket:  cfg.StorageBucket,
		baseURL: strings.TrimRight(cfg.MediaBaseURL, "/"),
	}
	if cfg.StoragePublicURL != "" {
		public, err := url.Parse(cfg.StoragePublicURL)
		if err != nil || public.Host == "" {
			log.Printf("storage: invalid SERVER_STORAGE_PUBLIC_URL %q, ignoring it", cfg.StoragePublicURL)
		} else {
			s.publicURL = public
		}
	}
	if cfg.StorageAccessKey == "" || cfg.StorageSecretKey == "" {
		log.Printf("storage: no credentials, uploads are disabled")
		return s
	}

	client, err := minio.New(cfg.StorageEndpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(cfg.StorageAccessKey, cfg.StorageSecretKey, ""),
		Secure: cfg.StorageUseSSL,
	})
	if err != nil {
		log.Printf("storage: %v, uploads are disabled", err)
		return s
	}
	s.client = client
	return s
}

func (s *Storage) Ready(ctx context.Context) error {
	if s.client == nil {
		return ErrUnavailable
	}

	s.mu.Lock()
	defer s.mu.Unlock()
	if s.ready {
		return nil
	}

	ctx, cancel := context.WithTimeout(ctx, setupTimeout)
	defer cancel()
	if err := s.setupBucket(ctx); err != nil {
		log.Printf("storage: %v", err)
		return fmt.Errorf("%w: %v", ErrUnavailable, err)
	}
	s.ready = true
	return nil
}

func (s *Storage) setupBucket(ctx context.Context) error {
	exists, err := s.client.BucketExists(ctx, s.bucket)
	if err != nil {
		return fmt.Errorf("bucket check: %w", err)
	}
	if !exists {
		if err := s.client.MakeBucket(ctx, s.bucket, minio.MakeBucketOptions{}); err != nil {
			return fmt.Errorf("create bucket: %w", err)
		}
	}

	policy := fmt.Sprintf(`{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"AWS":["*"]},"Action":["s3:GetObject"],"Resource":["arn:aws:s3:::%s/*"]}]}`, s.bucket)
	if err := s.client.SetBucketPolicy(ctx, s.bucket, policy); err != nil {
		return fmt.Errorf("bucket policy: %w", err)
	}
	return nil
}

func (s *Storage) PresignUpload(ctx context.Context, key, contentType string, maxBytes int64, ttl time.Duration) (*Upload, error) {
	if err := s.Ready(ctx); err != nil {
		return nil, err
	}
	expiresAt := time.Now().Add(ttl)

	policy := minio.NewPostPolicy()
	if err := policy.SetBucket(s.bucket); err != nil {
		return nil, err
	}
	if err := policy.SetKey(key); err != nil {
		return nil, err
	}
	if err := policy.SetExpires(expiresAt); err != nil {
		return nil, err
	}
	if err := policy.SetContentType(contentType); err != nil {
		return nil, err
	}
	if err := policy.SetContentLengthRange(1, maxBytes); err != nil {
		return nil, err
	}

	target, fields, err := s.client.PresignedPostPolicy(ctx, policy)
	if err != nil {
		return nil, err
	}
	if s.publicURL != nil {
		target.Scheme, target.Host = s.publicURL.Scheme, s.publicURL.Host
	}
	return &Upload{URL: target.String(), Fields: fields, ExpiresAt: expiresAt}, nil
}

func (s *Storage) Stat(ctx context.Context, key string) (*Object, error) {
	if err := s.Ready(ctx); err != nil {
		return nil, err
	}
	info, err := s.client.StatObject(ctx, s.bucket, key, minio.StatObjectOptions{})
	if err != nil {
		if minio.ToErrorResponse(err).Code == "NoSuchKey" {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return &Object{Size: info.Size, ContentType: info.ContentType}, nil
}

func (s *Storage) Remove(ctx context.Context, key string) error {
	if err := s.Ready(ctx); err != nil {
		return err
	}
	return s.client.RemoveObject(ctx, s.bucket, key, minio.RemoveObjectOptions{})
}

func (s *Storage) URL(key string) string {
	return s.baseURL + "/" + key
}
