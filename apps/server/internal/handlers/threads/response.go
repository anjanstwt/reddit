package threads

import (
	"encoding/json"
	"time"

	"reddit/server/internal/models"
)

type authorResponse struct {
	ID       string  `json:"id"`
	Username *string `json:"username"`
	Name     string  `json:"name"`
	Image    *string `json:"image"`
}

type communityRef struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type threadResponse struct {
	ID           string            `json:"id"`
	Community    *communityRef     `json:"community,omitempty"`
	Author       *authorResponse   `json:"author"`
	ParentID     *string           `json:"parentId"`
	RootID       *string           `json:"rootId"`
	Depth        int               `json:"depth"`
	Title        *string           `json:"title"`
	Body         json.RawMessage   `json:"body"`
	Pinned       bool              `json:"pinned"`
	Locked       bool              `json:"locked"`
	Score        int               `json:"score"`
	Upvotes      int               `json:"upvotes"`
	Downvotes    int               `json:"downvotes"`
	ReplyCount   int               `json:"replyCount"`
	CommentCount int               `json:"commentCount"`
	EditedAt     *time.Time        `json:"editedAt"`
	DeletedAt    *time.Time        `json:"deletedAt"`
	CreatedAt    time.Time         `json:"createdAt"`
	ViewerVote   int16             `json:"viewerVote"`
	Saved        bool              `json:"saved"`
	Replies      []*threadResponse `json:"replies,omitempty"`
}

func toThreadResponse(t *models.Thread) *threadResponse {
	res := &threadResponse{
		ID:           t.ID,
		ParentID:     t.ParentID,
		RootID:       t.RootID,
		Depth:        t.Depth,
		Title:        t.Title,
		Body:         t.Body,
		Pinned:       t.Pinned,
		Locked:       t.Locked,
		Score:        t.Score,
		Upvotes:      t.Upvotes,
		Downvotes:    t.Downvotes,
		ReplyCount:   t.ReplyCount,
		CommentCount: t.CommentCount,
		EditedAt:     t.EditedAt,
		DeletedAt:    t.DeletedAt,
		CreatedAt:    t.CreatedAt,
	}
	if t.Community != nil {
		res.Community = &communityRef{ID: t.Community.ID, Name: t.Community.Name}
	}

	if t.DeletedAt != nil {
		res.Title, res.Body = nil, nil
		return res
	}
	if t.Author != nil {
		res.Author = &authorResponse{
			ID:       t.Author.ID,
			Username: t.Author.Username,
			Name:     t.Author.Name,
			Image:    t.Author.Image,
		}
	}
	return res
}

func buildTree(comments []models.Thread) []*threadResponse {
	nodes := make(map[string]*threadResponse, len(comments))
	for i := range comments {
		nodes[comments[i].ID] = toThreadResponse(&comments[i])
	}

	top := []*threadResponse{}
	for i := range comments {
		node := nodes[comments[i].ID]
		if parent, ok := nodes[*comments[i].ParentID]; ok {
			parent.Replies = append(parent.Replies, node)
		} else {
			top = append(top, node)
		}
	}
	return top
}
