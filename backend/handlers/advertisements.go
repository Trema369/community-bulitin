package handlers

import (
	"net/http"
	"time"

	"com-hub/models"
	"com-hub/repository"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

type createAdRequest struct {
	Title       string  `json:"title" binding:"required"`
	Description string  `json:"description" binding:"required"`
	Category    string  `json:"category" binding:"required,oneof=job sale service event other"`
	ContactInfo string  `json:"contact_info" binding:"required"`
	Link        string  `json:"link"`
	Community   string  `json:"community" binding:"required"`
	ExpiresAt   *string `json:"expires_at"` // ISO date string, optional
}

func CreateAdvertisementHandler(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	var req createAdRequest
	if err := c.ShouldBindBodyWith(&req, binding.JSON); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "incorrect format"})
		return
	}

	community, err := repository.GetCommunityByName(req.Community)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "community not found"})
		return
	}

	var expiresAt *time.Time
	if req.ExpiresAt != nil && *req.ExpiresAt != "" {
		parsed, err := time.Parse("2006-01-02", *req.ExpiresAt)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"message": "invalid expires_at format, use YYYY-MM-DD"})
			return
		}
		expiresAt = &parsed
	}

	ad := models.Advertisement{
		Title:       req.Title,
		Description: req.Description,
		Category:    req.Category,
		ContactInfo: req.ContactInfo,
		Link:        req.Link,
		AuthorID:    userID,
		CommunityID: community.ID,
		ExpiresAt:   expiresAt,
	}

	if err := repository.CreateAdvertisement(&ad); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "failed to create advertisement"})
		return
	}

	full, err := repository.GetAdvertisementByID(ad.ID)
	if err != nil {
		c.JSON(http.StatusOK, ad)
		return
	}
	c.JSON(http.StatusOK, full)
}

func GetAdvertisementsHandler(c *gin.Context) {
	category := c.Query("category")
	community := c.Query("community")

	ads, err := repository.GetAdvertisements(category, community)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "failed to load advertisements"})
		return
	}

	c.JSON(http.StatusOK, ads)
}
