// models/post.go
package models

import (
	"time"

	"github.com/lib/pq"
)

type Post struct {
	ID      uint           `gorm:"primaryKey" json:"id"`
	Title   string         `json:"title"`
	Content string         `json:"content"`
	Tags    pq.StringArray `gorm:"type:text[]" json:"tags"`

	AuthorID uint `json:"-"`
	Author   User `json:"author"`

	CommunityID uint      `json:"-"`
	Community   Community `json:"community"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	Score        int `gorm:"-" json:"score"`
	ViewCount    int `gorm:"-" json:"view_count"`
	CommentCount int `gorm:"-" json:"comment_count"`
	//	Media []PostMedia `json:"media" gorm:"foreignKey:PostID"`

	UserVote int `gorm:"-" json:"user_vote"`
}
