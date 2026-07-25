// Command seed fills the database with believable demo content so the app can be
// shown with something in it.
//
//	go run ./cmd/seed              # add demo content
//	go run ./cmd/seed -clean       # remove it again
//	go run ./cmd/seed -users 20 -posts 60
//
// Everything it creates is tagged by the demo email domain, so -clean removes
// exactly what was seeded and never touches real accounts.
package main

import (
	"bytes"
	"flag"
	"fmt"
	"image"
	"image/color"
	"image/draw"
	"image/png"
	"log"
	"math/rand"
	"os"
	"path/filepath"
	"strings"
	"time"

	"com-hub/database"
	"com-hub/models"
	"com-hub/repository"

	"github.com/brianvoe/gofakeit/v7"
	"github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
)

// every seeded account uses this domain — it's how -clean finds its own work
const demoDomain = "@demo.local"
const demoPassword = "demo1234"

type seedConfig struct {
	users int
	posts int
}

var communities = []struct {
	name, description string
	rules             []string
}{
	{"general", "Anything and everything happening around the neighbourhood", []string{
		"Be respectful — real neighbours read this",
		"No spam or repeat posting",
		"Keep personal disputes out of the feed",
	}},
	{"safety", "Watch-outs, incidents and street safety", []string{
		"Report facts, not rumours",
		"No naming individuals without evidence",
		"Call emergency services first, post second",
	}},
	{"study-hub", "Notes, past papers and study groups", []string{
		"Share, don't sell",
		"Credit the original author",
	}},
	{"volunteering", "Clean-ups, drives and lending a hand", nil},
	{"youth", "Programmes, mentoring and activities for young people", nil},
	{"marketplace", "Local services, jobs and things going spare", nil},
}

var postSeeds = []struct {
	community, title, content string
	tags                      []string
}{
	{"general", "New bus timetable starts Monday", "The 14 and 22 both shift by ten minutes from Monday. Printed copies are up at the terminus if you want one.", []string{"transport", "notice"}},
	{"general", "Who else lost power last night?", "Ours went at about 8pm and came back around midnight. Trying to work out how wide it went before I report it.", []string{"utilities"}},
	{"general", "Free tomatoes — garden went mad", "Far more than we can eat. Porch on Sycamore Road, help yourselves while they last.", []string{"food", "free"}},
	{"safety", "Streetlight out on the corner of Elm", "Been dark for about a week now. Reported it, but posting so people know to take care walking back.", []string{"lighting"}},
	{"safety", "Reminder: lock your side gates", "Two attempted break-ins this month both went through unlocked side gates. Two seconds to check.", []string{"security"}},
	{"study-hub", "Past papers for Grade 11 maths", "Uploaded everything I had from the last four years to Resources. Answers included where I had them.", []string{"maths", "exams"}},
	{"study-hub", "Study group — Tuesdays at the library", "Six of us so far, mostly sciences. Room 2, 4pm. Just turn up.", []string{"studygroup"}},
	{"study-hub", "How do you revise for orals?", "I freeze up every time. Anything that actually worked for you?", []string{"advice", "exams"}},
	{"volunteering", "Riverside clean-up needs more hands", "We cleared about half the bank last time. Another twenty people and we'd finish it in a morning.", []string{"cleanup", "environment"}},
	{"volunteering", "Soup kitchen needs weekend drivers", "Two hours on a Saturday, own car, petrol covered. Message me if you can help.", []string{"food", "help"}},
	{"youth", "Coding club is taking sign-ups", "Free, ages 12 to 17, laptops provided. Thursdays after school at the library.", []string{"coding", "youth"}},
	{"youth", "Looking for football coaches", "Under-13s need a coach for the new season. No experience required, just reliability.", []string{"sport"}},
	{"marketplace", "Bicycle, barely used", "Bought it for a commute I no longer do. Happy to let it go cheap to someone local.", []string{"forsale"}},
	{"marketplace", "Offering maths tutoring", "Grades 8 to 12, weekday evenings. First session free so we can see if it works.", []string{"tutoring", "services"}},
}

var commentSeeds = []string{
	"Thanks for posting this — I had no idea.",
	"Same here, thought it was just us.",
	"Count me in, I'll bring a friend.",
	"Is this still happening if it rains?",
	"Shared with my street group.",
	"Been saying this for months, glad someone finally raised it.",
	"What time should we get there?",
	"This is really helpful, appreciated.",
	"I can help with transport if anyone needs a lift.",
	"Any update on this?",
}

var alertSeeds = []struct{ title, description, category string }{
	{"Break-in on Maple Street", "Two houses overnight, both through side windows. Police have been round already.", "robbery"},
	{"Lost: tabby cat, answers to Otis", "Slipped out on Tuesday evening near the park. Very friendly, no collar.", "lost_item"},
	{"Residents meeting moved to Thursday", "The hall was double-booked, so we've shifted it a day. Same time.", "meeting"},
	{"Burst pipe on the high street", "Water shut off between the bakery and the pharmacy while it's fixed.", "other"},
	{"Car window smashed outside the shops", "Nothing taken as far as I can tell, but worth not leaving bags on seats.", "robbery"},
}

var announcementSeeds = []struct {
	title, description, category, location string
	daysOut                                int
}{
	{"Riverside clean-up", "Bring gloves — bags and pickers provided. We start at the bridge and work downstream.", "cleanup", "Riverside Park", 3},
	{"Saturday farmers market", "Local produce, bread and crafts. Parking is free behind the hall.", "event", "Town Square", 6},
	{"Youth coding club sign-ups", "Free after-school coding for 12 to 17 year olds. Laptops provided.", "youth", "Community Library", 9},
	{"Neighbourhood watch meeting", "Monthly catch-up with the local officer. New faces very welcome.", "meeting", "Church Hall", 12},
	{"Park tree planting", "Forty saplings going in along the east path. Spades provided, wear boots.", "cleanup", "Eastfield Park", 17},
	{"Winter clothing drive", "Coats, jumpers and blankets for the shelter. Drop-off all day.", "event", "Scout Hut", 21},
	{"Youth football trials", "Under-13s and under-15s. Boots and shin pads required.", "youth", "Recreation Ground", 26},
}

var resourceSeeds = []struct {
	rType, title, description string
	tags                      []string
	content                   string
	cards                     [][2]string
}{
	{"note", "Photosynthesis in one page", "Light reactions, Calvin cycle and the bits examiners actually ask about.",
		[]string{"biology", "grade11"},
		"# Photosynthesis\n\n## The short version\nPlants turn light, water and carbon dioxide into glucose and oxygen.\n\n## Light-dependent reactions\n- Happen in the **thylakoid membranes**\n- Water is split, releasing oxygen\n- Produces ATP and NADPH\n\n## Calvin cycle\n- Happens in the **stroma**\n- Uses ATP and NADPH to fix carbon dioxide\n- Produces glucose\n\n## Commonly examined\n1. Why the leaf is green\n2. What limits the rate\n3. Difference between the two stages", nil},
	{"note", "Essay structure that actually scores", "The paragraph shape our teacher marks hardest on.",
		[]string{"english", "writing"},
		"# Essay structure\n\n## Introduction\nState the argument in one sentence. Don't warm up.\n\n## Body paragraphs\nEach paragraph does four things:\n1. **Point** — the claim\n2. **Evidence** — a quote or fact\n3. **Explain** — why it supports the claim\n4. **Link** — back to the question\n\n## Conclusion\nAnswer the question directly. No new evidence.", nil},
	{"flashcard", "Local government basics", "Who does what in the council, for civics.",
		[]string{"civics"}, "", [][2]string{
			{"What does a ward councillor do?", "Represents a ward on the council and raises local issues on residents' behalf."},
			{"How often are local elections held?", "Every five years in most systems."},
			{"What is a municipal budget?", "The council's plan for how it will raise and spend money over a financial year."},
			{"Who runs day-to-day council services?", "Council officials and staff, under the direction of elected representatives."},
			{"What is a public participation meeting?", "A meeting where residents can comment on council plans before they are approved."},
		}},
	{"flashcard", "Chemistry: common ions", "The ones worth memorising before the test.",
		[]string{"chemistry", "exams"}, "", [][2]string{
			{"Sulfate", "SO₄²⁻"},
			{"Nitrate", "NO₃⁻"},
			{"Carbonate", "CO₃²⁻"},
			{"Ammonium", "NH₄⁺"},
			{"Hydroxide", "OH⁻"},
			{"Phosphate", "PO₄³⁻"},
		}},
}

func main() {
	cfg := seedConfig{}
	clean := flag.Bool("clean", false, "remove previously seeded demo data and exit")
	flag.IntVar(&cfg.users, "users", 12, "how many demo users to create")
	flag.IntVar(&cfg.posts, "posts", 40, "roughly how many posts to create")
	flag.Parse()

	database.Init()

	if *clean {
		removeDemoData()
		return
	}

	gofakeit.Seed(0)
	users := seedUsers(cfg.users)
	comms := seedCommunities(users)
	seedMemberships(users, comms)
	posts := seedPosts(users, cfg.posts)
	seedComments(users, posts)
	seedVotes(users, posts)
	seedNotices(users)
	seedResources(users)
	seedUploads(users)
	seedFollows(users)
	seedConversations(users)

	for _, u := range users {
		repository.EvaluateBadges(u.ID)
	}

	fmt.Printf("\nSeeded %d users, %d posts and their activity.\n", len(users), len(posts))
	fmt.Printf("Sign in as any of them with the password %q, for example:\n", demoPassword)
	for _, u := range users[:min(3, len(users))] {
		fmt.Printf("  %s\n", u.Username)
	}
	fmt.Println("\nRun 'go run ./cmd/seed -clean' to remove all of it.")
}

// author picks who did something, biased towards the first few accounts. Spread
// evenly, nobody in a small demo does enough to earn the harder badges, and the
// profiles all look identical.
func author(users []models.User) uint {
	actives := min(3, len(users))
	if actives > 0 && rand.Float64() < 0.5 {
		return users[rand.Intn(actives)].ID
	}
	return users[rand.Intn(len(users))].ID
}

// handle turns whatever the faker produced into something usable as a username
// and inside an email address — gofakeit will happily hand back "virginia beach".
func handle(raw string) string {
	var b strings.Builder
	for _, r := range strings.ToLower(raw) {
		switch {
		case r >= 'a' && r <= 'z', r >= '0' && r <= '9', r == '_':
			b.WriteRune(r)
		case r == ' ' || r == '.' || r == '-':
			b.WriteRune('_')
		}
	}
	name := strings.Trim(b.String(), "_")
	if len(name) < 3 {
		name = fmt.Sprintf("neighbour%d", gofakeit.Number(100, 999))
	}
	return name
}

func seedUsers(n int) []models.User {
	hash, err := bcrypt.GenerateFromPassword([]byte(demoPassword), bcrypt.DefaultCost)
	if err != nil {
		log.Fatal(err)
	}

	users := make([]models.User, 0, n)
	for i := 0; i < n; i++ {
		name := handle(gofakeit.Username())
		user := models.User{
			Username: name,
			Email:    fmt.Sprintf("%s%d%s", name, i, demoDomain),
			Password: string(hash),
		}
		if err := database.DB.Create(&user).Error; err != nil {
			continue // duplicate username, just skip this one
		}
		users = append(users, user)
	}
	fmt.Printf("users:        %d\n", len(users))
	return users
}

func seedCommunities(users []models.User) []models.Community {
	out := make([]models.Community, 0, len(communities))
	for i, c := range communities {
		community := models.Community{
			Name:        c.name,
			Description: c.description,
			Rules:       pq.StringArray(c.rules),
			CreatorID:   users[i%len(users)].ID,
		}
		// the base communities already exist from the app's own seeding
		database.DB.Where(models.Community{Name: c.name}).
			Assign(models.Community{
				Description: c.description,
				Rules:       pq.StringArray(c.rules),
				CreatorID:   community.CreatorID,
			}).
			FirstOrCreate(&community)
		out = append(out, community)
	}
	fmt.Printf("communities:  %d\n", len(out))
	return out
}

func seedMemberships(users []models.User, comms []models.Community) {
	count := 0
	for _, u := range users {
		for _, c := range comms {
			if rand.Float64() < 0.55 {
				if repository.JoinCommunity(u.ID, c.ID) == nil {
					count++
				}
			}
		}
	}
	fmt.Printf("memberships:  %d\n", count)
}

func seedPosts(users []models.User, target int) []models.Post {
	byName := map[string]uint{}
	var all []models.Community
	database.DB.Find(&all)
	for _, c := range all {
		byName[c.Name] = c.ID
	}

	posts := make([]models.Post, 0, target)
	for i := 0; i < target; i++ {
		seed := postSeeds[i%len(postSeeds)]
		communityID, ok := byName[seed.community]
		if !ok {
			continue
		}

		title := seed.title
		content := seed.content
		// past the curated set, vary the wording so the feed doesn't read as a loop
		if i >= len(postSeeds) {
			content = seed.content + "\n\n" + gofakeit.Paragraph(1, 3, 12, " ")
		}

		post := models.Post{
			Title:       title,
			Content:     content,
			Tags:        pq.StringArray(seed.tags),
			AuthorID:    author(users),
			CommunityID: communityID,
			CreatedAt:   time.Now().Add(-time.Duration(rand.Intn(20*24)) * time.Hour),
		}
		if err := database.DB.Create(&post).Error; err != nil {
			continue
		}
		posts = append(posts, post)
	}
	fmt.Printf("posts:        %d\n", len(posts))
	return posts
}

func seedComments(users []models.User, posts []models.Post) {
	count := 0
	for _, p := range posts {
		for i := 0; i < 1+rand.Intn(6); i++ {
			comment := models.Comment{
				PostID:    p.ID,
				AuthorID:  author(users),
				Content:   commentSeeds[rand.Intn(len(commentSeeds))],
				CreatedAt: p.CreatedAt.Add(time.Duration(rand.Intn(48)) * time.Hour),
			}
			if database.DB.Create(&comment).Error != nil {
				continue
			}
			count++

			// occasionally someone replies to that comment
			if rand.Float64() < 0.35 {
				parent := comment.ID
				reply := models.Comment{
					PostID:    p.ID,
					ParentID:  &parent,
					AuthorID:  author(users),
					Content:   commentSeeds[rand.Intn(len(commentSeeds))],
					CreatedAt: comment.CreatedAt.Add(time.Duration(rand.Intn(12)) * time.Hour),
				}
				if database.DB.Create(&reply).Error == nil {
					count++
				}
			}
		}
	}
	fmt.Printf("comments:     %d\n", count)
}

func seedVotes(users []models.User, posts []models.Post) {
	count := 0
	for _, p := range posts {
		for _, u := range users {
			if rand.Float64() > 0.45 {
				continue
			}
			value := 1
			if rand.Float64() < 0.12 {
				value = -1
			}
			if _, err := repository.CastVote(u.ID, p.ID, value); err == nil {
				count++
			}
		}
	}
	fmt.Printf("votes:        %d\n", count)
}

func seedNotices(users []models.User) {
	var general models.Community
	if database.DB.Where("name = ?", "general").First(&general).Error != nil {
		return
	}
	var safety models.Community
	database.DB.Where("name = ?", "safety").First(&safety)
	safetyID := safety.ID
	if safetyID == 0 {
		safetyID = general.ID
	}

	alerts := 0
	for _, a := range alertSeeds {
		alert := models.Alert{
			Kind:        "alert",
			Title:       a.title,
			Description: a.description,
			Category:    a.category,
			AuthorID:    author(users),
			CommunityID: safetyID,
			CreatedAt:   time.Now().Add(-time.Duration(rand.Intn(10*24)) * time.Hour),
		}
		if database.DB.Create(&alert).Error == nil {
			alerts++
			// a few neighbours back it, which is what sets the priority
			for _, u := range users {
				if rand.Float64() < 0.4 {
					repository.CastAlertVote(u.ID, alert.ID, 1)
				}
			}
		}
	}

	announcements := 0
	for _, a := range announcementSeeds {
		when := time.Now().AddDate(0, 0, a.daysOut).Truncate(time.Hour).Add(10 * time.Hour)
		announcement := models.Alert{
			Kind:        "announcement",
			Title:       a.title,
			Description: a.description,
			Category:    a.category,
			Location:    a.location,
			EventDate:   &when,
			AuthorID:    author(users),
			CommunityID: general.ID,
			CreatedAt:   time.Now().Add(-time.Duration(rand.Intn(5*24)) * time.Hour),
		}
		if database.DB.Create(&announcement).Error == nil {
			announcements++
			for _, u := range users {
				if rand.Float64() < 0.3 {
					repository.CastAlertVote(u.ID, announcement.ID, 1)
				}
			}
		}
	}
	fmt.Printf("alerts:       %d\nannouncements: %d\n", alerts, announcements)
}

func seedResources(users []models.User) {
	count := 0
	for _, r := range resourceSeeds {
		resource := models.Resource{
			Type:        r.rType,
			Title:       r.title,
			Description: r.description,
			Content:     r.content,
			Tags:        pq.StringArray(r.tags),
			IsPublic:    true,
			AuthorID:    author(users),
			CreatedAt:   time.Now().Add(-time.Duration(rand.Intn(15*24)) * time.Hour),
		}
		if repository.CreateResource(&resource) != nil {
			continue
		}
		count++
		for _, c := range r.cards {
			repository.AddCard(resource.ID, c[0], c[1])
		}
	}
	fmt.Printf("resources:    %d\n", count)
}

const mediaDir = "./storage/media"

// writeDemoFile drops a real file into the upload directory and returns the URL
// the app serves it from — the document and media sections need something that
// actually downloads, not a dangling path.
func writeDemoFile(name string, data []byte) (string, error) {
	if err := os.MkdirAll(mediaDir, 0755); err != nil {
		return "", err
	}
	filename := fmt.Sprintf("demo-%s", name)
	if err := os.WriteFile(filepath.Join(mediaDir, filename), data, 0644); err != nil {
		return "", err
	}
	return "/uploads/" + filename, nil
}

// solidPNG renders a small plain image so media cards have a real thumbnail.
func solidPNG(c color.RGBA) []byte {
	img := image.NewRGBA(image.Rect(0, 0, 480, 270))
	draw.Draw(img, img.Bounds(), &image.Uniform{c}, image.Point{}, draw.Src)
	var buf bytes.Buffer
	png.Encode(&buf, img)
	return buf.Bytes()
}

// seedUploads adds the document and media resources, with files behind them.
func seedUploads(users []models.User) {
	timetable := []byte(`REVISION TIMETABLE — TERM 3

Mon  16:00  Maths      past paper, section A
Tue  16:00  Biology    photosynthesis + respiration
Wed  16:00  English    essay practice, one timed piece
Thu  16:00  Chemistry  common ions, balancing equations
Fri  16:00  Catch-up   whatever went worst this week

Sat morning: group session at the library, room 2.
Sun: rest. Actually rest.
`)

	count := 0
	if url, err := writeDemoFile("revision-timetable.txt", timetable); err == nil {
		r := models.Resource{
			Type: "document", Title: "Term 3 revision timetable",
			Description: "The timetable our study group is working to. Steal it.",
			Tags:        pq.StringArray{"study", "timetable"},
			IsPublic:    true, FileURL: url, FileName: "revision-timetable.txt",
			FileType: "document", AuthorID: author(users),
		}
		if repository.CreateResource(&r) == nil {
			count++
		}
	}

	if url, err := writeDemoFile("clean-up-day.png", solidPNG(color.RGBA{R: 74, G: 124, B: 89, A: 255})); err == nil {
		r := models.Resource{
			Type: "media", Title: "Photos from the last clean-up",
			Description: "Before and after along the river path.",
			Tags:        pq.StringArray{"cleanup", "volunteering"},
			IsPublic:    true, FileURL: url, FileName: "clean-up-day.png",
			FileType: "image", AuthorID: author(users),
		}
		if repository.CreateResource(&r) == nil {
			count++
		}
	}
	fmt.Printf("uploads:      %d\n", count)
}

func seedFollows(users []models.User) {
	count := 0
	for _, a := range users {
		for _, b := range users {
			if a.ID == b.ID || rand.Float64() > 0.3 {
				continue
			}
			if repository.FollowUser(a.ID, b.ID) == nil {
				count++
			}
		}
	}
	fmt.Printf("follows:      %d\n", count)
}

func seedConversations(users []models.User) {
	openers := []string{
		"Hey, are you going to the clean-up on Saturday?",
		"Did you see the notice about the water going off?",
		"Do you still have those past papers?",
		"Thanks for the lift yesterday, really appreciated.",
	}
	replies := []string{
		"Yes, planning to. Want to walk down together?",
		"I did — apparently it's only the morning.",
		"I do, I'll send them over tonight.",
		"Any time, glad it helped.",
		"Let me check and get back to you.",
	}

	count := 0
	for i := 0; i+1 < len(users) && i < 6; i += 2 {
		a, b := users[i], users[i+1]
		convo := models.Conversation{UserAID: a.ID, UserBID: b.ID}
		if database.DB.Create(&convo).Error != nil {
			continue
		}
		count++

		base := time.Now().Add(-time.Duration(rand.Intn(72)) * time.Hour)
		turns := []struct {
			sender uint
			text   string
		}{
			{a.ID, openers[rand.Intn(len(openers))]},
			{b.ID, replies[rand.Intn(len(replies))]},
			{a.ID, replies[rand.Intn(len(replies))]},
		}
		for j, t := range turns {
			database.DB.Create(&models.Message{
				ConversationID: convo.ID,
				SenderID:       t.sender,
				Content:        t.text,
				CreatedAt:      base.Add(time.Duration(j*7) * time.Minute),
			})
		}
	}
	fmt.Printf("conversations: %d\n", count)
}

// removeDemoData deletes everything owned by demo accounts, and nothing else.
func removeDemoData() {
	var ids []uint
	database.DB.Model(&models.User{}).
		Where("email LIKE ?", "%"+demoDomain).
		Pluck("id", &ids)

	if len(ids) == 0 {
		fmt.Println("No demo data found.")
		return
	}

	postIDs := []uint{}
	database.DB.Model(&models.Post{}).Where("author_id IN ?", ids).Pluck("id", &postIDs)
	commentIDs := []uint{}
	database.DB.Model(&models.Comment{}).Where("author_id IN ?", ids).Pluck("id", &commentIDs)
	resourceIDs := []uint{}
	database.DB.Model(&models.Resource{}).Where("author_id IN ?", ids).Pluck("id", &resourceIDs)
	convoIDs := []uint{}
	database.DB.Model(&models.Conversation{}).
		Where("user_a_id IN ? OR user_b_id IN ?", ids, ids).Pluck("id", &convoIDs)

	database.DB.Where("user_id IN ?", ids).Delete(&models.Vote{})
	if len(postIDs) > 0 {
		database.DB.Where("post_id IN ?", postIDs).Delete(&models.Vote{})
		database.DB.Where("post_id IN ?", postIDs).Delete(&models.Comment{})
		database.DB.Where("post_id IN ?", postIDs).Delete(&models.PostMedia{})
	}
	if len(commentIDs) > 0 {
		database.DB.Where("comment_id IN ?", commentIDs).Delete(&models.Vote{})
	}
	if len(resourceIDs) > 0 {
		database.DB.Where("resource_id IN ?", resourceIDs).Delete(&models.FlashcardCard{})
	}
	if len(convoIDs) > 0 {
		database.DB.Where("conversation_id IN ?", convoIDs).Delete(&models.Message{})
		database.DB.Where("id IN ?", convoIDs).Delete(&models.Conversation{})
	}

	database.DB.Where("author_id IN ?", ids).Delete(&models.Comment{})
	database.DB.Where("author_id IN ?", ids).Delete(&models.Post{})
	database.DB.Where("author_id IN ?", ids).Delete(&models.Resource{})
	database.DB.Where("author_id IN ?", ids).Delete(&models.Alert{})
	database.DB.Where("follower_id IN ? OR following_id IN ?", ids, ids).Delete(&models.Follow{})
	database.DB.Where("user_id IN ?", ids).Delete(&models.UserBadge{})
	database.DB.Where("user_id IN ?", ids).Delete(&models.CommunityMember{})
	// communities outlive their founder — null the reference rather than leave a
	// dangling one, or the delete below trips the foreign key
	database.DB.Model(&models.Community{}).
		Where("creator_id IN ?", ids).
		Update("creator_id", nil)

	if err := database.DB.Where("id IN ?", ids).Delete(&models.User{}).Error; err != nil {
		log.Fatalf("could not remove demo users: %v", err)
	}

	// the files the seeder wrote are all prefixed, so they're safe to sweep
	if entries, err := os.ReadDir(mediaDir); err == nil {
		for _, e := range entries {
			if strings.HasPrefix(e.Name(), "demo-") {
				os.Remove(filepath.Join(mediaDir, e.Name()))
			}
		}
	}

	fmt.Printf("Removed %d demo users and everything they created.\n", len(ids))
	removeSeededCommunities()
}

// communities that ship with the app and must survive a clean
var baseCommunities = map[string]bool{"general": true, "showcase": true, "help": true}

// removeSeededCommunities drops the ones this seeder introduced, but only once
// they're empty — anything a real user posted into keeps its community alive.
func removeSeededCommunities() {
	removed := 0
	for _, c := range communities {
		if baseCommunities[c.name] {
			continue
		}

		var community models.Community
		if database.DB.Where("name = ?", c.name).First(&community).Error != nil {
			continue
		}

		var posts, alerts, members int64
		database.DB.Model(&models.Post{}).Where("community_id = ?", community.ID).Count(&posts)
		database.DB.Model(&models.Alert{}).Where("community_id = ?", community.ID).Count(&alerts)
		database.DB.Model(&models.CommunityMember{}).Where("community_id = ?", community.ID).Count(&members)
		if posts+alerts+members > 0 {
			continue
		}

		database.DB.Delete(&community)
		removed++
	}
	if removed > 0 {
		fmt.Printf("Removed %d empty demo communities.\n", removed)
	}
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
