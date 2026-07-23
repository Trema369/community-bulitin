package models

import "time"

type Alert struct {
	ID          uint   `gorm:"primaryKey" json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Category    string `json:"category"` // "meeting", "robbery", "lost_item", "other"

	AuthorID uint `json:"-"`
	Author   User `json:"author"`

	CommunityID uint      `json:"-"`
	Community   Community `json:"community"`

	CreatedAt time.Time `json:"created_at"`

	Score    int    `gorm:"-" json:"score"`
	Priority string `gorm:"-" json:"priority"` // "low", "medium", "high", "critical" — derived from Score
	UserVote int    `gorm:"-" json:"user_vote"`
}
