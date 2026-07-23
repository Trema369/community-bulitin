package repository

import (
	"com-hub/database"
	"com-hub/models"
)

func GetOrCreateConversation(userID1, userID2 uint) (*models.Conversation, error) {
	a, b := userID1, userID2
	if a > b {
		a, b = b, a
	}

	var convo models.Conversation
	err := database.DB.Where("user_a_id = ? AND user_b_id = ?", a, b).First(&convo).Error
	if err == nil {
		return &convo, nil
	}

	convo = models.Conversation{UserAID: a, UserBID: b}
	if err := database.DB.Create(&convo).Error; err != nil {
		return nil, err
	}
	return &convo, nil
}

func GetConversationsForUser(userID uint) ([]models.Conversation, error) {
	var convos []models.Conversation
	err := database.DB.
		Preload("UserA").
		Preload("UserB").
		Where("user_a_id = ? OR user_b_id = ?", userID, userID).
		Order("created_at DESC").
		Find(&convos).Error
	if err != nil {
		return nil, err
	}

	for i := range convos {
		var last models.Message
		err := database.DB.Where("conversation_id = ?", convos[i].ID).Order("created_at DESC").First(&last).Error
		if err == nil {
			convos[i].LastMessage = &last
		}
	}

	return convos, nil
}

func SendMessage(conversationID, senderID uint, content string) (*models.Message, error) {
	msg := models.Message{
		ConversationID: conversationID,
		SenderID:       senderID,
		Content:        content,
	}
	if err := database.DB.Create(&msg).Error; err != nil {
		return nil, err
	}
	database.DB.Preload("Sender").First(&msg, msg.ID)
	return &msg, nil
}

func GetMessages(conversationID uint) ([]models.Message, error) {
	var messages []models.Message
	err := database.DB.
		Preload("Sender").
		Where("conversation_id = ?", conversationID).
		Order("created_at ASC").
		Find(&messages).Error
	return messages, err
}

func IsParticipant(userID, conversationID uint) bool {
	var convo models.Conversation
	err := database.DB.Where("id = ? AND (user_a_id = ? OR user_b_id = ?)", conversationID, userID, userID).First(&convo).Error
	return err == nil
}
