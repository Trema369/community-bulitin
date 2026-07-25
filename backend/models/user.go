package models

import "time"

type User struct {
	ID        uint   `gorm:"primaryKey" json:"id"`
	Username  string `json:"username"`
	Email     string `gorm:"unique" json:"email"`
	Password  string `json:"-"` // never leaves the server — User is embedded in Post.Author etc.
	Avatar    string `json:"avatar"`
	CreatedAt time.Time
	UpdatedAt time.Time
}
