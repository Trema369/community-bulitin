package models

import "time"

type Vote struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `json:"user_id"`
	PostID    *uint     `json:"post_id"`
	CommentID *uint     `json:"comment_id"`
	AlertID   *uint     `json:"alert_id"`
	Value     int       `json:"value"`
	CreatedAt time.Time `json:"created_at"`
}
