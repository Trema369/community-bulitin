package repository

import (
	"time"

	"com-hub/database"
	"com-hub/models"
)

func CreateAdvertisement(ad *models.Advertisement) error {
	return database.DB.Create(ad).Error
}

func GetAdvertisementByID(id uint) (*models.Advertisement, error) {
	var ad models.Advertisement
	err := database.DB.Preload("Author").Preload("Community").First(&ad, id).Error
	if err != nil {
		return nil, err
	}
	enrichAd(&ad)
	return &ad, nil
}

func GetAdvertisements(category string, communityName string) ([]models.Advertisement, error) {
	var ads []models.Advertisement
	query := database.DB.Preload("Author").Preload("Community").Order("created_at DESC")

	if category != "" {
		query = query.Where("category = ?", category)
	}
	if communityName != "" {
		query = query.Joins("JOIN communities ON communities.id = advertisements.community_id").
			Where("communities.name = ?", communityName)
	}

	if err := query.Find(&ads).Error; err != nil {
		return nil, err
	}

	for i := range ads {
		enrichAd(&ads[i])
	}

	return ads, nil
}

func enrichAd(ad *models.Advertisement) {
	ad.IsExpired = ad.ExpiresAt != nil && ad.ExpiresAt.Before(time.Now())
}
