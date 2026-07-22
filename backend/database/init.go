package database

import "com-hub/models"

func Init() {
	Connect()

	DB.AutoMigrate(
		&models.User{},
		&models.Badge{},
		&models.UserBadge{},
		&models.Community{},
		&models.Post{},
		&models.Vote{},
	)
	DB.Exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_user_post_vote ON votes (user_id, post_id)`)
	SeedBadges()
	SeedCommunities()
}
