package database

import "com-hub/models"

func Init() {
	Connect()

	// every model belongs here — anything left out silently misses new columns
	DB.AutoMigrate(
		&models.User{}, &models.Badge{}, &models.UserBadge{},
		&models.Community{}, &models.CommunityMember{},
		&models.Post{}, &models.PostMedia{},
		&models.Vote{}, &models.Comment{},
		&models.Resource{}, &models.FlashcardCard{},
		&models.Alert{}, &models.Advertisement{},
		&models.Follow{}, &models.Conversation{}, &models.Message{},
	)
	// rows that predate the alert/announcement split are alerts
	DB.Exec(`UPDATE alerts SET kind = 'alert' WHERE kind IS NULL OR kind = ''`)
	DB.Exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_conversation_pair ON conversations (user_a_id, user_b_id)`)
	DB.Exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_follower_following ON follows (follower_id, following_id)`)
	DB.Exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_user_community_member ON community_members (user_id, community_id)`)
	DB.Exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_user_post_vote ON votes (user_id, post_id) WHERE post_id IS NOT NULL`)
	DB.Exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_user_comment_vote ON votes (user_id, comment_id) WHERE comment_id IS NOT NULL`)
	DB.Exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_user_alert_vote ON votes (user_id, alert_id) WHERE alert_id IS NOT NULL`)
	SeedBadges()
	SeedCommunities()
	SeedDemoData()
}
