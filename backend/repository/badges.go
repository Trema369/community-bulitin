package repository

import (
	"com-hub/database"
	"com-hub/models"
)

func AwardBadge(userID uint, badgeKey string) error {
	var badge models.Badge
	if err := database.DB.Where("key = ?", badgeKey).First(&badge).Error; err != nil {
		return err
	}

	var existing models.UserBadge
	err := database.DB.Where("user_id = ? AND badge_id = ?", userID, badge.ID).First(&existing).Error
	if err == nil {
		return nil
	}

	return database.DB.Create(&models.UserBadge{
		UserID:  userID,
		BadgeID: badge.ID,
	}).Error
}
