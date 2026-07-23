package repository

import (
	"com-hub/database"
	"com-hub/models"
)

type SearchResults struct {
	Posts       []models.Post      `json:"posts"`
	Alerts      []models.Alert     `json:"alerts"`
	Users       []models.User      `json:"users"`
	Communities []models.Community `json:"communities"`
}

func Search(query string, userID uint) SearchResults {
	var posts []models.Post
	database.DB.Preload("Author").Preload("Community").
		Where("title ILIKE ? OR content ILIKE ?", "%"+query+"%", "%"+query+"%").
		Order("created_at DESC").Limit(5).Find(&posts)
	for i := range posts {
		enrichPost(&posts[i], userID)
	}

	var alerts []models.Alert
	database.DB.Preload("Author").Preload("Community").
		Where("title ILIKE ? OR description ILIKE ?", "%"+query+"%", "%"+query+"%").
		Order("created_at DESC").Limit(5).Find(&alerts)
	for i := range alerts {
		enrichAlert(&alerts[i], userID)
	}

	var users []models.User
	database.DB.Where("username ILIKE ?", "%"+query+"%").Limit(5).Find(&users)

	var communities []models.Community
	database.DB.Preload("Creator").
		Where("name ILIKE ? OR description ILIKE ?", "%"+query+"%", "%"+query+"%").
		Limit(5).Find(&communities)
	for i := range communities {
		EnrichCommunity(&communities[i], userID)
	}

	return SearchResults{
		Posts:       posts,
		Alerts:      alerts,
		Users:       users,
		Communities: communities,
	}
}
