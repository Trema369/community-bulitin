package repository

import (
	"com-hub/database"
	"com-hub/models"
)

func CreateUser(user *models.User) error {
	result := database.DB.Create(user)
	return result.Error
}
