package threads

import (
	"reddit/server/internal/mediaref"
	"reddit/server/internal/models"
)

func (h *Handler) decorate(viewerID string, roots ...*threadResponse) error {
	if len(roots) == 0 {
		return nil
	}

	byID := map[string]*threadResponse{}
	var walk func(nodes []*threadResponse)
	walk = func(nodes []*threadResponse) {
		for _, n := range nodes {
			byID[n.ID] = n
			walk(n.Replies)
		}
	}
	walk(roots)

	if err := h.attachMedia(byID); err != nil {
		return err
	}
	if err := h.attachAvatars(byID); err != nil {
		return err
	}
	return h.attachViewerState(viewerID, byID)
}

func (h *Handler) attachMedia(byID map[string]*threadResponse) error {
	ids := make([]string, 0, len(byID))
	for id, n := range byID {
		if n.DeletedAt == nil {
			ids = append(ids, id)
		}
	}
	if len(ids) == 0 {
		return nil
	}

	var links []models.ThreadMedia
	if err := h.DB.Preload("Media").Where("thread_id IN ?", ids).Find(&links).Error; err != nil {
		return err
	}
	for _, link := range links {
		n := byID[link.ThreadID]
		if n.Media == nil {
			n.Media = map[string]mediaref.Info{}
		}
		n.Media[link.MediaID] = mediaref.ToInfo(h.Storage, link.Media)
	}
	return nil
}

func (h *Handler) attachAvatars(byID map[string]*threadResponse) error {
	var ids []string
	for _, n := range byID {
		if n.Author != nil && n.Author.avatarMediaID != nil {
			ids = append(ids, *n.Author.avatarMediaID)
		}
	}

	urls, err := mediaref.URLs(h.DB, h.Storage, ids)
	if err != nil {
		return err
	}
	for _, n := range byID {
		if n.Author == nil || n.Author.avatarMediaID == nil {
			continue
		}
		if url, ok := urls[*n.Author.avatarMediaID]; ok {
			n.Author.AvatarURL = &url
		}
	}
	return nil
}
