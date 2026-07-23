// models/vote.go
package models

import "time"

type Vote struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `json:"user_id"`
	PostID    *uint     `json:"post_id"`    // nullable now
	CommentID *uint     `json:"comment_id"` // NEW
	Value     int       `json:"value"`
	CreatedAt time.Time `json:"created_at"`
}
