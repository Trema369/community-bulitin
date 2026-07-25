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

const maxChatTurns = 20

// the assistant is scoped to what this app is for, so it doesn't wander
const chatSystemPrompt = `You are the assistant inside Bulittin, a community hub where neighbours share announcements, safety alerts, local events, clean-up campaigns, youth initiatives and study resources.
Help people with community questions, studying, and using the app. Keep answers short and practical — a few sentences unless asked for more. If asked something you can't know (like private user data), say so plainly.`

type chatMessage struct {
	Role    string `json:"role" binding:"required,oneof=user assistant"`
	Content string `json:"content" binding:"required"`
}

type chatRequest struct {
	Messages []chatMessage `json:"messages" binding:"required,min=1"`
}

func ChatHandler(c *gin.Context) {
	var req chatRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid request"})
		return
	}

	// only the tail of a long conversation is sent, to keep prompts bounded
	turns := req.Messages
	if len(turns) > maxChatTurns {
		turns = turns[len(turns)-maxChatTurns:]
	}

	messages := make([]ai.Message, 0, len(turns)+1)
	messages = append(messages, ai.Message{Role: "system", Content: chatSystemPrompt})
	for _, m := range turns {
		messages = append(messages, ai.Message{Role: m.Role, Content: m.Content})
	}

	reply, err := ai.Chat(messages)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "the assistant is unavailable right now"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"reply": reply})
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
