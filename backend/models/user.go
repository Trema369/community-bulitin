package models

import "time"

type User struct {
	ID        uint   `gorm:"primaryKey" json:"id"`
	Name      string `json:"name"`
	Email     string `gorm:"unique" json:"email"`
	Password  string
	CreatedAt time.Time
	UpdatedAt time.Time
}
