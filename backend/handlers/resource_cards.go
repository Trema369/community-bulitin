package handlers

import (
	"net/http"
	"strconv"

	"com-hub/repository"

	"github.com/gin-gonic/gin"
)

type cardBody struct {
	Front string `json:"front" binding:"required"`
	Back  string `json:"back" binding:"required"`
}

func requireOwner(c *gin.Context, resourceIDStr string) (uint, bool) {
	userID := c.MustGet("userID").(uint)

	resourceID, err := strconv.ParseUint(resourceIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid resource id"})
		return 0, false
	}

	resource, err := repository.GetResourceByID(uint(resourceID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "resource not found"})
		return 0, false
	}

	if resource.AuthorID != userID {
		c.JSON(http.StatusForbidden, gin.H{"message": "not the owner"})
		return 0, false
	}

	return uint(resourceID), true
}

func AddCardHandler(c *gin.Context) {
	resourceID, ok := requireOwner(c, c.Param("id"))
	if !ok {
		return
	}

	var body cardBody
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "front and back are required"})
		return
	}

	if err := repository.AddCard(resourceID, body.Front, body.Back); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "failed to add card"})
		return
	}

	cards, _ := repository.GetCards(resourceID)
	c.JSON(http.StatusOK, cards)
}

func UpdateCardHandler(c *gin.Context) {
	_, ok := requireOwner(c, c.Param("id"))
	if !ok {
		return
	}

	cardID, err := strconv.ParseUint(c.Param("cardId"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid card id"})
		return
	}

	var body cardBody
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "front and back are required"})
		return
	}

	if err := repository.UpdateCard(uint(cardID), body.Front, body.Back); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "failed to update card"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "updated"})
}

func DeleteCardHandler(c *gin.Context) {
	_, ok := requireOwner(c, c.Param("id"))
	if !ok {
		return
	}

	cardID, err := strconv.ParseUint(c.Param("cardId"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid card id"})
		return
	}

	if err := repository.DeleteCard(uint(cardID)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "failed to delete card"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "deleted"})
}
