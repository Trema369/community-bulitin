package models

import "time"

type User struct {
	ID        uint   `gorm:"primaryKey" json:"id"`
	Username  string `json:"username"`
	Email     string `gorm:"unique" json:"email"`
	Password  string `json:"password"`
	CreatedAt time.Time
	UpdatedAt time.Time
}
