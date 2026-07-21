package database

import "com-hub/models"

func Init() {

	Connect()

	DB.AutoMigrate(&models.User{}, &models.Badge{}, &models.UserBadge{})
	SeedBadges()
}
