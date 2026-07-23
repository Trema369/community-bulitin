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
	r.GET("/posts", handlers.OptionalAuthMiddleware(), handlers.GetFeedHandler)
	r.POST("/posts", handlers.AuthMiddleware(), handlers.CreatePostHandler)
	r.POST("/posts/:id/vote", handlers.AuthMiddleware(), handlers.VoteHandler)
	r.GET("/communities", handlers.OptionalAuthMiddleware(), handlers.GetCommunitiesHandler)
	r.POST("/communities", handlers.AuthMiddleware(), handlers.CreateCommunityHandler)
	r.POST("/communities/:id/join", handlers.AuthMiddleware(), handlers.JoinCommunityHandler)
	r.POST("/communities/:id/leave", handlers.AuthMiddleware(), handlers.LeaveCommunityHandler)
	r.GET("/posts/:id", handlers.OptionalAuthMiddleware(), handlers.GetPostHandler)
	r.GET("/posts/:id/comments", handlers.OptionalAuthMiddleware(), handlers.GetCommentsHandler)
	r.POST("/posts/:id/comments", handlers.AuthMiddleware(), handlers.CreateCommentHandler)
	r.POST("/comments/:commentId/vote", handlers.AuthMiddleware(), handlers.VoteCommentHandler)
}
