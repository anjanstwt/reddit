package threads

import (
	"bytes"
	"encoding/json"
	"net/http"
	"regexp"
	"strings"
	"unicode/utf8"

	"github.com/gin-gonic/gin"

	"reddit/server/internal/response"
)

const (
	maxTitleLength = 300
	maxBodyBytes   = 40 << 10 // 40 KB
)

var (
	uuidPattern = regexp.MustCompile(`^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$`)
	emptyDoc    = json.RawMessage(`{"type":"doc","content":[]}`)
)

func validTitle(c *gin.Context, title string) (string, bool) {
	title = strings.TrimSpace(title)
	if title == "" || utf8.RuneCountInString(title) > maxTitleLength {
		response.Error(c, "INVALID_TITLE", "Title must be 1-300 characters", http.StatusBadRequest)
		return "", false
	}
	return title, true
}

func validBody(c *gin.Context, raw json.RawMessage, required bool) (json.RawMessage, bool) {
	if len(raw) == 0 || string(raw) == "null" {
		if required {
			response.Error(c, "EMPTY_BODY", "Body is required", http.StatusBadRequest)
			return nil, false
		}
		return emptyDoc, true
	}
	if len(raw) > maxBodyBytes {
		response.Error(c, "BODY_TOO_LARGE", "Body must be at most 40 KB", http.StatusBadRequest)
		return nil, false
	}

	var doc struct {
		Type    string            `json:"type"`
		Content []json.RawMessage `json:"content"`
	}
	if err := json.Unmarshal(raw, &doc); err != nil || doc.Type != "doc" {
		response.Error(c, "INVALID_BODY", "Body must be a Tiptap document", http.StatusBadRequest)
		return nil, false
	}
	if required && len(doc.Content) == 0 {
		response.Error(c, "EMPTY_BODY", "Body is required", http.StatusBadRequest)
		return nil, false
	}

	var compact bytes.Buffer
	if err := json.Compact(&compact, raw); err != nil {
		response.Error(c, "INVALID_BODY", "Body must be a Tiptap document", http.StatusBadRequest)
		return nil, false
	}
	return compact.Bytes(), true
}
