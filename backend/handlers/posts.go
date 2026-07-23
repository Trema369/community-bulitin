package handlers

import (
	"net/http"
	"strconv"

	"com-hub/models"
	"com-hub/repository"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

type createPostRequest struct {
	Title     string   `json:"title" binding:"required"`
	Content   string   `json:"content" binding:"required"`
	Tags      []string `json:"tags"`
	Community string   `json:"community" binding:"required"`
}

func CreatePostHandler(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	var req createPostRequest
	if err := c.ShouldBindBodyWith(&req, binding.JSON); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "incorrect format"})
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

func GetFeedHandler(c *gin.Context) {
	limitStr := c.DefaultQuery("limit", "20")
	offsetStr := c.DefaultQuery("offset", "0")

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

	posts, err := repository.GetFeed(limit, offset, userID)
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
