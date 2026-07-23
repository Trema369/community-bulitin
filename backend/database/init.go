package database

import "com-hub/models"

func Init() {
	Connect()
	DB.AutoMigrate(
		&models.User{}, &models.Badge{}, &models.UserBadge{},
		&models.Community{}, &models.CommunityMember{},
		&models.Post{}, &models.Vote{}, &models.Comment{},
	)
	DB.Exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_user_community_member ON community_members (user_id, community_id)`)
	DB.Exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_user_post_vote ON votes (user_id, post_id) WHERE post_id IS NOT NULL`)
	DB.Exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_user_comment_vote ON votes (user_id, comment_id) WHERE comment_id IS NOT NULL`)
	SeedBadges()
	SeedCommunities()
}
