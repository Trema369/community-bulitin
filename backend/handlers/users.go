package handlers

import (
	"net/http"
	"strconv"

	"com-hub/repository"

	"github.com/gin-gonic/gin"
)

func SearchUsersHandler(c *gin.Context) {
	query := c.Query("q")

	var userID uint
	if uid, exists := c.Get("userID"); exists {
		userID = uid.(uint)
	}

	users, err := repository.SearchUsers(query, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "failed to search users"})
		return
	}

	// strip sensitive fields before returning
	result := make([]gin.H, len(users))
	for i, u := range users {
		result[i] = gin.H{"id": u.ID, "username": u.Username, "email": u.Email}
	}
	c.JSON(http.StatusOK, result)
}

func GetUserByIDHandler(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid user id"})
		return
	}

	user, err := repository.GetUserByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "user not found"})
		return
	}

	var viewerID uint
	if uid, exists := c.Get("userID"); exists {
		viewerID = uid.(uint)
	}

	c.JSON(http.StatusOK, gin.H{
		"id":              user.ID,
		"username":        user.Username,
		"follower_count":  repository.GetFollowerCount(user.ID),
		"following_count": repository.GetFollowingCount(user.ID),
		"is_following":    viewerID != 0 && viewerID != user.ID && repository.IsFollowing(viewerID, user.ID),
		"is_self":         viewerID == user.ID,
	})
}
