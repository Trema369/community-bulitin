package repository

import (
	"com-hub/database"
	"com-hub/models"
)

func GetAllCommunities() ([]models.Community, error) {
	var communities []models.Community
	err := database.DB.Find(&communities).Error
	return communities, err
}
