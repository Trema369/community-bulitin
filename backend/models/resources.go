// models/resource.go
package models

import (
	"time"

	"github.com/lib/pq"
)

type Resource struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	Type        string         `json:"type"` // "note" or "flashcard"
	Title       string         `json:"title"`
	Description string         `json:"description"`
	Content     string         `json:"content"` // markdown, notes only
	Tags        pq.StringArray `gorm:"type:text[]" json:"tags"`
	IsPublic    bool           `json:"is_public"`
	Code        string         `gorm:"unique" json:"code"` // share code, any type

	AuthorID uint `json:"-"`
	Author   User `json:"author"`

	CreatedAt time.Time `json:"created_at"`

	CardCount int `gorm:"-" json:"card_count"`
}

type FlashcardCard struct {
	ID         uint   `gorm:"primaryKey" json:"id"`
	ResourceID uint   `json:"resource_id"`
	Front      string `json:"front"`
	Back       string `json:"back"`
}
