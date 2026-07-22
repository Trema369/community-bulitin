package routes

import (
	"com-hub/handlers"
	"github.com/gin-gonic/gin"
)

func RegisterRoutes(r *gin.Engine) {
	r.POST("/signup", handlers.SignupHandler)
	r.POST("/login", handlers.LoginHandler)
	r.POST("/logout", handlers.LogoutHandler)
	r.GET("/me", handlers.AuthMiddleware(), handlers.MeHandler)
	r.GET("/badges/me", handlers.AuthMiddleware(), handlers.GetMyBadgesHandler)
	r.GET("/communities", handlers.GetCommunitiesHandler)
	r.GET("/posts", handlers.OptionalAuthMiddleware(), handlers.GetFeedHandler)
	r.POST("/posts", handlers.AuthMiddleware(), handlers.CreatePostHandler)
	r.POST("/posts/:id/vote", handlers.AuthMiddleware(), handlers.VoteHandler)
}
