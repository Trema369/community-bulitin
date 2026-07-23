// repository/posts.go
package repository

import (
	"com-hub/database"
	"com-hub/models"
)

func CreatePost(post *models.Post) error {
	return database.DB.Create(post).Error
}

// repository/posts.go — update enrichPost
func enrichPost(post *models.Post, userID uint) {
	post.Score = GetPostScore(post.ID)
	post.CommentCount = GetCommentCount(post.ID) // was hardcoded 0 before
	if userID != 0 {
		post.UserVote = GetUserVote(userID, post.ID)
	}
}

func GetFeed(limit, offset int, userID uint) ([]models.Post, error) {
	var posts []models.Post
	err := database.DB.
		Preload("Author").
		Preload("Community").
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&posts).Error

	for i := range posts {
		enrichPost(&posts[i], userID)
	}

	return posts, err
}

func GetPostByID(id uint, userID uint) (*models.Post, error) {
	var post models.Post
	err := database.DB.
		Preload("Author").
		Preload("Community").
		First(&post, id).Error
	if err != nil {
		return nil, err
	}
	enrichPost(&post, userID)
	return &post, nil
}
