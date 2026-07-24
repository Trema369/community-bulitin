// ai/client.go
package ai

import (
	"bytes"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"os"
	"time"
)

type contentMessage struct {
	Content string `json:"content"`
	Role    string `json:"role"`
}

type requestBody struct {
	Messages       []contentMessage `json:"messages"`
	Model          string           `json:"model"`
	ResponseFormat *responseFormat  `json:"response_format,omitempty"`
}

type responseFormat struct {
	Type string `json:"type"`
}

type responseMessage struct {
	Content string `json:"content"`
}

type choice struct {
	Message responseMessage `json:"message"`
}

type apiResponse struct {
	Choices []choice `json:"choices"`
}

func getAPIKey() string {
	return os.Getenv("MISTRAL_API_KEY")
}

// Complete sends a single user prompt and returns the raw text response.
// jsonMode forces Mistral to return valid JSON only (used for flashcards).
func Complete(prompt string, jsonMode bool) (string, error) {
	apiKey := getAPIKey()
	if apiKey == "" {
		return "", errors.New("MISTRAL_API_KEY not set")
	}

	body := requestBody{
		Messages: []contentMessage{{Role: "user", Content: prompt}},
		Model:    "mistral-large-latest",
	}
	if jsonMode {
		body.ResponseFormat = &responseFormat{Type: "json_object"}
	}

	jsonData, err := json.Marshal(body)
	if err != nil {
		return "", err
	}

	req, err := http.NewRequest("POST", "https://api.mistral.ai/v1/chat/completions", bytes.NewBuffer(jsonData))
	if err != nil {
		return "", err
	}
	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 90 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	if resp.StatusCode != http.StatusOK {
		return "", errors.New("mistral api error: " + string(respBody))
	}

	var parsed apiResponse
	if err := json.Unmarshal(respBody, &parsed); err != nil {
		return "", err
	}
	if len(parsed.Choices) == 0 {
		return "", errors.New("no response from mistral")
	}

	return parsed.Choices[0].Message.Content, nil
}
