package repository

import (
	"errors"

	"com-hub/database"
	"com-hub/models"
)

func FollowUser(followerID, followingID uint) error {
	if followerID == followingID {
		return errors.New("cannot follow yourself")
	}
	f := models.Follow{FollowerID: followerID, FollowingID: followingID}
	return database.DB.Where(f).FirstOrCreate(&f).Error
}

func UnfollowUser(followerID, followingID uint) error {
	return database.DB.Where("follower_id = ? AND following_id = ?", followerID, followingID).Delete(&models.Follow{}).Error
}

func IsFollowing(followerID, followingID uint) bool {
	var f models.Follow
	err := database.DB.Where("follower_id = ? AND following_id = ?", followerID, followingID).First(&f).Error
	return err == nil
}

func GetFollowerCount(userID uint) int {
	var count int64
	database.DB.Model(&models.Follow{}).Where("following_id = ?", userID).Count(&count)
	return int(count)
}

func GetFollowingCount(userID uint) int {
	var count int64
	database.DB.Model(&models.Follow{}).Where("follower_id = ?", userID).Count(&count)
	return int(count)
}

func GetFollowing(userID uint) ([]models.User, error) {
	var users []models.User
	err := database.DB.
		Joins("JOIN follows ON follows.following_id = users.id").
		Where("follows.follower_id = ?", userID).
		Find(&users).Error
	return users, err
}

func GetFollowers(userID uint) ([]models.User, error) {
	var users []models.User
	err := database.DB.
		Joins("JOIN follows ON follows.follower_id = users.id").
		Where("follows.following_id = ?", userID).
		Find(&users).Error
	return users, err
}
