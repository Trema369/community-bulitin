// database/seed.go
package database

import "com-hub/models"

func SeedBadges() {
	badges := []models.Badge{
		{Key: "pull-shark", Name: "Pull Shark", Description: "Opened and merged pull requests", ImagePath: "/badges/PullShark.png"},
		{Key: "quickdraw", Name: "Quickdraw", Description: "Closed an issue or PR within 5 minutes", ImagePath: "/badges/Quickdraw.png"},
		{Key: "yolo", Name: "YOLO", Description: "Merged without review", ImagePath: "/badges/Yolo.png"},
		{Key: "galaxy-brain", Name: "Galaxy Brain", Description: "Answered a discussion", ImagePath: "/badges/GalaxyBrain.png"},
		{Key: "starstruck", Name: "Starstruck", Description: "Created a popular repository", ImagePath: "/badges/Starstruck.png"},
		{Key: "pair-extraordinaire", Name: "Pair Extraordinaire", Description: "Co-authored commits", ImagePath: "/badges/PairExtraordinaire.png"},
		{Key: "open-sourcerer", Name: "Open Sourcerer", Description: "Contributed to open source", ImagePath: "/badges/OpenSourcerer.png"},
		{Key: "public-sponsor", Name: "Public Sponsor", Description: "Sponsored an open source contributor", ImagePath: "/badges/PublicSponsor.png"},
		// add the rest matching your actual filenames
	}

	for _, b := range badges {
		DB.Where(models.Badge{Key: b.Key}).FirstOrCreate(&b)
	}
}

func SeedCommunities() {
	communities := []models.Community{
		{Name: "general", Description: "General discussion"},
		{Name: "showcase", Description: "Show off what you're building"},
		{Name: "help", Description: "Ask for help"},
	}
	for _, c := range communities {
		DB.Where(models.Community{Name: c.Name}).FirstOrCreate(&c)
	}
}
