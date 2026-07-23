package models

import "time"

type Community struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Name        string    `gorm:"unique" json:"name"`
	Description string    `json:"description"`
	CreatorID   uint      `json:"-"`
	Creator     User      `json:"creator"`
	CreatedAt   time.Time `json:"created_at"`

	MemberCount int  `gorm:"-" json:"member_count"`
	IsMember    bool `gorm:"-" json:"is_member"`
}

type CommunityMember struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	UserID      uint      `json:"user_id"`
	CommunityID uint      `json:"community_id"`
	JoinedAt    time.Time `json:"joined_at"`
}
