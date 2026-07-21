package handlers

import (
	"net/http"

	"com-hub/models"
	"com-hub/repository"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"golang.org/x/crypto/bcrypt"
)

type signupRequest struct {
	Username string `json:"username"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
}

func SignupHandler(c *gin.Context) {
	var req signupRequest

	if err := c.ShouldBindBodyWith(&req, binding.JSON); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "incorrect format"})
		return
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "server error"})
		return
	}

	user := models.User{
		Username: req.Username,
		Email:    req.Email,
		Password: string(hash),
	}

	if err := repository.CreateUser(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "incorrect format"})
		return
	}
	testBadges := []string{"pull-shark", "quickdraw", "yolo", "galaxy-brain", "starstruck"}
	for _, key := range testBadges {
		repository.AwardBadge(user.ID, key)
	}
	token, err := GenerateToken(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "server error"})
		return
	}

	setAuthCookie(c, token)
	c.JSON(http.StatusOK, gin.H{"id": user.ID, "email": user.Email, "username": user.Username})
}
