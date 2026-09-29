package threads

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	"reddit/server/internal/middleware"
	"reddit/server/internal/models"
	"reddit/server/internal/response"
)

type voteResponse struct {
	Score      int   `json:"score"`
	Upvotes    int   `json:"upvotes"`
	Downvotes  int   `json:"downvotes"`
	ViewerVote int16 `json:"viewerVote"`
}

// controller for voting on a thread
func (h *Handler) Vote(c *gin.Context) {
	var body struct {
		Value *int16 `json:"value"`
	}
	if err := c.ShouldBindJSON(&body); err != nil || body.Value == nil || *body.Value < -1 || *body.Value > 1 {
		response.Error(c, "INVALID_VOTE", "value must be 1, -1 or 0", http.StatusBadRequest)
		return
	}
	thread, ok := h.findThread(c)
	if !ok {
		return
	}
	if thread.DeletedAt != nil {
		response.Error(c, "THREAD_DELETED", "Can't vote on a deleted thread", http.StatusBadRequest)
		return
	}

	me, next := c.GetString(middleware.UserIDKey), *body.Value
	var res voteResponse

	err := h.DB.Transaction(func(tx *gorm.DB) error {
		var locked models.Thread
		err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).
			Select("id", "score", "upvotes", "downvotes").
			First(&locked, "id = ?", thread.ID).Error
		if err != nil {
			return err
		}

		var prev int16
		var existing models.ThreadVote
		err = tx.First(&existing, "user_id = ? AND thread_id = ?", me, thread.ID).Error
		switch {
		case err == nil:
			prev = existing.Value
		case !errors.Is(err, gorm.ErrRecordNotFound):
			return err
		}

		res = voteResponse{Score: locked.Score, Upvotes: locked.Upvotes, Downvotes: locked.Downvotes, ViewerVote: next}
		if prev == next {
			return nil
		}

		vote := models.ThreadVote{UserID: me, ThreadID: thread.ID, Value: next}
		switch {
		case next == 0:
			err = tx.Delete(&models.ThreadVote{}, "user_id = ? AND thread_id = ?", me, thread.ID).Error
		case prev == 0:
			err = tx.Create(&vote).Error
		default:
			err = tx.Model(&vote).Where("user_id = ? AND thread_id = ?", me, thread.ID).Update("value", next).Error
		}
		if err != nil {
			return err
		}

		up := boolInt(next == 1) - boolInt(prev == 1)
		down := boolInt(next == -1) - boolInt(prev == -1)
		res.Upvotes += up
		res.Downvotes += down
		res.Score += up - down

		return tx.Model(&models.Thread{}).Where("id = ?", thread.ID).UpdateColumns(map[string]any{
			"upvotes":   gorm.Expr("upvotes + ?", up),
			"downvotes": gorm.Expr("downvotes + ?", down),
			"score":     gorm.Expr("score + ?", up-down),
		}).Error
	})
	if err != nil {
		response.SystemError(c)
		return
	}

	response.Success(c, res, "Vote saved", http.StatusOK)
}

func boolInt(b bool) int {
	if b {
		return 1
	}
	return 0
}
