package threads

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm/clause"

	"reddit/server/internal/middleware"
	"reddit/server/internal/models"
	"reddit/server/internal/pagination"
	"reddit/server/internal/response"
)

// controller for saving a thread
func (h *Handler) Save(c *gin.Context) {
	thread, ok := h.findThread(c)
	if !ok {
		return
	}
	if thread.DeletedAt != nil {
		response.Error(c, "THREAD_DELETED", "Can't save a deleted thread", http.StatusBadRequest)
		return
	}

	saved := models.SavedThread{UserID: c.GetString(middleware.UserIDKey), ThreadID: thread.ID}
	if err := h.DB.Clauses(clause.OnConflict{DoNothing: true}).Create(&saved).Error; err != nil {
		response.SystemError(c)
		return
	}

	response.Success(c, nil, "Saved", http.StatusOK)
}

// controller for unsaving a thread
func (h *Handler) Unsave(c *gin.Context) {
	thread, ok := h.findThread(c)
	if !ok {
		return
	}

	err := h.DB.Delete(&models.SavedThread{}, "user_id = ? AND thread_id = ?", c.GetString(middleware.UserIDKey), thread.ID).Error
	if err != nil {
		response.SystemError(c)
		return
	}

	response.Success(c, nil, "Unsaved", http.StatusOK)
}

// controller for fetching saved threads
func (h *Handler) ListSaved(c *gin.Context) {
	limit, offset, ok := pagination.Parse(c)
	if !ok {
		return
	}
	me := c.GetString(middleware.UserIDKey)

	var saved []models.SavedThread
	err := h.DB.Preload("Thread.Author").Preload("Thread.Community").
		Where("user_id = ?", me).
		Order("created_at DESC").Limit(limit).Offset(offset).
		Find(&saved).Error
	if err != nil {
		response.SystemError(c)
		return
	}

	res := make([]*threadResponse, len(saved))
	for i := range saved {
		res[i] = toThreadResponse(saved[i].Thread)
	}
	if err := h.decorate(me, res...); err != nil {
		response.SystemError(c)
		return
	}

	response.Success(c, res, "Saved threads fetched successfully", http.StatusOK)
}
