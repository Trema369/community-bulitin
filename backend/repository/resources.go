// repository/resources.go
package repository

import (
	"crypto/rand"
	"encoding/hex"

	"com-hub/database"
	"com-hub/models"
)

func generateCode() string {
	b := make([]byte, 4)
	rand.Read(b)
	return hex.EncodeToString(b)
}

func CreateResource(r *models.Resource) error {
	r.Code = generateCode()
	return database.DB.Create(r).Error
}

func AddCard(resourceID uint, front, back string) error {
	return database.DB.Create(&models.FlashcardCard{
		ResourceID: resourceID,
		Front:      front,
		Back:       back,
	}).Error
}

func GetCards(resourceID uint) ([]models.FlashcardCard, error) {
	var cards []models.FlashcardCard
	err := database.DB.Where("resource_id = ?", resourceID).Find(&cards).Error
	return cards, err
}

func GetResources(resourceType string, userID uint) ([]models.Resource, error) {
	var resources []models.Resource
	query := database.DB.Preload("Author")

	if resourceType != "" && resourceType != "all" {
		query = query.Where("type = ?", resourceType)
	}

	if userID != 0 {
		query = query.Where("is_public = ? OR author_id = ?", true, userID)
	} else {
		query = query.Where("is_public = ?", true)
	}

	if err := query.Order("created_at DESC").Find(&resources).Error; err != nil {
		return nil, err
	}

	for i := range resources {
		if resources[i].Type == "flashcard" {
			var count int64
			database.DB.Model(&models.FlashcardCard{}).Where("resource_id = ?", resources[i].ID).Count(&count)
			resources[i].CardCount = int(count)
		}
	}

	return resources, nil
}

func GetMyResources(resourceType string, userID uint) ([]models.Resource, error) {
	var resources []models.Resource
	query := database.DB.Preload("Author").Where("author_id = ?", userID)

	if resourceType != "" && resourceType != "all" {
		query = query.Where("type = ?", resourceType)
	}

	if err := query.Order("created_at DESC").Find(&resources).Error; err != nil {
		return nil, err
	}

	for i := range resources {
		if resources[i].Type == "flashcard" {
			var count int64
			database.DB.Model(&models.FlashcardCard{}).Where("resource_id = ?", resources[i].ID).Count(&count)
			resources[i].CardCount = int(count)
		}
	}

	return resources, nil
}

func GetResourceByID(id uint) (*models.Resource, error) {
	var resource models.Resource
	err := database.DB.Preload("Author").First(&resource, id).Error
	if err != nil {
		return nil, err
	}
	return &resource, nil
}

func GetResourceByCode(code string) (*models.Resource, error) {
	var resource models.Resource
	err := database.DB.Preload("Author").Where("code = ?", code).First(&resource).Error
	if err != nil {
		return nil, err
	}
	return &resource, nil
}

// repository/resources.go — add these functions
func UpdateCard(cardID uint, front, back string) error {
	return database.DB.Model(&models.FlashcardCard{}).
		Where("id = ?", cardID).
		Updates(map[string]interface{}{"front": front, "back": back}).Error
}

func DeleteCard(cardID uint) error {
	return database.DB.Delete(&models.FlashcardCard{}, cardID).Error
}

func GetCard(cardID uint) (*models.FlashcardCard, error) {
	var card models.FlashcardCard
	err := database.DB.First(&card, cardID).Error
	if err != nil {
		return nil, err
	}
	return &card, nil
}
