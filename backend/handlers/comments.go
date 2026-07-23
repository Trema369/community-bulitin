// handlers/comments.go
package handlers

import (
	"net/http"
	"strconv"

	"com-hub/models"
	"com-hub/repository"

	"github.com/gin-gonic/gin"
)

type createCommentRequest struct {
	Content  string `json:"content" binding:"required"`
	ParentID *uint  `json:"parent_id"`
}

func CreateCommentHandler(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	postIDStr := c.Param("id")
	postID, err := strconv.ParseUint(postIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid post id"})
		return
	}

	var req createCommentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "incorrect format"})
		return
	}

	postIDUint := uint(postID)
	comment := models.Comment{
		PostID:   postIDUint,
		AuthorID: userID,
		ParentID: req.ParentID,
		Content:  req.Content,
	}

	if err := repository.CreateComment(&comment); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "failed to create comment"})
		return
	}

	// re-fetch with Author preloaded for immediate display
	comments, err := repository.GetCommentsByPost(postIDUint, userID)
	if err == nil {
		for _, cm := range comments {
			if cm.ID == comment.ID {
				c.JSON(http.StatusOK, cm)
				return
			}
		}
	}

	c.JSON(http.StatusOK, comment)
}

func GetCommentsHandler(c *gin.Context) {
	postIDStr := c.Param("id")
	postID, err := strconv.ParseUint(postIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid post id"})
		return
	}

	var userID uint
	if uid, exists := c.Get("userID"); exists {
		userID = uid.(uint)
	}

	comments, err := repository.GetCommentsByPost(uint(postID), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "failed to load comments"})
		return
	}

	c.JSON(http.StatusOK, comments)
}

type voteCommentRequest struct {
	Value int `json:"value" binding:"required,oneof=1 -1"`
}

func VoteCommentHandler(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	idStr := c.Param("commentId")
	commentID, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid comment id"})
		return
	}

	var req voteCommentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "value must be 1 or -1"})
		return
	}

	newVote, err := repository.CastCommentVote(userID, uint(commentID), req.Value)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "failed to vote"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"user_vote": newVote})
}
