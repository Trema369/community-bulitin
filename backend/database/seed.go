// database/seed.go
package database

import (
	"fmt"
	"log"
	"math/rand"
	"time"

	"com-hub/models"

	"golang.org/x/crypto/bcrypt"
)

// Badges describe things people actually do here. Each key must have a matching
// rule in repository/badge_rules.go, which is what decides when it's earned.
func SeedBadges() {
	badges := []models.Badge{
		{Key: "first-post", Name: "First Words", Description: "Published your first post", ImagePath: "/badges/Quickdraw.png"},
		{Key: "town-crier", Name: "Town Crier", Description: "Published 10 posts", ImagePath: "/badges/PullShark.png"},
		{Key: "conversationalist", Name: "Conversationalist", Description: "Left 25 comments", ImagePath: "/badges/GalaxyBrain.png"},
		{Key: "helping-hand", Name: "Helping Hand", Description: "Earned 50 upvotes from the community", ImagePath: "/badges/HeartOnYourSleeve.png"},
		{Key: "crowd-pleaser", Name: "Crowd Pleaser", Description: "Had a single post reach 25 upvotes", ImagePath: "/badges/awesome_6039561.png"},
		{Key: "organiser", Name: "Organiser", Description: "Founded a community", ImagePath: "/badges/Starstruck.png"},
		{Key: "neighbourhood-watch", Name: "Neighbourhood Watch", Description: "Raised 5 safety alerts", ImagePath: "/badges/Mars-2020-Contributor.png"},
		{Key: "campaigner", Name: "Campaigner", Description: "Posted 3 announcements — clean-ups, events or youth initiatives", ImagePath: "/badges/running_15374837.png"},
		{Key: "scholar", Name: "Scholar", Description: "Shared 5 study resources", ImagePath: "/badges/elearning_12873165.png"},
		{Key: "connector", Name: "Connector", Description: "Reached 10 followers", ImagePath: "/badges/OpenSourcerer.png"},
	}

	keys := make([]string, 0, len(badges))
	for _, b := range badges {
		badge := b // FirstOrCreate writes back into its argument
		DB.Where(models.Badge{Key: badge.Key}).Assign(models.Badge{
			Name:        badge.Name,
			Description: badge.Description,
			ImagePath:   badge.ImagePath,
		}).FirstOrCreate(&badge)
		keys = append(keys, badge.Key)
	}

	// drop badges from earlier catalogues, along with anyone's claim to them —
	// they were handed out on signup rather than earned
	var stale []models.Badge
	DB.Where("key NOT IN ?", keys).Find(&stale)
	for _, badge := range stale {
		DB.Where("badge_id = ?", badge.ID).Delete(&models.UserBadge{})
		DB.Delete(&badge)
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

// ---------------------------------------------------------------------------
// Demo data — fake users, posts, comments, votes, alerts, resources, follows
// ---------------------------------------------------------------------------

// SeedDemoData populates the database with realistic-looking content so the
// site doesn't feel empty on first deploy. Safe to call multiple times — it
// skips if demo users already exist.
func SeedDemoData() {
	// guard: if the first demo user exists we already seeded
	var count int64
	DB.Model(&models.User{}).Where("email = ?", "alex@demo.bulittin").Count(&count)
	if count > 0 {
		log.Println("demo data already seeded — skipping")
		return
	}
	log.Println("seeding demo data …")

	hash, _ := bcrypt.GenerateFromPassword([]byte("demo1234"), bcrypt.DefaultCost)
	pw := string(hash)

	// ── users ──────────────────────────────────────────────────────────
	users := []models.User{
		{Username: "Alex Morgan", Email: "alex@demo.bulittin", Password: pw, Avatar: ""},
		{Username: "Jordan Lee", Email: "jordan@demo.bulittin", Password: pw, Avatar: ""},
		{Username: "Sam Patel", Email: "sam@demo.bulittin", Password: pw, Avatar: ""},
		{Username: "Casey Rivera", Email: "casey@demo.bulittin", Password: pw, Avatar: ""},
		{Username: "Taylor Kim", Email: "taylor@demo.bulittin", Password: pw, Avatar: ""},
		{Username: "Riley Chen", Email: "riley@demo.bulittin", Password: pw, Avatar: ""},
		{Username: "Avery Okafor", Email: "avery@demo.bulittin", Password: pw, Avatar: ""},
		{Username: "Quinn Dubois", Email: "quinn@demo.bulittin", Password: pw, Avatar: ""},
		{Username: "Morgan Tanaka", Email: "morgan@demo.bulittin", Password: pw, Avatar: ""},
		{Username: "Jamie Nkosi", Email: "jamie@demo.bulittin", Password: pw, Avatar: ""},
		{Username: "Drew Larsson", Email: "drew@demo.bulittin", Password: pw, Avatar: ""},
		{Username: "Reese Amari", Email: "reese@demo.bulittin", Password: pw, Avatar: ""},
	}
	for i := range users {
		DB.Create(&users[i])
	}

	// ── communities (extra ones beyond the 3 defaults) ─────────────────
	extraCommunities := []models.Community{
		{Name: "campus-life", Description: "Everything about life on campus — events, food, dorms", CreatorID: users[0].ID},
		{Name: "study-group", Description: "Find study partners and share notes", CreatorID: users[1].ID},
		{Name: "neighbourhood", Description: "Local news, safety updates, and community events", CreatorID: users[2].ID},
		{Name: "tech-talk", Description: "Software, hardware, and everything in between", CreatorID: users[3].ID},
		{Name: "creative-corner", Description: "Art, music, writing — share your creative work", CreatorID: users[4].ID},
	}
	for i := range extraCommunities {
		DB.Where(models.Community{Name: extraCommunities[i].Name}).FirstOrCreate(&extraCommunities[i])
	}

	// collect all communities
	var allCommunities []models.Community
	DB.Find(&allCommunities)

	// ── memberships (every user joins 3-5 random communities) ──────────
	for _, u := range users {
		n := 3 + rand.Intn(3) // 3–5
		perm := rand.Perm(len(allCommunities))
		for j := 0; j < n && j < len(perm); j++ {
			DB.FirstOrCreate(&models.CommunityMember{
				UserID:      u.ID,
				CommunityID: allCommunities[perm[j]].ID,
				JoinedAt:    randomPastTime(60),
			}, models.CommunityMember{UserID: u.ID, CommunityID: allCommunities[perm[j]].ID})
		}
	}

	// ── posts ──────────────────────────────────────────────────────────
	type postSeed struct {
		title, content string
		tags           []string
		community      string
	}
	postSeeds := []postSeed{
		{"Welcome to Bulittin!", "Hey everyone — glad to see this place coming together. Drop a comment and introduce yourself.", []string{"meta", "welcome"}, "general"},
		{"Best coffee spots near campus?", "I've been going to Brewed Awakening but looking for alternatives. What's your go-to?", []string{"food", "campus"}, "campus-life"},
		{"Midterm study schedule", "Planning to start revising next week. Anyone want to form a group for MATH 201?", []string{"study", "math"}, "study-group"},
		{"Lost dog spotted on Oak Street", "Brown labrador, no collar, very friendly. Seen around 5pm today near the park entrance.", []string{"lost", "pets"}, "neighbourhood"},
		{"Just shipped my first side project", "Took 3 months of weekends but it's finally live. Would love feedback from the community!", []string{"project", "launch"}, "showcase"},
		{"How do you organize your notes?", "I've tried Notion, Obsidian, and plain markdown. Still can't settle. What works for you?", []string{"productivity", "tools"}, "tech-talk"},
		{"Weekend hiking trip — who's in?", "Thinking of doing the River Trail this Saturday morning. Easy-moderate, about 8km. Beginners welcome!", []string{"outdoors", "event"}, "campus-life"},
		{"Watercolour series I've been working on", "Finally finished all 6 pieces in my seasons collection. Sharing here before anywhere else.", []string{"art", "painting"}, "creative-corner"},
		{"Git tips for beginners", "Here are 5 commands I wish I knew when I started:\n\n1. `git stash` — save work without committing\n2. `git log --oneline` — clean history view\n3. `git diff --staged` — see what you're about to commit\n4. `git checkout -b` — branch and switch in one step\n5. `git rebase -i` — clean up commits before pushing", []string{"git", "tutorial"}, "tech-talk"},
		{"Volunteer cleanup this Sunday", "Meeting at Community Centre at 9am. Gloves and bags provided. Let's make the park shine!", []string{"volunteer", "event"}, "neighbourhood"},
		{"Album recommendations thread", "Drop your favourite album of the year so far. I'll start: *Bright Future* by Adrianne Lenker.", []string{"music", "discussion"}, "creative-corner"},
		{"Exam prep: Physics 101 formula sheet", "I compiled all the key formulas from chapters 1–8. Hope this helps someone!", []string{"physics", "study"}, "study-group"},
		{"New bike lanes on Main Street", "Finally! The city approved the protected bike lane project. Construction starts next month.", []string{"infrastructure", "cycling"}, "neighbourhood"},
		{"Looking for a roommate — fall semester", "2BR apartment, 10 min walk from campus. $650/mo utilities included. DM me if interested.", []string{"housing", "roommate"}, "campus-life"},
		{"Show your desk setup", "Just reorganised mine and I'm curious what everyone else is working with. Pics welcome!", []string{"setup", "workspace"}, "showcase"},
		{"Reading list for summer", "Trying to read 12 books this summer. Currently on book 3: *Project Hail Mary*. Anyone else doing a reading challenge?", []string{"books", "challenge"}, "general"},
		{"Rust vs Go for backend — thoughts?", "I've been writing Go for a year but Rust's type system is tempting. Has anyone made the switch?", []string{"rust", "go", "backend"}, "tech-talk"},
		{"Community garden plot signups open", "We have 8 plots available this season. First come, first served — sign up at the community centre.", []string{"garden", "signup"}, "neighbourhood"},
		{"Short film I made for class", "3-minute documentary about the local farmers market. Shot on my phone, edited in DaVinci. Feedback appreciated!", []string{"film", "video"}, "creative-corner"},
		{"Tips for surviving finals week", "1. Sleep more than you study\n2. Study more than you party\n3. Party as much as you can\n\n...but seriously, take breaks and hydrate.", []string{"finals", "advice"}, "study-group"},
		{"Hackathon team forming — need a designer", "We're entering the 48hr hackathon next month. Have 2 devs, need someone who can make things look good.", []string{"hackathon", "team"}, "tech-talk"},
		{"Street food festival this Friday", "Food trucks from all over the city will be at Riverside Park from 5–10pm. Don't miss the empanadas stand!", []string{"food", "event"}, "campus-life"},
		{"My first open source contribution", "Just got my PR merged into a project with 2k stars. Small fix but it feels huge. Don't be afraid to start small!", []string{"opensource", "milestone"}, "showcase"},
		{"Power outage on Elm Street", "Whole block went dark around 7pm. Utility company says 2-3 hours to restore. Stay safe everyone.", []string{"safety", "utility"}, "neighbourhood"},
		{"Poetry open mic night — sign up here", "Next Thursday at the student lounge, 7pm. All styles welcome, 5 min max per performer.", []string{"poetry", "event"}, "creative-corner"},
	}

	communityMap := map[string]uint{}
	for _, c := range allCommunities {
		communityMap[c.Name] = c.ID
	}

	posts := make([]models.Post, 0, len(postSeeds))
	for i, ps := range postSeeds {
		author := users[i%len(users)]
		cid := communityMap[ps.community]
		if cid == 0 {
			cid = allCommunities[0].ID
		}
		post := models.Post{
			Title:       ps.title,
			Content:     ps.content,
			Tags:        ps.tags,
			AuthorID:    author.ID,
			CommunityID: cid,
			CreatedAt:   randomPastTime(30),
		}
		DB.Create(&post)
		posts = append(posts, post)
	}

	// ── comments ───────────────────────────────────────────────────────
	commentBodies := []string{
		"Great post, thanks for sharing!",
		"This is exactly what I was looking for.",
		"Interesting perspective — I hadn't thought of it that way.",
		"Can you elaborate on that last point?",
		"Agreed 100%. Been saying this for a while.",
		"Thanks for putting this together!",
		"I had a similar experience last semester.",
		"This deserves more upvotes.",
		"Adding to my bookmarks. Really useful stuff.",
		"Anyone else tried this? Curious about results.",
		"Solid advice, especially point #3.",
		"Count me in!",
		"Where exactly is the meeting point?",
		"Love this — keep it up!",
		"Not sure I agree, but I respect the take.",
		"Has anyone had issues with this recently?",
		"Wow, this is really well done.",
		"Followed for more content like this.",
		"The community really needed this. Thank you.",
		"Just shared this with my study group.",
		"This happened to me too — thought I was the only one.",
		"Super helpful, saved me hours of work.",
		"Would love to see a follow-up post on this topic.",
		"Finally, someone said it!",
		"What tools did you use for this?",
		"I'm a beginner — is this still relevant for me?",
		"Came here from the trending page. Not disappointed.",
		"My experience was a bit different but I see your point.",
		"Could we organize a meetup around this?",
		"This is why I love this community.",
	}

	comments := make([]models.Comment, 0)
	for _, post := range posts {
		// 2–5 comments per post
		n := 2 + rand.Intn(4)
		for j := 0; j < n; j++ {
			author := users[rand.Intn(len(users))]
			comment := models.Comment{
				PostID:    post.ID,
				AuthorID:  author.ID,
				Content:   commentBodies[rand.Intn(len(commentBodies))],
				CreatedAt: post.CreatedAt.Add(time.Duration(rand.Intn(72)) * time.Hour),
			}
			DB.Create(&comment)
			comments = append(comments, comment)
		}
	}

	// some replies (nested comments)
	for i := 0; i < 20; i++ {
		parent := comments[rand.Intn(len(comments))]
		author := users[rand.Intn(len(users))]
		pid := parent.ID
		reply := models.Comment{
			PostID:    parent.PostID,
			ParentID:  &pid,
			AuthorID:  author.ID,
			Content:   commentBodies[rand.Intn(len(commentBodies))],
			CreatedAt: parent.CreatedAt.Add(time.Duration(1+rand.Intn(24)) * time.Hour),
		}
		DB.Create(&reply)
	}

	// ── votes (posts + comments) ──────────────────────────────────────
	for _, post := range posts {
		voters := rand.Perm(len(users))
		n := 3 + rand.Intn(len(users)-3)
		for j := 0; j < n; j++ {
			val := 1
			if rand.Float32() < 0.15 {
				val = -1
			}
			pid := post.ID
			DB.FirstOrCreate(&models.Vote{
				UserID: users[voters[j]].ID,
				PostID: &pid,
				Value:  val,
			}, models.Vote{UserID: users[voters[j]].ID, PostID: &pid})
		}
	}
	for _, c := range comments {
		if rand.Float32() < 0.5 {
			continue
		}
		voter := users[rand.Intn(len(users))]
		cid := c.ID
		DB.FirstOrCreate(&models.Vote{
			UserID:    voter.ID,
			CommentID: &cid,
			Value:     1,
		}, models.Vote{UserID: voter.ID, CommentID: &cid})
	}

	// ── alerts & announcements ────────────────────────────────────────
	type alertSeed struct {
		kind, title, desc, category, location string
		community                             string
	}
	alertSeeds := []alertSeed{
		{"alert", "Water main break on 5th Ave", "Avoid the area — road is flooded and closed to traffic.", "other", "5th Avenue & Park Rd", "neighbourhood"},
		{"alert", "Suspicious activity near parking garage", "Campus security has been notified. Stay alert if you're in the area after dark.", "robbery", "West Parking Garage", "campus-life"},
		{"alert", "Found student ID card", "Found near the library entrance. Come to the front desk to claim.", "lost_item", "Main Library", "campus-life"},
		{"alert", "Fire alarm test tomorrow 10am", "Building C will have a scheduled fire drill. No need to evacuate unless instructed.", "meeting", "Building C", "general"},
		{"alert", "Icy sidewalks warning", "Temperatures dropping tonight — sidewalks may be icy tomorrow morning. Walk carefully.", "other", "Campus-wide", "general"},
		{"announcement", "Community cleanup day", "Join us for the quarterly neighbourhood cleanup! Supplies provided.", "cleanup", "Community Centre", "neighbourhood"},
		{"announcement", "Summer music festival", "Live bands, food trucks, and activities for all ages. Free admission!", "event", "Riverside Park", "campus-life"},
		{"announcement", "Youth coding workshop", "Free introductory Python workshop for ages 12–18. Registration open now.", "youth", "Tech Hub Room 201", "tech-talk"},
		{"announcement", "Town hall meeting", "Monthly community meeting to discuss upcoming developments and budget.", "meeting", "City Hall Auditorium", "neighbourhood"},
		{"announcement", "Art exhibition opening", "Student art showcase running all week. Opening reception with refreshments.", "event", "Gallery Space, Building A", "creative-corner"},
	}

	for i, as := range alertSeeds {
		author := users[i%len(users)]
		cid := communityMap[as.community]
		if cid == 0 {
			cid = allCommunities[0].ID
		}
		eventDate := time.Now().Add(time.Duration(rand.Intn(30)) * 24 * time.Hour)
		var ed *time.Time
		if as.kind == "announcement" {
			ed = &eventDate
		}
		alert := models.Alert{
			Kind:        as.kind,
			Title:       as.title,
			Description: as.desc,
			Category:    as.category,
			Location:    as.location,
			EventDate:   ed,
			AuthorID:    author.ID,
			CommunityID: cid,
			CreatedAt:   randomPastTime(14),
		}
		DB.Create(&alert)

		// a few votes on each alert
		n := 2 + rand.Intn(6)
		perm := rand.Perm(len(users))
		for j := 0; j < n && j < len(perm); j++ {
			aid := alert.ID
			DB.FirstOrCreate(&models.Vote{
				UserID:  users[perm[j]].ID,
				AlertID: &aid,
				Value:   1,
			}, models.Vote{UserID: users[perm[j]].ID, AlertID: &aid})
		}
	}

	// ── resources ─────────────────────────────────────────────────────
	type resSeed struct {
		typ, title, desc, content string
		tags                      []string
	}
	resSeeds := []resSeed{
		{"note", "MATH 201 — Integration Cheat Sheet", "All integration techniques in one place", "## Integration Techniques\n\n### Substitution\nLet u = g(x), then ∫f(g(x))g'(x)dx = ∫f(u)du\n\n### By Parts\n∫u dv = uv − ∫v du\n\n### Partial Fractions\nDecompose rational functions before integrating.", []string{"math", "calculus"}},
		{"note", "History 101 — Timeline of Major Events", "Quick reference timeline for the midterm", "## Key Dates\n\n- **1776** — Declaration of Independence\n- **1789** — French Revolution begins\n- **1848** — Revolutions across Europe\n- **1914** — World War I\n- **1945** — World War II ends\n- **1969** — Moon landing", []string{"history", "timeline"}},
		{"flashcard", "Biology — Cell Structure", "Flashcards covering organelles and their functions", "", []string{"biology", "cells"}},
		{"flashcard", "Spanish Vocabulary — Travel", "Essential travel phrases in Spanish", "", []string{"spanish", "language"}},
		{"note", "CS 101 — Big O Notation", "Time complexity reference", "## Common Complexities\n\n| Notation | Name | Example |\n|----------|------|--------|\n| O(1) | Constant | Hash lookup |\n| O(log n) | Logarithmic | Binary search |\n| O(n) | Linear | Simple loop |\n| O(n log n) | Linearithmic | Merge sort |\n| O(n²) | Quadratic | Nested loops |", []string{"cs", "algorithms"}},
		{"note", "Psychology — Memory Models", "Summary of major memory theories", "## Memory Models\n\n### Multi-Store Model (Atkinson & Shiffrin)\nSensory → Short-term → Long-term\n\n### Working Memory (Baddeley & Hitch)\nCentral executive, phonological loop, visuospatial sketchpad, episodic buffer\n\n### Levels of Processing (Craik & Lockhart)\nDeeper processing = stronger memory", []string{"psychology", "memory"}},
	}

	for i, rs := range resSeeds {
		author := users[i%len(users)]
		code := fmt.Sprintf("DEMO%04d", i+1)
		res := models.Resource{
			Type:        rs.typ,
			Title:       rs.title,
			Description: rs.desc,
			Content:     rs.content,
			Tags:        rs.tags,
			IsPublic:    true,
			Code:        code,
			AuthorID:    author.ID,
			CreatedAt:   randomPastTime(45),
		}
		DB.Create(&res)

		// add flashcard cards
		if rs.typ == "flashcard" {
			cards := []models.FlashcardCard{}
			if rs.title == "Biology — Cell Structure" {
				cards = []models.FlashcardCard{
					{ResourceID: res.ID, Front: "What is the powerhouse of the cell?", Back: "Mitochondria — responsible for ATP production through cellular respiration."},
					{ResourceID: res.ID, Front: "What does the endoplasmic reticulum do?", Back: "Rough ER: protein synthesis. Smooth ER: lipid synthesis and detoxification."},
					{ResourceID: res.ID, Front: "Function of the Golgi apparatus?", Back: "Modifies, packages, and ships proteins and lipids to their destination."},
					{ResourceID: res.ID, Front: "What is the cell membrane made of?", Back: "Phospholipid bilayer with embedded proteins (fluid mosaic model)."},
					{ResourceID: res.ID, Front: "Role of ribosomes?", Back: "Translate mRNA into proteins. Found free or on rough ER."},
				}
			} else {
				cards = []models.FlashcardCard{
					{ResourceID: res.ID, Front: "How do you say 'Where is the airport?'", Back: "¿Dónde está el aeropuerto?"},
					{ResourceID: res.ID, Front: "How do you say 'I need a taxi'?", Back: "Necesito un taxi."},
					{ResourceID: res.ID, Front: "How do you say 'How much does it cost?'", Back: "¿Cuánto cuesta?"},
					{ResourceID: res.ID, Front: "How do you say 'The bill, please'?", Back: "La cuenta, por favor."},
					{ResourceID: res.ID, Front: "How do you say 'Do you speak English?'", Back: "¿Habla usted inglés?"},
				}
			}
			for j := range cards {
				DB.Create(&cards[j])
			}
		}
	}

	// ── follows (random social graph) ─────────────────────────────────
	for _, u := range users {
		n := 2 + rand.Intn(5) // follow 2–6 people
		perm := rand.Perm(len(users))
		for j := 0; j < n; j++ {
			target := users[perm[j]]
			if target.ID == u.ID {
				continue
			}
			DB.FirstOrCreate(&models.Follow{
				FollowerID:  u.ID,
				FollowingID: target.ID,
				CreatedAt:   randomPastTime(30),
			}, models.Follow{FollowerID: u.ID, FollowingID: target.ID})
		}
	}

	log.Println("demo data seeded successfully")
}

func randomPastTime(maxDaysAgo int) time.Time {
	hours := rand.Intn(maxDaysAgo * 24)
	return time.Now().Add(-time.Duration(hours) * time.Hour)
}
