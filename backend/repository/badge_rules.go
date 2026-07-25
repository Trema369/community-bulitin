// repository/badge_rules.go
package repository

import (
	"com-hub/database"
	"com-hub/models"
)

// UserStats is everything the badge rules are allowed to look at.
type UserStats struct {
	Posts             int
	Comments          int
	Alerts            int
	Announcements     int
	Resources         int
	CommunitiesMade   int
	Followers         int
	Karma             int // net votes received across posts and comments
	BestPostScore     int
	CommunitiesJoined int
}

// BadgeRule ties a badge key to the condition that earns it. Keys must match
// those seeded in database/seed.go.
type BadgeRule struct {
	Key      string
	Earned   func(s UserStats) bool
	Progress func(s UserStats) (current, target int)
}

var badgeRules = []BadgeRule{
	{
		Key:      "first-post",
		Earned:   func(s UserStats) bool { return s.Posts >= 1 },
		Progress: func(s UserStats) (int, int) { return s.Posts, 1 },
	},
	{
		Key:      "town-crier",
		Earned:   func(s UserStats) bool { return s.Posts >= 10 },
		Progress: func(s UserStats) (int, int) { return s.Posts, 10 },
	},
	{
		Key:      "conversationalist",
		Earned:   func(s UserStats) bool { return s.Comments >= 25 },
		Progress: func(s UserStats) (int, int) { return s.Comments, 25 },
	},
	{
		Key:      "helping-hand",
		Earned:   func(s UserStats) bool { return s.Karma >= 50 },
		Progress: func(s UserStats) (int, int) { return s.Karma, 50 },
	},
	{
		Key:      "crowd-pleaser",
		Earned:   func(s UserStats) bool { return s.BestPostScore >= 25 },
		Progress: func(s UserStats) (int, int) { return s.BestPostScore, 25 },
	},
	{
		Key:      "organiser",
		Earned:   func(s UserStats) bool { return s.CommunitiesMade >= 1 },
		Progress: func(s UserStats) (int, int) { return s.CommunitiesMade, 1 },
	},
	{
		Key:      "neighbourhood-watch",
		Earned:   func(s UserStats) bool { return s.Alerts >= 5 },
		Progress: func(s UserStats) (int, int) { return s.Alerts, 5 },
	},
	{
		Key:      "campaigner",
		Earned:   func(s UserStats) bool { return s.Announcements >= 3 },
		Progress: func(s UserStats) (int, int) { return s.Announcements, 3 },
	},
	{
		Key:      "scholar",
		Earned:   func(s UserStats) bool { return s.Resources >= 5 },
		Progress: func(s UserStats) (int, int) { return s.Resources, 5 },
	},
	{
		Key:      "connector",
		Earned:   func(s UserStats) bool { return s.Followers >= 10 },
		Progress: func(s UserStats) (int, int) { return s.Followers, 10 },
	},
}

func countWhere(model any, query string, args ...any) int {
	var n int64
	database.DB.Model(model).Where(query, args...).Count(&n)
	return int(n)
}

// GatherUserStats reads a user's activity straight from the tables that record it,
// so badges can never drift out of step with what someone actually did.
func GatherUserStats(userID uint) UserStats {
	s := UserStats{
		Posts:             countWhere(&models.Post{}, "author_id = ?", userID),
		Comments:          countWhere(&models.Comment{}, "author_id = ?", userID),
		Alerts:            countWhere(&models.Alert{}, "author_id = ? AND kind = ?", userID, "alert"),
		Announcements:     countWhere(&models.Alert{}, "author_id = ? AND kind = ?", userID, "announcement"),
		Resources:         countWhere(&models.Resource{}, "author_id = ?", userID),
		CommunitiesMade:   countWhere(&models.Community{}, "creator_id = ?", userID),
		Followers:         countWhere(&models.Follow{}, "following_id = ?", userID),
		CommunitiesJoined: countWhere(&models.CommunityMember{}, "user_id = ?", userID),
	}

	// votes other people cast on this user's posts and comments
	var postKarma, commentKarma int
	database.DB.Model(&models.Vote{}).
		Joins("JOIN posts ON posts.id = votes.post_id").
		Where("posts.author_id = ? AND votes.user_id <> ?", userID, userID).
		Select("COALESCE(SUM(votes.value), 0)").Scan(&postKarma)
	database.DB.Model(&models.Vote{}).
		Joins("JOIN comments ON comments.id = votes.comment_id").
		Where("comments.author_id = ? AND votes.user_id <> ?", userID, userID).
		Select("COALESCE(SUM(votes.value), 0)").Scan(&commentKarma)
	s.Karma = postKarma + commentKarma

	// the best-performing single post: score each of the user's posts, take the max
	database.DB.Raw(`
		SELECT COALESCE(MAX(total), 0) FROM (
			SELECT COALESCE(SUM(v.value), 0) AS total
			FROM posts p
			LEFT JOIN votes v ON v.post_id = p.id
			WHERE p.author_id = ?
			GROUP BY p.id
		) AS per_post`, userID).Scan(&s.BestPostScore)

	return s
}

// EvaluateBadges awards every badge the user now qualifies for. Safe to call
// often — AwardBadge ignores ones they already hold.
func EvaluateBadges(userID uint) {
	stats := GatherUserStats(userID)
	for _, rule := range badgeRules {
		if rule.Earned(stats) {
			AwardBadge(userID, rule.Key)
		}
	}
}

// BadgeProgress is a badge the user hasn't earned yet, with how close they are.
type BadgeProgress struct {
	Badge   models.Badge `json:"badge"`
	Current int          `json:"current"`
	Target  int          `json:"target"`
}

// LockedBadges lists what's still to play for, so the UI can show goals.
func LockedBadges(userID uint) []BadgeProgress {
	stats := GatherUserStats(userID)

	var earned []models.UserBadge
	database.DB.Where("user_id = ?", userID).Find(&earned)
	has := make(map[uint]bool, len(earned))
	for _, ub := range earned {
		has[ub.BadgeID] = true
	}

	locked := make([]BadgeProgress, 0)
	for _, rule := range badgeRules {
		var badge models.Badge
		if err := database.DB.Where("key = ?", rule.Key).First(&badge).Error; err != nil {
			continue
		}
		if has[badge.ID] {
			continue
		}
		current, target := rule.Progress(stats)
		if current > target {
			current = target
		}
		if current < 0 {
			current = 0
		}
		locked = append(locked, BadgeProgress{Badge: badge, Current: current, Target: target})
	}
	return locked
}
