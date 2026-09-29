package pagination

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"reddit/server/internal/response"
)

const (
	defaultLimit = 25
	maxLimit     = 100
)

func Parse(c *gin.Context) (limit, offset int, ok bool) {
	limit, err := strconv.Atoi(c.DefaultQuery("limit", strconv.Itoa(defaultLimit)))
	if err != nil || limit < 1 || limit > maxLimit {
		response.Error(c, "INVALID_LIMIT", "limit must be 1-100", http.StatusBadRequest)
		return 0, 0, false
	}
	offset, err = strconv.Atoi(c.DefaultQuery("offset", "0"))
	if err != nil || offset < 0 {
		response.Error(c, "INVALID_OFFSET", "offset must be 0 or more", http.StatusBadRequest)
		return 0, 0, false
	}
	return limit, offset, true
}
