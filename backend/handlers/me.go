// handlers/me.go
package handlers

import (
	"net/http"

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

	c.JSON(http.StatusOK, gin.H{"id": user.ID, "email": user.Email, "name": user.Username})
}
