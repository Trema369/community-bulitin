package handlers

import (
	"net/http"

	"com-hub/repository"

	"github.com/gin-gonic/gin"
)

func SearchHandler(c *gin.Context) {
	query := c.Query("q")
	if query == "" {
		c.JSON(http.StatusOK, repository.SearchResults{})
		return
	}

	var userID uint
	if uid, exists := c.Get("userID"); exists {
		userID = uid.(uint)
	}

	results := repository.Search(query, userID)
	c.JSON(http.StatusOK, results)
}
