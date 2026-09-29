package storage

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"

	"reddit/server/internal/config"
)

var ErrNotFound = errors.New("object not found")

type Storage struct {
	client  *minio.Client
	bucket  string
	baseURL string
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

func New(ctx context.Context, cfg config.Config) (*Storage, error) {
	client, err := minio.New(cfg.StorageEndpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(cfg.StorageAccessKey, cfg.StorageSecretKey, ""),
		Secure: cfg.StorageUseSSL,
	})
	if err != nil {
		return nil, fmt.Errorf("storage client: %w", err)
	}

	exists, err := client.BucketExists(ctx, cfg.StorageBucket)
	if err != nil {
		return nil, fmt.Errorf("storage bucket check: %w", err)
	}
	if !exists {
		if err := client.MakeBucket(ctx, cfg.StorageBucket, minio.MakeBucketOptions{}); err != nil {
			return nil, fmt.Errorf("storage create bucket: %w", err)
		}
	}

	policy := fmt.Sprintf(`{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"AWS":["*"]},"Action":["s3:GetObject"],"Resource":["arn:aws:s3:::%s/*"]}]}`, cfg.StorageBucket)
	if err := client.SetBucketPolicy(ctx, cfg.StorageBucket, policy); err != nil {
		return nil, fmt.Errorf("storage bucket policy: %w", err)
	}

	return &Storage{
		client:  client,
		bucket:  cfg.StorageBucket,
		baseURL: strings.TrimRight(cfg.MediaBaseURL, "/"),
	}, nil
}

func (s *Storage) PresignUpload(ctx context.Context, key, contentType string, maxBytes int64, ttl time.Duration) (*Upload, error) {
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

	url, fields, err := s.client.PresignedPostPolicy(ctx, policy)
	if err != nil {
		return nil, err
	}
	return &Upload{URL: url.String(), Fields: fields, ExpiresAt: expiresAt}, nil
}

func (s *Storage) Stat(ctx context.Context, key string) (*Object, error) {
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
	return s.client.RemoveObject(ctx, s.bucket, key, minio.RemoveObjectOptions{})
}

func (s *Storage) URL(key string) string {
	return s.baseURL + "/" + key
}
