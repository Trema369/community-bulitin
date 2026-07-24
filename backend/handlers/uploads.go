// handlers/uploads.go
package handlers

import (
	"net/http"

	"com-hub/uploads"

	"github.com/gin-gonic/gin"
)

func UploadMediaHandler(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "no file provided"})
		return
	}

	url, mediaType, err := uploads.SaveFile(file)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "upload failed"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"url": url, "type": mediaType})
}

func ExtractTextHandler(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "no file provided"})
		return
	}

	text, err := uploads.ExtractText(file)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "extraction failed: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"text": text})
}
