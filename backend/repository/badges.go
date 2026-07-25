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

	// Find rather than First: a missing row is the normal case here, and First
	// logs it as an error on every check.
	var existing []models.UserBadge
	database.DB.Where("user_id = ? AND badge_id = ?", userID, badge.ID).Limit(1).Find(&existing)
	if len(existing) > 0 {
		return nil
	}

	return database.DB.Create(&models.UserBadge{
		UserID:  userID,
		BadgeID: badge.ID,
	}).Error
}
