package handlers

import (
	"errors"
	"net/http"
	"strconv"
	"strings"
	"time"

	"com-hub/models"
	"com-hub/repository"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

type createAlertRequest struct {
	Kind        string `json:"kind" binding:"omitempty,oneof=alert announcement"`
	Title       string `json:"title" binding:"required"`
	Description string `json:"description" binding:"required"`
	Category    string `json:"category" binding:"required"`
	Community   string `json:"community" binding:"required"`
	EventDate   string `json:"event_date"` // RFC3339 or YYYY-MM-DD, announcements only
	Location    string `json:"location"`
}

// each kind accepts its own set of categories
var categoriesByKind = map[string][]string{
	"alert":        {"meeting", "robbery", "lost_item", "other"},
	"announcement": {"cleanup", "event", "youth", "meeting", "other"},
}

func validCategory(kind, category string) bool {
	for _, allowed := range categoriesByKind[kind] {
		if allowed == category {
			return true
		}
	}
	return false
}

// parseEventDate accepts a full timestamp or a plain calendar date.
func parseEventDate(raw string) (*time.Time, error) {
	if strings.TrimSpace(raw) == "" {
		return nil, nil
	}
	for _, layout := range []string{time.RFC3339, "2006-01-02T15:04", "2006-01-02"} {
		if t, err := time.Parse(layout, raw); err == nil {
			return &t, nil
		}
	}
	return nil, errors.New("event date must look like 2026-07-30 or 2026-07-30T14:00")
}

func CreateAlertHandler(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	var req createAlertRequest
	if err := c.ShouldBindBodyWith(&req, binding.JSON); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "incorrect format"})
		return
	}

	kind := req.Kind
	if kind == "" {
		kind = "alert"
	}
	if !validCategory(kind, req.Category) {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "that category isn't valid for a " + kind,
		})
		return
	}

	eventDate, err := parseEventDate(req.EventDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	community, err := repository.GetCommunityByName(req.Community)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "community not found"})
		return
	}

	alert := models.Alert{
		Kind:        kind,
		Title:       req.Title,
		Description: req.Description,
		Category:    req.Category,
		EventDate:   eventDate,
		Location:    req.Location,
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
	kind := c.Query("kind") // "alert", "announcement", or empty for both

	var userID uint
	if uid, exists := c.Get("userID"); exists {
		userID = uid.(uint)
	}

	alerts, err := repository.GetAlerts(community, kind, userID)
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
