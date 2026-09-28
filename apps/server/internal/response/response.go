package response

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type errorBody struct {
	Code string `json:"code"`
}

type meta struct {
	Timestamp string `json:"timestamp"`
}

type body struct {
	Success bool       `json:"success"`
	Data    any        `json:"data,omitempty"`
	Message string     `json:"message"`
	Error   *errorBody `json:"error,omitempty"`
	Meta    meta       `json:"meta"`
}

func Success(c *gin.Context, data any, message string, status int) {
	c.JSON(status, body{
		Success: true,
		Data:    data,
		Message: message,
		Meta:    now(),
	})
}

func Error(c *gin.Context, code, message string, status int) {
	c.JSON(status, body{
		Success: false,
		Message: message,
		Error:   &errorBody{Code: code},
		Meta:    now(),
	})
}

func NotAuthorized(c *gin.Context) {
	Error(c, "NOT_AUTHORIZED", "Not authorized", http.StatusUnauthorized)
}

func SystemError(c *gin.Context) {
	Error(c, "SYSTEM_ERROR", "Internal server error", http.StatusInternalServerError)
}

func now() meta {
	return meta{Timestamp: time.Now().UTC().Format(time.RFC3339)}
}
