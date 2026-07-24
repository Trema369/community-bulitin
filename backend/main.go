package main

import (
	"fmt"
	"time"

	"com-hub/database"
	"com-hub/routes"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load()
	database.Init()
	router := gin.Default()

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Content-Type"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))
	router.Static("/uploads", "./uploads")

	routes.RegisterRoutes(router)

	if err := router.Run(":8080"); err != nil {
		fmt.Println("Failed to initiate server")
	}
}
