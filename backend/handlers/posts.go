package handlers

import (
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"com-hub/models"
	"com-hub/repository"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

const maxPostMedia = 4

type postMediaInput struct {
	URL  string `json:"url" binding:"required"`
	Type string `json:"type" binding:"required"`
	Alt  string `json:"alt"`
}

type createPostRequest struct {
	Title     string           `json:"title" binding:"required"`
	Content   string           `json:"content"`
	Tags      []string         `json:"tags"`
	Community string           `json:"community" binding:"required"`
	Media     []postMediaInput `json:"media"`
}

// buildPostMedia validates client-supplied attachments. URLs must point at files
// this server already stored via /uploads/media, so a post can't embed a
// arbitrary remote URL through the media table.
func buildPostMedia(inputs []postMediaInput) ([]models.PostMedia, error) {
	if len(inputs) > maxPostMedia {
		return nil, fmt.Errorf("a post can have at most %d attachments", maxPostMedia)
	}

	media := make([]models.PostMedia, 0, len(inputs))
	for _, in := range inputs {
		if !strings.HasPrefix(in.URL, "/uploads/") || strings.Contains(in.URL, "..") {
			return nil, errors.New("invalid media url")
		}
		if in.Type != "image" && in.Type != "video" {
			return nil, errors.New("media must be an image or a video")
		}
		media = append(media, models.PostMedia{
			URL:  in.URL,
			Type: in.Type,
			Alt:  in.Alt,
		})
	}
	return media, nil
}

func CreatePostHandler(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	var req createPostRequest
	if err := c.ShouldBindBodyWith(&req, binding.JSON); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "incorrect format"})
		return
	}
	// a post carries text, attachments, or both — but not neither
	if strings.TrimSpace(req.Content) == "" && len(req.Media) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"message": "add some content or an attachment"})
		return
	}
	media, err := buildPostMedia(req.Media)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	community, err := repository.GetCommunityByName(req.Community)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "community not found"})
		return
	}
	post := models.Post{
		Title:       req.Title,
		Content:     req.Content,
		Tags:        req.Tags,
		AuthorID:    userID,
		CommunityID: community.ID,
		Media:       media,
	}
	if err := repository.CreatePost(&post); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "failed to create post"})
		return
	}
	full, err := repository.GetPostByID(post.ID, userID) // pass userID here
	if err != nil {
		c.JSON(http.StatusOK, post)
		return
	}
	c.JSON(http.StatusOK, full)
}

// handlers/posts.go
func GetFeedHandler(c *gin.Context) {
	limitStr := c.DefaultQuery("limit", "20")
	offsetStr := c.DefaultQuery("offset", "0")
	community := c.Query("community") // NEW — empty string if not provided

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 20
	}
	offset, err := strconv.Atoi(offsetStr)
	if err != nil || offset < 0 {
		offset = 0
	}

	var userID uint
	if uid, exists := c.Get("userID"); exists {
		userID = uid.(uint)
	}

	posts, err := repository.GetFeed(limit, offset, userID, community)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "failed to load feed"})
		return
	}

	c.JSON(http.StatusOK, posts)
}

// handlers/posts.go — add this handler
func GetPostHandler(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid post id"})
		return
	}

	var userID uint
	if uid, exists := c.Get("userID"); exists {
		userID = uid.(uint)
	}

	post, err := repository.GetPostByID(uint(id), userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "post not found"})
		return
	}

	c.JSON(http.StatusOK, post)
}
