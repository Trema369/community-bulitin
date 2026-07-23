package models

import "time"

type Follow struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	FollowerID  uint      `json:"follower_id"`  // the user doing the following
	FollowingID uint      `json:"following_id"` // the user being followed
	CreatedAt   time.Time `json:"created_at"`
}
