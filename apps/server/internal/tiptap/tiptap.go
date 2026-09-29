package tiptap

import (
	"encoding/json"
	"errors"
	"regexp"
)

var (
	ErrBadMedia = errors.New("image and video nodes need a valid mediaId")
	uuidPattern = regexp.MustCompile(`^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$`)
)

type MediaRef struct {
	ID   string
	Kind string
}

type Refs struct {
	UserIDs      []string
	CommunityIDs []string
	Media        []MediaRef
}

type node struct {
	Type    string         `json:"type"`
	Attrs   map[string]any `json:"attrs"`
	Content []node         `json:"content"`
}

func Extract(body json.RawMessage) (Refs, error) {
	var root node
	if err := json.Unmarshal(body, &root); err != nil {
		return Refs{}, err
	}

	var refs Refs
	var err error
	seen := map[string]bool{}

	var walk func(n node)
	walk = func(n node) {
		switch n.Type {
		case "mention":
			kind, _ := n.Attrs["kind"].(string)
			id, _ := n.Attrs["id"].(string)
			if !uuidPattern.MatchString(id) || seen[kind+id] {
				break
			}
			seen[kind+id] = true
			switch kind {
			case "user":
				refs.UserIDs = append(refs.UserIDs, id)
			case "community":
				refs.CommunityIDs = append(refs.CommunityIDs, id)
			}
		case "image", "video":
			id, _ := n.Attrs["mediaId"].(string)
			if !uuidPattern.MatchString(id) {
				err = ErrBadMedia
				break
			}
			if !seen["media"+id] {
				seen["media"+id] = true
				refs.Media = append(refs.Media, MediaRef{ID: id, Kind: n.Type})
			}
		}
		for _, child := range n.Content {
			walk(child)
		}
	}
	walk(root)

	return refs, err
}
