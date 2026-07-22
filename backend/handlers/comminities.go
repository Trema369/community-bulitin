package handlers

import (
	"net/http"

	"com-hub/repository"

	"github.com/gin-gonic/gin"
)

func GetCommunitiesHandler(c *gin.Context) {
	communities, err := repository.GetAllCommunities()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "failed to load communities"})
		return
	}
	c.JSON(http.StatusOK, communities)
}
