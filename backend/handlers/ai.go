package handlers

import (
	"net/http"

	"com-hub/ai"

	"github.com/gin-gonic/gin"
)

// handlers/ai.go — updated request structs + handlers
type generateFlashcardsRequest struct {
	Topic      string `json:"topic"`
	SourceText string `json:"source_text"`
	Count      int    `json:"count"`
}

func GenerateFlashcardsHandler(c *gin.Context) {
	var req generateFlashcardsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid request"})
		return
	}
	if req.Topic == "" && req.SourceText == "" {
		c.JSON(http.StatusBadRequest, gin.H{"message": "topic or source_text is required"})
		return
	}
	if req.Count <= 0 || req.Count > 20 {
		req.Count = 8
	}

	cards, err := ai.GenerateFlashcards(req.Topic, req.SourceText, req.Count)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "generation failed: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"cards": cards})
}

type generateNoteRequest struct {
	Topic      string `json:"topic"`
	SourceText string `json:"source_text"`
}

func GenerateNoteHandler(c *gin.Context) {
	var req generateNoteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid request"})
		return
	}
	if req.Topic == "" && req.SourceText == "" {
		c.JSON(http.StatusBadRequest, gin.H{"message": "topic or source_text is required"})
		return
	}

	content, err := ai.GenerateNote(req.Topic, req.SourceText)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "generation failed: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"content": content})
}
