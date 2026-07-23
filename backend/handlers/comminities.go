package handlers

import (
	"net/http"
	"strconv"

	"com-hub/models"
	"com-hub/repository"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

type createCommunityRequest struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
}

func CreateCommunityHandler(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	var req createCommunityRequest
	if err := c.ShouldBindBodyWith(&req, binding.JSON); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "incorrect format"})
		return
	}

	community := models.Community{
		Name:        req.Name,
		Description: req.Description,
		CreatorID:   userID,
	}

	if err := repository.CreateCommunity(&community); err != nil {
		c.JSON(http.StatusConflict, gin.H{"message": "community already exists"})
		return
	}

	// creator auto-joins their own community
	repository.JoinCommunity(userID, community.ID)

	c.JSON(http.StatusOK, community)
}

func GetCommunitiesHandler(c *gin.Context) {
	var userID uint
	if uid, exists := c.Get("userID"); exists {
		userID = uid.(uint)
	}

	communities, err := repository.GetAllCommunities(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "failed to load communities"})
		return
	}
	c.JSON(http.StatusOK, communities)
}

func JoinCommunityHandler(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	idStr := c.Param("id")
	communityID, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid community id"})
		return
	}

	if err := repository.JoinCommunity(userID, uint(communityID)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "failed to join"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "joined"})
}

func LeaveCommunityHandler(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	idStr := c.Param("id")
	communityID, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid community id"})
		return
	}

	if err := repository.LeaveCommunity(userID, uint(communityID)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "failed to leave"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "left"})
}
