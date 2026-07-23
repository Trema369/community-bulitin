package models

import "time"

type Conversation struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserAID   uint      `json:"-"`
	UserBID   uint      `json:"-"`
	UserA     User      `json:"user_a"`
	UserB     User      `json:"user_b"`
	CreatedAt time.Time `json:"created_at"`

	LastMessage *Message `gorm:"-" json:"last_message"`
}

type Message struct {
	ID             uint       `gorm:"primaryKey" json:"id"`
	ConversationID uint       `json:"conversation_id"`
	SenderID       uint       `json:"-"`
	Sender         User       `json:"sender"`
	Content        string     `json:"content"`
	CreatedAt      time.Time  `json:"created_at"`
	ReadAt         *time.Time `json:"read_at"`
}
