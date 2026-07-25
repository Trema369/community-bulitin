package handlers

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"com-hub/models"
	"com-hub/repository"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

const (
	maxCommunityRules   = 10
	maxCommunityRuleLen = 200
)

type createCommunityRequest struct {
	Name        string   `json:"name" binding:"required"`
	Description string   `json:"description"`
	Rules       []string `json:"rules"`
}

type updateRulesRequest struct {
	Rules []string `json:"rules"`
}

// sanitizeRules drops blanks, trims whitespace, and enforces the count/length caps.
func sanitizeRules(rules []string) ([]string, error) {
	cleaned := make([]string, 0, len(rules))
	for _, rule := range rules {
		rule = strings.TrimSpace(rule)
		if rule == "" {
			continue
		}
		if len(rule) > maxCommunityRuleLen {
			return nil, fmt.Errorf("each rule must be under %d characters", maxCommunityRuleLen)
		}
		cleaned = append(cleaned, rule)
	}
	if len(cleaned) > maxCommunityRules {
		return nil, fmt.Errorf("a community can have at most %d rules", maxCommunityRules)
	}
	return cleaned, nil
}

func CreateCommunityHandler(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	var req createCommunityRequest
	if err := c.ShouldBindBodyWith(&req, binding.JSON); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "incorrect format"})
		return
	}

	rules, err := sanitizeRules(req.Rules)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	community := models.Community{
		Name:        req.Name,
		Description: req.Description,
		Rules:       rules,
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

// UpdateCommunityRulesHandler replaces a community's rule list. Creator only —
// there's no moderator concept yet, so the creator is the only editor.
func UpdateCommunityRulesHandler(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	idStr := c.Param("id")
	communityID, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid community id"})
		return
	}

	community, err := repository.GetCommunityByID(uint(communityID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "community not found"})
		return
	}
	if community.CreatorID != userID {
		c.JSON(http.StatusForbidden, gin.H{"message": "only the community creator can edit rules"})
		return
	}

	var req updateRulesRequest
	if err := c.ShouldBindBodyWith(&req, binding.JSON); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "incorrect format"})
		return
	}
	rules, err := sanitizeRules(req.Rules)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	if err := repository.UpdateCommunityRules(community.ID, rules); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "failed to update rules"})
		return
	}

	community.Rules = rules
	repository.EnrichCommunity(community, userID)
	c.JSON(http.StatusOK, community)
}

func GetCommunityHandler(c *gin.Context) {
	name := c.Param("name")

	var userID uint
	if uid, exists := c.Get("userID"); exists {
		userID = uid.(uint)
	}

	community, err := repository.GetCommunityByName(name)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "community not found"})
		return
	}

	// enrich needs to be exported/reused — see note below
	repository.EnrichCommunity(community, userID)
	c.JSON(http.StatusOK, community)
}
