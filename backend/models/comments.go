package models

import "time"

type Comment struct {
	ID       uint `gorm:"primaryKey" json:"id"`
	PostID   uint `json:"post_id"`
	AuthorID uint `json:"-"`
	Author   User `json:"author"`

	ParentID  *uint     `json:"parent_id"` // nil = top-level comment
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`

	Score    int `gorm:"-" json:"score"`
	UserVote int `gorm:"-" json:"user_vote"`
}
