package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID       string `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	GoogleID string `gorm:"uniqueIndex;not null" json:"-"`
	Email    string `gorm:"uniqueIndex;not null" json:"email"`

	// Null until the user picks one after their first login. Lowercase only,
	// so uniqueness is case-insensitive without extra work.
	Username *string `gorm:"size:20;uniqueIndex;check:user_username_format,username ~ '^[a-z0-9_]{3,20}$'" json:"username"`
	Name     string  `gorm:"not null" json:"name"`
	Image    *string `json:"image"`
	Bio      string  `gorm:"size:200;not null;default:''" json:"bio"`

	FollowerCount  int `gorm:"not null;default:0" json:"followerCount"`
	FollowingCount int `gorm:"not null;default:0" json:"followingCount"`

	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// Follow is a directed edge: Follower follows Followee.
type Follow struct {
	FollowerID string    `gorm:"type:uuid;primaryKey;check:follow_not_self,follower_id <> followee_id" json:"followerId"`
	FolloweeID string    `gorm:"type:uuid;primaryKey;index" json:"followeeId"`
	CreatedAt  time.Time `json:"createdAt"`

	Follower *User `gorm:"constraint:OnDelete:CASCADE" json:"follower,omitempty"`
	Followee *User `gorm:"constraint:OnDelete:CASCADE" json:"followee,omitempty"`
}
