package handlers

import (
	"net/http"

	"com-hub/database"
	"com-hub/models"
	"com-hub/repository"

	"github.com/gin-gonic/gin"
)

func GetMyBadgesHandler(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	// re-check the rules on read, so a badge shows up even if it was earned by
	// something that happens outside this user's own requests (someone upvoting
	// their post, or following them)
	repository.EvaluateBadges(userID)

	var userBadges []models.UserBadge
	if err := database.DB.Preload("Badge").Where("user_id = ?", userID).Find(&userBadges).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "failed to load badges"})
		return
	}

	c.JSON(http.StatusOK, userBadges)
}

// GetBadgeProgressHandler returns earned badges plus what's still to play for.
func GetBadgeProgressHandler(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	repository.EvaluateBadges(userID)

	var earned []models.UserBadge
	database.DB.Preload("Badge").Where("user_id = ?", userID).Find(&earned)

	c.JSON(http.StatusOK, gin.H{
		"earned": earned,
		"locked": repository.LockedBadges(userID),
		"stats":  repository.GatherUserStats(userID),
	})
}
