package models

import "time"

type User struct {
	ID        string    `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	GoogleID  string    `gorm:"uniqueIndex;not null" json:"-"`
	Email     string    `gorm:"uniqueIndex;not null" json:"email"`
	Name      string    `gorm:"not null" json:"name"`
	Image     *string   `json:"image"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}
