// repository/communities.go
package repository

import (
	"com-hub/database"
	"com-hub/models"
)

func CreateCommunity(community *models.Community) error {
	return database.DB.Create(community).Error
}

func GetAllCommunities(userID uint) ([]models.Community, error) {
	var communities []models.Community
	if err := database.DB.Preload("Creator").Order("created_at DESC").Find(&communities).Error; err != nil {
		return nil, err
	}
	for i := range communities {
		enrichCommunity(&communities[i], userID)
	}
	return communities, nil
}

func GetCommunityByName(name string) (*models.Community, error) {
	var community models.Community
	err := database.DB.Where("name = ?", name).First(&community).Error
	if err != nil {
		return nil, err
	}
	return &community, nil
}

func JoinCommunity(userID, communityID uint) error {
	member := models.CommunityMember{UserID: userID, CommunityID: communityID}
	return database.DB.Where(member).FirstOrCreate(&member).Error
}

func LeaveCommunity(userID, communityID uint) error {
	return database.DB.Where("user_id = ? AND community_id = ?", userID, communityID).Delete(&models.CommunityMember{}).Error
}

func enrichCommunity(c *models.Community, userID uint) {
	var count int64
	database.DB.Model(&models.CommunityMember{}).Where("community_id = ?", c.ID).Count(&count)
	c.MemberCount = int(count)

	if userID != 0 {
		var existing models.CommunityMember
		err := database.DB.Where("user_id = ? AND community_id = ?", userID, c.ID).First(&existing).Error
		c.IsMember = err == nil
	}
}
