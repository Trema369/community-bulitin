package models

import "time"

type Community struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Name        string    `gorm:"unique" json:"name"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
}
