package models

import (
	"time"

	"gorm.io/gorm"
)

type Community struct {
	ID          string `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Name        string `gorm:"size:21;not null;uniqueIndex;check:community_name_format,name ~ '^[a-z0-9_]{3,21}$'" json:"name"`
	Title       string `gorm:"size:100;not null" json:"title"`
	Description string `gorm:"size:500;not null;default:''" json:"description"`

	CreatedByID string `gorm:"type:uuid;not null" json:"createdById"`
	CreatedBy   *User  `gorm:"constraint:OnDelete:RESTRICT" json:"createdBy,omitempty"`

	MemberCount int `gorm:"not null;default:0" json:"memberCount"`

	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

type CommunityRole string

const (
	RoleMember    CommunityRole = "member"
	RoleModerator CommunityRole = "moderator"
	RoleOwner     CommunityRole = "owner"
)

type CommunityMember struct {
	CommunityID string        `gorm:"type:uuid;primaryKey" json:"communityId"`
	UserID      string        `gorm:"type:uuid;primaryKey;index" json:"userId"`
	Role        CommunityRole `gorm:"size:16;not null;default:'member';check:community_member_role,role IN ('member', 'moderator', 'owner')" json:"role"`
	JoinedAt    time.Time     `gorm:"autoCreateTime" json:"joinedAt"`

	Community *Community `gorm:"constraint:OnDelete:CASCADE" json:"community,omitempty"`
	User      *User      `gorm:"constraint:OnDelete:CASCADE" json:"user,omitempty"`
}
