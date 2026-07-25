// handlers/me.go
package handlers

import (
	"net/http"
	"strings"

	"com-hub/database"
	"com-hub/models"

	"github.com/gin-gonic/gin"
)

func MeHandler(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "user not found"})
		return
	}

	// key must match /login and /signup — the client reads user.username
	c.JSON(http.StatusOK, gin.H{
		"id": user.ID, "email": user.Email,
		"username": user.Username, "avatar": user.Avatar,
	})
}

type updateMeRequest struct {
	Username *string `json:"username"`
	Avatar   *string `json:"avatar"` // "" clears it back to initials
}

// UpdateMeHandler edits the signed-in user's own profile.
func UpdateMeHandler(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	var req updateMeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "incorrect format"})
		return
	}

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "user not found"})
		return
	}

	if req.Username != nil {
		name := strings.TrimSpace(*req.Username)
		if len(name) < 2 {
			c.JSON(http.StatusBadRequest, gin.H{"message": "username must be at least 2 characters"})
			return
		}
		user.Username = name
	}

	if req.Avatar != nil {
		avatar := strings.TrimSpace(*req.Avatar)
		// only files this server stored — same rule as post media
		if avatar != "" && (!strings.HasPrefix(avatar, "/uploads/") || strings.Contains(avatar, "..")) {
			c.JSON(http.StatusBadRequest, gin.H{"message": "invalid avatar url"})
			return
		}
		user.Avatar = avatar
	}

	if err := database.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "failed to save profile"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id": user.ID, "email": user.Email,
		"username": user.Username, "avatar": user.Avatar,
	})
}
