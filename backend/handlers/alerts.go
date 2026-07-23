package handlers

import (
	"net/http"
	"strconv"

	"com-hub/models"
	"com-hub/repository"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

type createAlertRequest struct {
	Title       string `json:"title" binding:"required"`
	Description string `json:"description" binding:"required"`
	Category    string `json:"category" binding:"required,oneof=meeting robbery lost_item other"`
	Community   string `json:"community" binding:"required"`
}

func CreateAlertHandler(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	var req createAlertRequest
	if err := c.ShouldBindBodyWith(&req, binding.JSON); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "incorrect format"})
		return
	}

	community, err := repository.GetCommunityByName(req.Community)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "community not found"})
		return
	}

	alert := models.Alert{
		Title:       req.Title,
		Description: req.Description,
		Category:    req.Category,
		AuthorID:    userID,
		CommunityID: community.ID,
	}

	if err := repository.CreateAlert(&alert); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "failed to create alert"})
		return
	}

	full, err := repository.GetAlertByID(alert.ID, userID)
	if err != nil {
		c.JSON(http.StatusOK, alert)
		return
	}
	c.JSON(http.StatusOK, full)
}

func GetAlertsHandler(c *gin.Context) {
	community := c.Query("community")

	var userID uint
	if uid, exists := c.Get("userID"); exists {
		userID = uid.(uint)
	}

	alerts, err := repository.GetAlerts(community, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "failed to load alerts"})
		return
	}

	c.JSON(http.StatusOK, alerts)
}

type voteAlertRequest struct {
	Value int `json:"value" binding:"required,oneof=1 -1"`
}

func VoteAlertHandler(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	idStr := c.Param("id")
	alertID, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid alert id"})
		return
	}

	var req voteAlertRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "value must be 1 or -1"})
		return
	}

	newVote, err := repository.CastAlertVote(userID, uint(alertID), req.Value)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "failed to vote"})
		return
	}

	full, err := repository.GetAlertByID(uint(alertID), userID)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"user_vote": newVote})
		return
	}
	c.JSON(http.StatusOK, gin.H{"score": full.Score, "priority": full.Priority, "user_vote": newVote})
}
