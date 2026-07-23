package handlers

import (
	"net/http"
	"strconv"

	"com-hub/repository"

	"github.com/gin-gonic/gin"
)

func FollowUserHandler(c *gin.Context) {
	followerID := c.MustGet("userID").(uint)
	idStr := c.Param("id")
	followingID, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid user id"})
		return
	}

	if err := repository.FollowUser(followerID, uint(followingID)); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "followed"})
}

func UnfollowUserHandler(c *gin.Context) {
	followerID := c.MustGet("userID").(uint)
	idStr := c.Param("id")
	followingID, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid user id"})
		return
	}

	if err := repository.UnfollowUser(followerID, uint(followingID)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "failed to unfollow"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "unfollowed"})
}

func GetUserProfileHandler(c *gin.Context) {
	idStr := c.Param("id")
	targetID, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid user id"})
		return
	}

	var viewerID uint
	if uid, exists := c.Get("userID"); exists {
		viewerID = uid.(uint)
	}

	c.JSON(http.StatusOK, gin.H{
		"follower_count":  repository.GetFollowerCount(uint(targetID)),
		"following_count": repository.GetFollowingCount(uint(targetID)),
		"is_following":    viewerID != 0 && repository.IsFollowing(viewerID, uint(targetID)),
	})
}

func GetFollowingListHandler(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	users, err := repository.GetFollowing(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "failed to load"})
		return
	}
	c.JSON(http.StatusOK, users)
}
