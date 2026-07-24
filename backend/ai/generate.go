package ai

import (
	"encoding/json"
	"fmt"
)

type GeneratedCard struct {
	Front string `json:"front"`
	Back  string `json:"back"`
}

type flashcardResponse struct {
	Cards []GeneratedCard `json:"cards"`
}

func buildSourcePrompt(topic, sourceText string) string {
	if sourceText != "" {
		// truncate to keep prompt size reasonable
		if len(sourceText) > 12000 {
			sourceText = sourceText[:12000]
		}
		if topic != "" {
			return fmt.Sprintf("Topic: %s\n\nSource material:\n%s", topic, sourceText)
		}
		return "Source material:\n" + sourceText
	}
	return topic
}

func GenerateFlashcards(topic, sourceText string, count int) ([]GeneratedCard, error) {
	source := buildSourcePrompt(topic, sourceText)
	prompt := fmt.Sprintf(
		`Based on the following, generate exactly %d flashcards. Respond ONLY with JSON in this exact shape, no extra text: {"cards": [{"front": "question", "back": "answer"}, ...]}

%s`,
		count, source,
	)

	raw, err := Complete(prompt, true)
	if err != nil {
		return nil, err
	}

	var parsed flashcardResponse
	if err := json.Unmarshal([]byte(raw), &parsed); err != nil {
		return nil, fmt.Errorf("failed to parse AI response: %w", err)
	}

	return parsed.Cards, nil
}

func GenerateNote(topic, sourceText string) (string, error) {
	source := buildSourcePrompt(topic, sourceText)
	prompt := fmt.Sprintf(
		`Based on the following, write a well-structured study note in Markdown. Use headings, bullet points, and bold text where appropriate. Respond ONLY with the markdown content, no preamble.

%s`,
		source,
	)
	return Complete(prompt, false)
}
