package utils

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	_ "github.com/joho/godotenv/autoload"

	"gorm.io/gorm"
)

type ContactRequest struct {
	FromSite string `json:"from_site"`
	Name     string `json:"name"`
	Email    string `json:"email"`
	Message  string `json:"message"`
}

type ContactResponse struct {
	Status  string `json:"status"`
	Message string `json:"message"`
}

type ProjectRequest struct {
	gorm.Model
	RequestId string `gorm:"primaryKey"`
	FromSite  string
	Name      string
	Email     string
	Message   string
	Replied   bool
	Note      string
	UpdatedAt time.Time
	CreatedAt time.Time
}

func RespondJSON(w http.ResponseWriter, code int, status string, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)

	err := json.NewEncoder(w).Encode(ContactResponse{
		Status:  status,
		Message: message,
	})
	if err != nil {
		log.Fatalln(err)
	}
}
