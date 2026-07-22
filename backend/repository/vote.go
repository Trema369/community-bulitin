// repository/votes.go
package repository

import (
	"com-hub/database"
	"com-hub/models"
)

func CastVote(userID, postID uint, value int) (int, error) {
	var existing models.Vote
	err := database.DB.Where("user_id = ? AND post_id = ?", userID, postID).First(&existing).Error

	if err != nil {
		if err := database.DB.Create(&models.Vote{UserID: userID, PostID: postID, Value: value}).Error; err != nil {
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

func GetPostScore(postID uint) int {
	var score int
	database.DB.Model(&models.Vote{}).Where("post_id = ?", postID).Select("COALESCE(SUM(value), 0)").Scan(&score)
	return score
}

func GetUserVote(userID, postID uint) int {
	var vote models.Vote
	err := database.DB.Where("user_id = ? AND post_id = ?", userID, postID).First(&vote).Error
	if err != nil {
		return 0
	}
	return vote.Value
}
