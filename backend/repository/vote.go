// repository/votes.go
package repository

import (
	"com-hub/database"
	"com-hub/models"
)

func CastVote(userID, postID uint, value int) (int, error) {
	// no existing vote is the normal case; Find avoids logging it as an error
	var found []models.Vote
	database.DB.Where("user_id = ? AND post_id = ?", userID, postID).Limit(1).Find(&found)

	if len(found) == 0 {
		v := models.Vote{UserID: userID, PostID: &postID, Value: value}
		if err := database.DB.Create(&v).Error; err != nil {
			return 0, err
		}
		return value, nil
	}

	existing := found[0]

	// voting the same way twice takes the vote back
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
