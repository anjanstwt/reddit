package threads

import "reddit/server/internal/models"

func (h *Handler) attachViewerState(userID string, roots ...*threadResponse) error {
	if userID == "" || len(roots) == 0 {
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

	ids := make([]string, 0, len(byID))
	for id := range byID {
		ids = append(ids, id)
	}

	var votes []models.ThreadVote
	if err := h.DB.Where("user_id = ? AND thread_id IN ?", userID, ids).Find(&votes).Error; err != nil {
		return err
	}
	for _, v := range votes {
		byID[v.ThreadID].ViewerVote = v.Value
	}

	var savedIDs []string
	err := h.DB.Model(&models.SavedThread{}).
		Where("user_id = ? AND thread_id IN ?", userID, ids).
		Pluck("thread_id", &savedIDs).Error
	if err != nil {
		return err
	}
	for _, id := range savedIDs {
		byID[id].Saved = true
	}
	return nil
}
