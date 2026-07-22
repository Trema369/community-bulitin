// handlers/votes.go
package handlers

import (
	"net/http"
	"strconv"

	"com-hub/repository"

	"github.com/gin-gonic/gin"
)

type voteRequest struct {
	Value int `json:"value" binding:"required,oneof=1 -1"`
}

func VoteHandler(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	postIDStr := c.Param("id")
	postID, err := strconv.ParseUint(postIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid post id"})
		return
	}

	var req voteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "value must be 1 or -1"})
		return
	}

	newVote, err := repository.CastVote(userID, uint(postID), req.Value)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "failed to vote"})
		return
	}

	score := repository.GetPostScore(uint(postID))
	c.JSON(http.StatusOK, gin.H{"score": score, "user_vote": newVote})
}
