// uploads/uploads.go
package uploads

import (
	"archive/zip"
	"errors"
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"regexp"
	"strings"

	"github.com/google/uuid"
	"github.com/ledongthuc/pdf"
)

// Files land outside the source tree — the old ./uploads dir was this package's
// own directory, so serving it statically exposed the .go sources.
// Public URLs stay /uploads/<name>; main.go maps that prefix here.
const uploadDir = "./storage/media"

// ErrInvalidUpload marks a rejection the caller caused (bad type, too big),
// so handlers can answer 400 instead of 500.
var ErrInvalidUpload = errors.New("invalid upload")

// Per-type upload ceilings. Video gets more headroom than stills.
const (
	MaxImageSize = 10 << 20 // 10 MB
	MaxVideoSize = 50 << 20 // 50 MB
	MaxOtherSize = 15 << 20 // 15 MB
)

func init() {
	os.MkdirAll(uploadDir, 0755)
}

func maxSizeFor(mediaType string) int64 {
	switch mediaType {
	case "image":
		return MaxImageSize
	case "video":
		return MaxVideoSize
	default:
		return MaxOtherSize
	}
}

// SaveFile writes an uploaded file to disk and returns its public URL + detected media type.
func SaveFile(fileHeader *multipart.FileHeader) (url string, mediaType string, err error) {
	ext := strings.ToLower(filepath.Ext(fileHeader.Filename))
	mediaType = detectMediaType(ext)
	if mediaType == "file" {
		return "", "", fmt.Errorf("%w: unsupported file type %q", ErrInvalidUpload, ext)
	}
	if limit := maxSizeFor(mediaType); fileHeader.Size > limit {
		return "", "", fmt.Errorf("%w: file is too large (max %d MB for %ss)", ErrInvalidUpload, limit>>20, mediaType)
	}

	src, err := fileHeader.Open()
	if err != nil {
		return "", "", err
	}
	defer src.Close()

	filename := uuid.New().String() + ext
	destPath := filepath.Join(uploadDir, filename)

	dst, err := os.Create(destPath)
	if err != nil {
		return "", "", err
	}
	defer dst.Close()

	if _, err := io.Copy(dst, src); err != nil {
		return "", "", err
	}

	return "/uploads/" + filename, mediaType, nil
}

func detectMediaType(ext string) string {
	switch ext {
	case ".png", ".jpg", ".jpeg", ".gif", ".webp":
		return "image"
	case ".mp4", ".webm", ".mov":
		return "video"
	case ".pdf", ".txt", ".docx":
		return "document"
	default:
		return "file"
	}
}

// ExtractText saves the file temporarily and pulls plain text out of it based on extension.
func ExtractText(fileHeader *multipart.FileHeader) (string, error) {
	src, err := fileHeader.Open()
	if err != nil {
		return "", err
	}
	defer src.Close()

	ext := strings.ToLower(filepath.Ext(fileHeader.Filename))

	tmpPath := filepath.Join(os.TempDir(), uuid.New().String()+ext)
	tmp, err := os.Create(tmpPath)
	if err != nil {
		return "", err
	}
	defer os.Remove(tmpPath)

	if _, err := io.Copy(tmp, src); err != nil {
		tmp.Close()
		return "", err
	}
	tmp.Close()

	switch ext {
	case ".txt":
		data, err := os.ReadFile(tmpPath)
		if err != nil {
			return "", err
		}
		return string(data), nil
	case ".pdf":
		return extractPDFText(tmpPath)
	case ".docx":
		return extractDocxText(tmpPath)
	default:
		return "", fmt.Errorf("unsupported file type: %s", ext)
	}
}

func extractPDFText(path string) (string, error) {
	f, r, err := pdf.Open(path)
	if err != nil {
		return "", err
	}
	defer f.Close()

	var sb strings.Builder
	totalPage := r.NumPage()
	for i := 1; i <= totalPage; i++ {
		p := r.Page(i)
		if p.V.IsNull() {
			continue
		}
		text, err := p.GetPlainText(nil)
		if err != nil {
			continue
		}
		sb.WriteString(text)
		sb.WriteString("\n")
	}
	return sb.String(), nil
}

var xmlTagRegex = regexp.MustCompile(`<[^>]+>`)

func extractDocxText(path string) (string, error) {
	r, err := zip.OpenReader(path)
	if err != nil {
		return "", err
	}
	defer r.Close()

	for _, f := range r.File {
		if f.Name != "word/document.xml" {
			continue
		}
		rc, err := f.Open()
		if err != nil {
			return "", err
		}
		defer rc.Close()

		data, err := io.ReadAll(rc)
		if err != nil {
			return "", err
		}

		// crude but effective: strip XML tags, leaving raw text content
		text := xmlTagRegex.ReplaceAllString(string(data), " ")
		text = strings.Join(strings.Fields(text), " ") // collapse whitespace
		return text, nil
	}
	return "", fmt.Errorf("could not find document content in docx")
}
