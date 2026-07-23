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
	r.GET("/communities/:name", handlers.OptionalAuthMiddleware(), handlers.GetCommunityHandler)
	r.GET("/alerts", handlers.OptionalAuthMiddleware(), handlers.GetAlertsHandler)
	r.POST("/alerts", handlers.AuthMiddleware(), handlers.CreateAlertHandler)
	r.POST("/alerts/:id/vote", handlers.AuthMiddleware(), handlers.VoteAlertHandler)
	r.GET("/advertisements", handlers.GetAdvertisementsHandler)
	r.POST("/advertisements", handlers.AuthMiddleware(), handlers.CreateAdvertisementHandler)
	r.POST("/users/:id/follow", handlers.AuthMiddleware(), handlers.FollowUserHandler)
	r.POST("/users/:id/unfollow", handlers.AuthMiddleware(), handlers.UnfollowUserHandler)
	r.GET("/users/:id/profile", handlers.OptionalAuthMiddleware(), handlers.GetUserProfileHandler)
	r.GET("/users/me/following", handlers.AuthMiddleware(), handlers.GetFollowingListHandler)
	r.GET("/conversations", handlers.AuthMiddleware(), handlers.GetConversationsHandler)
	r.POST("/users/:id/conversation", handlers.AuthMiddleware(), handlers.StartConversationHandler)
	r.GET("/conversations/:id/messages", handlers.AuthMiddleware(), handlers.GetMessagesHandler)
	r.POST("/conversations/:id/messages", handlers.AuthMiddleware(), handlers.SendMessageHandler)
	r.GET("/users", handlers.OptionalAuthMiddleware(), handlers.SearchUsersHandler)
	r.GET("/users/:id", handlers.OptionalAuthMiddleware(), handlers.GetUserByIDHandler)
	r.GET("/search", handlers.OptionalAuthMiddleware(), handlers.SearchHandler)
}
