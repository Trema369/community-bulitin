// handlers/resources.go
package handlers

import (
	"net/http"
	"strconv"

	"com-hub/models"
	"com-hub/repository"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

type cardInput struct {
	Front string `json:"front"`
	Back  string `json:"back"`
}

type createResourceRequest struct {
	Type        string      `json:"type" binding:"required,oneof=note flashcard"`
	Title       string      `json:"title" binding:"required"`
	Description string      `json:"description"`
	Content     string      `json:"content"`
	Tags        []string    `json:"tags"`
	IsPublic    bool        `json:"is_public"`
	Cards       []cardInput `json:"cards"`
}

func CreateResourceHandler(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	var req createResourceRequest
	if err := c.ShouldBindBodyWith(&req, binding.JSON); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "incorrect format"})
		return
	}

	resource := models.Resource{
		Type:        req.Type,
		Title:       req.Title,
		Description: req.Description,
		Content:     req.Content,
		Tags:        req.Tags,
		IsPublic:    req.IsPublic,
		AuthorID:    userID,
	}

	if err := repository.CreateResource(&resource); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "failed to create resource"})
		return
	}

	if resource.Type == "flashcard" {
		for _, card := range req.Cards {
			if card.Front == "" || card.Back == "" {
				continue
			}
			repository.AddCard(resource.ID, card.Front, card.Back)
		}
	}

	full, err := repository.GetResourceByID(resource.ID)
	if err != nil {
		c.JSON(http.StatusOK, resource)
		return
	}
	c.JSON(http.StatusOK, full)
}

func GetResourcesHandler(c *gin.Context) {
	resourceType := c.Query("type")
	scope := c.Query("scope") // "mine" or empty (discover)

	var userID uint
	if uid, exists := c.Get("userID"); exists {
		userID = uid.(uint)
	}

	var resources []models.Resource
	var err error

	if scope == "mine" {
		if userID == 0 {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "must be logged in"})
			return
		}
		resources, err = repository.GetMyResources(resourceType, userID)
	} else {
		resources, err = repository.GetResources(resourceType, userID)
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "failed to load resources"})
		return
	}

	c.JSON(http.StatusOK, resources)
}

func GetResourceHandler(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid id"})
		return
	}

	resource, err := repository.GetResourceByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "resource not found"})
		return
	}

	if resource.Type == "flashcard" {
		cards, _ := repository.GetCards(resource.ID)
		c.JSON(http.StatusOK, gin.H{"resource": resource, "cards": cards})
		return
	}

	c.JSON(http.StatusOK, gin.H{"resource": resource})
}

func GetResourceByCodeHandler(c *gin.Context) {
	code := c.Param("code")
	resource, err := repository.GetResourceByCode(code)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "resource not found"})
		return
	}
	c.JSON(http.StatusOK, resource)
}
