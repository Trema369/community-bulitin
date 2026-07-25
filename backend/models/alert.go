package models

import "time"

// Alert covers both urgent notices and planned community announcements. They
// share a shape — title, community, votes — so they share a table; Kind decides
// which surface an entry appears on.
type Alert struct {
	ID   uint   `gorm:"primaryKey" json:"id"`
	Kind string `gorm:"default:alert" json:"kind"` // "alert" or "announcement"

	Title       string `json:"title"`
	Description string `json:"description"`
	// alerts: "meeting", "robbery", "lost_item", "other"
	// announcements: "cleanup", "event", "youth", "meeting", "other"
	Category string `json:"category"`

	// announcements are things that happen at a time and place
	EventDate *time.Time `json:"event_date"`
	Location  string     `json:"location"`

	AuthorID uint `json:"-"`
	Author   User `json:"author"`

	CommunityID uint      `json:"-"`
	Community   Community `json:"community"`

	CreatedAt time.Time `json:"created_at"`

	Score    int    `gorm:"-" json:"score"`
	Priority string `gorm:"-" json:"priority"` // "low", "medium", "high", "critical" — derived from Score
	UserVote int    `gorm:"-" json:"user_vote"`
}
