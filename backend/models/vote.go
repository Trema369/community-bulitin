package models

import "time"

type Vote struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `json:"user_id"`
	PostID    uint      `json:"post_id"`
	Value     int       `json:"value"` // 1 = upvote, -1 = downvote
	CreatedAt time.Time `json:"created_at"`
}
