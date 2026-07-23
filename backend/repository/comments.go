// repository/comments.go
package repository

import (
	"com-hub/database"
	"com-hub/models"
)

func CreateComment(comment *models.Comment) error {
	return database.DB.Create(comment).Error
}

func GetCommentsByPost(postID uint, userID uint) ([]models.Comment, error) {
	var comments []models.Comment
	err := database.DB.
		Preload("Author").
		Where("post_id = ?", postID).
		Order("created_at ASC").
		Find(&comments).Error
	if err != nil {
		return nil, err
	}

	for i := range comments {
		comments[i].Score = getCommentScore(comments[i].ID)
		if userID != 0 {
			comments[i].UserVote = getUserCommentVote(userID, comments[i].ID)
		}
	}

	return comments, nil
}

func GetCommentCount(postID uint) int {
	var count int64
	database.DB.Model(&models.Comment{}).Where("post_id = ?", postID).Count(&count)
	return int(count)
}

func getCommentScore(commentID uint) int {
	var score int
	database.DB.Model(&models.Vote{}).Where("comment_id = ?", commentID).Select("COALESCE(SUM(value), 0)").Scan(&score)
	return score
}

func getUserCommentVote(userID, commentID uint) int {
	var vote models.Vote
	err := database.DB.Where("user_id = ? AND comment_id = ?", userID, commentID).First(&vote).Error
	if err != nil {
		return 0
	}
	return vote.Value
}

func CastCommentVote(userID, commentID uint, value int) (int, error) {
	var existing models.Vote
	err := database.DB.Where("user_id = ? AND comment_id = ?", userID, commentID).First(&existing).Error
	if err != nil {
		v := models.Vote{UserID: userID, CommentID: &commentID, Value: value}
		if err := database.DB.Create(&v).Error; err != nil {
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
