package handlers

import (
	"net/http"

	"com-hub/database"
	"com-hub/models"

	"github.com/gin-gonic/gin"
)

func GetMyBadgesHandler(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	var userBadges []models.UserBadge
	if err := database.DB.Preload("Badge").Where("user_id = ?", userID).Find(&userBadges).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "failed to load badges"})
		return
	}

	c.JSON(http.StatusOK, userBadges)
}
