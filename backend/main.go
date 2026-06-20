package main

import (
	"fmt"
	"net/http"

	"com-hub/database"
	"com-hub/models"
	"com-hub/repository"

	"github.com/gin-gonic/gin"
)

func main() {
	database.Init()
	router := gin.Default()

	user := models.User{
		Name:     "trema",
		Email:    "trema@gmail.com",
		Password: "123456",
	}
	err := repository.CreateUser(&user)
	if err != nil {
		fmt.Println("failed to create user")
	}
	router.GET("/hello", func(c *gin.Context) {
		c.String(http.StatusOK, "hello world")
	})

	if err := router.Run(); err != nil {
		fmt.Println("Failed to initiate server")
	}
}
