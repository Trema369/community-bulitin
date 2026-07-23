package handlers

import (
	"net/http"
	"strconv"

	"com-hub/repository"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

func GetConversationsHandler(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	convos, err := repository.GetConversationsForUser(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "failed to load conversations"})
		return
	}
	c.JSON(http.StatusOK, convos)
}

func StartConversationHandler(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	idStr := c.Param("id")
	otherID, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid user id"})
		return
	}

	convo, err := repository.GetOrCreateConversation(userID, uint(otherID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "failed to start conversation"})
		return
	}
	c.JSON(http.StatusOK, convo)
}

type sendMessageRequest struct {
	Content string `json:"content" binding:"required"`
}

func SendMessageHandler(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	idStr := c.Param("id")
	conversationID, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid conversation id"})
		return
	}

	if !repository.IsParticipant(userID, uint(conversationID)) {
		c.JSON(http.StatusForbidden, gin.H{"message": "not a participant"})
		return
	}

	var req sendMessageRequest
	if err := c.ShouldBindBodyWith(&req, binding.JSON); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "incorrect format"})
		return
	}

	msg, err := repository.SendMessage(uint(conversationID), userID, req.Content)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "failed to send message"})
		return
	}
	c.JSON(http.StatusOK, msg)
}

func GetMessagesHandler(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	idStr := c.Param("id")
	conversationID, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid conversation id"})
		return
	}

	if !repository.IsParticipant(userID, uint(conversationID)) {
		c.JSON(http.StatusForbidden, gin.H{"message": "not a participant"})
		return
	}

	messages, err := repository.GetMessages(uint(conversationID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "failed to load messages"})
		return
	}
	c.JSON(http.StatusOK, messages)
}
