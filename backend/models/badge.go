package models

import "time"

type Badge struct {
	ID          uint   `gorm:"primaryKey" json:"id"`
	Key         string `gorm:"unique" json:"key"`
	Name        string `json:"name"`
	Description string `json:"description"`
	ImagePath   string `json:"image_path"`
}

type UserBadge struct {
	ID       uint      `gorm:"primaryKey" json:"id"`
	UserID   uint      `json:"user_id"`
	BadgeID  uint      `json:"badge_id"`
	Badge    Badge     `json:"badge"`
	EarnedAt time.Time `json:"earned_at"`
}
