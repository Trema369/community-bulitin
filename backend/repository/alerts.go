package repository

import (
	"com-hub/database"
	"com-hub/models"
)

func priorityFromScore(score int) string {
	switch {
	case score >= 20:
		return "critical"
	case score >= 10:
		return "high"
	case score >= 3:
		return "medium"
	default:
		return "low"
	}
}

func CreateAlert(alert *models.Alert) error {
	return database.DB.Create(alert).Error
}

func GetAlertByID(id uint, userID uint) (*models.Alert, error) {
	var alert models.Alert
	err := database.DB.Preload("Author").Preload("Community").First(&alert, id).Error
	if err != nil {
		return nil, err
	}
	enrichAlert(&alert, userID)
	return &alert, nil
}

func GetAlerts(communityName string, userID uint) ([]models.Alert, error) {
	var alerts []models.Alert
	query := database.DB.Preload("Author").Preload("Community").Order("created_at DESC")

	if communityName != "" {
		query = query.Joins("JOIN communities ON communities.id = alerts.community_id").
			Where("communities.name = ?", communityName)
	}

	if err := query.Find(&alerts).Error; err != nil {
		return nil, err
	}

	for i := range alerts {
		enrichAlert(&alerts[i], userID)
	}

	return alerts, nil
}

func enrichAlert(a *models.Alert, userID uint) {
	var score int
	database.DB.Model(&models.Vote{}).Where("alert_id = ?", a.ID).Select("COALESCE(SUM(value), 0)").Scan(&score)
	a.Score = score
	a.Priority = priorityFromScore(score)

	if userID != 0 {
		var vote models.Vote
		err := database.DB.Where("user_id = ? AND alert_id = ?", userID, a.ID).First(&vote).Error
		if err == nil {
			a.UserVote = vote.Value
		}
	}
}

func CastAlertVote(userID, alertID uint, value int) (int, error) {
	var existing models.Vote
	err := database.DB.Where("user_id = ? AND alert_id = ?", userID, alertID).First(&existing).Error
	if err != nil {
		v := models.Vote{UserID: userID, AlertID: &alertID, Value: value}
		if err := database.DB.Create(&v).Error; err != nil {
			return 0, err
		}
		return value, nil
	}

	if existing.Value == value {
		if err := database.DB.Delete(&existing).Error; err != nil {
			return 0, err
		}
		return 0, nil
	}

	existing.Value = value
	if err := database.DB.Save(&existing).Error; err != nil {
		return 0, err
	}
	return value, nil
}
