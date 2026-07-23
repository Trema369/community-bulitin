package models

import "time"

type Advertisement struct {
	ID          uint   `gorm:"primaryKey" json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Category    string `json:"category"` // "job", "sale", "service", "event", "other"
	ContactInfo string `json:"contact_info"`
	Link        string `json:"link"`

	AuthorID uint `json:"-"`
	Author   User `json:"author"`

	CommunityID uint      `json:"-"`
	Community   Community `json:"community"`

	ExpiresAt *time.Time `json:"expires_at"` // nil = never expires
	CreatedAt time.Time  `json:"created_at"`

	IsExpired bool `gorm:"-" json:"is_expired"` // computed
}
