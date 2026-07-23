package repository

import (
	"com-hub/database"
	"com-hub/models"
)

func CreateUser(user *models.User) error {
	result := database.DB.Create(user)
	return result.Error
}

func SearchUsers(query string, excludeUserID uint) ([]models.User, error) {
	var users []models.User
	db := database.DB.Where("id != ?", excludeUserID)
	if query != "" {
		db = db.Where("username ILIKE ?", "%"+query+"%")
	}
	err := db.Order("username ASC").Limit(50).Find(&users).Error
	return users, err
}

func GetUserByID(id uint) (*models.User, error) {
	var user models.User
	err := database.DB.First(&user, id).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}
