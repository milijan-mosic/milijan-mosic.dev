package utils

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"context"

	_ "github.com/joho/godotenv/autoload"
	"github.com/resend/resend-go/v3"

	"github.com/google/uuid"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	"github.com/go-chi/chi/v5"
)

const dbPath = "emails.db"

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

func ContactRouter() http.Handler {
	r := chi.NewRouter()
	r.Post("/", HandleContact)
	return r
}

func respondJSON(w http.ResponseWriter, code int, status string, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)

	err := json.NewEncoder(w).Encode(ContactResponse{
		Status:  status,
		Message: message,
	})
	if err != nil {
		fmt.Println(err)
	}
}

func HandleContact(w http.ResponseWriter, r *http.Request) {
	var req ContactRequest

	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(&req); err != nil {
		respondJSON(w, http.StatusBadRequest, "invalid_json", "Could not parse request body")
		return
	}

	if strings.TrimSpace(req.FromSite) == "" {
		respondJSON(w, http.StatusBadRequest, "invalid_name", "`FromSite` is required")
		return
	}
	if strings.TrimSpace(req.Name) == "" {
		respondJSON(w, http.StatusBadRequest, "invalid_name", "Name is required")
		return
	}
	if !isValidEmail(req.Email) {
		respondJSON(w, http.StatusBadRequest, "invalid_email", "Valid email is required")
		return
	}
	if len(strings.TrimSpace(req.Message)) < 5 {
		respondJSON(w, http.StatusBadRequest, "invalid_message", "Message must be at least 5 characters long")
		return
	}

	sendEmail(req.Name, req.Email, req.Message)
	saveToDb(req)
	respondJSON(w, http.StatusOK, "success", "Message sent successfully")
}

func isValidEmail(email string) bool {
	email = strings.TrimSpace(email)
	if len(email) < 5 || !strings.Contains(email, "@") || !strings.Contains(email, ".") {
		return false
	}
	return true
}

func saveToDb(newRequest ContactRequest) {
	db, err := gorm.Open(sqlite.Open(dbPath), &gorm.Config{})
	if err != nil {
		fmt.Println("failed to connect database")
		return
	}

	ctx := context.Background()
	db.AutoMigrate(&ProjectRequest{})

	err = gorm.G[ProjectRequest](db).Create(ctx, &ProjectRequest{
		RequestId: uuid.New().String(),
		FromSite:  newRequest.FromSite,
		Name:      newRequest.Name,
		Email:     newRequest.Email,
		Message:   newRequest.Message,
		Replied:   false,
		Note:      "",
	})
}

func PrintMails() {
	db, err := gorm.Open(sqlite.Open(dbPath), &gorm.Config{})
	if err != nil {
		fmt.Println("failed to connect database")
		return
	}

	ctx := context.Background()

	requests, err := gorm.G[ProjectRequest](db).Where("from_site = ?", "Moss").Find(ctx)
	if err != nil {
		fmt.Println(err)
		return
	}
	for _, request := range requests {
		fmt.Println(request)
	}
}

func sendEmail(name, email, message string) {
	apiKey := os.Getenv("RESEND_API_KEY")
	if apiKey == "" {
		fmt.Println("Resend API key is empty!")
		return
	}

	client := resend.NewClient(apiKey)

	params := &resend.SendEmailRequest{
		From:    fmt.Sprintf("%s <%s>", name, "onboarding@resend.dev"),
		To:      []string{"milijan.mosic@gmail.com"},
		Html:    fmt.Sprintf("<p>My email: %s</p> <p>%s</p>", email, message),
		Subject: "Request from the client",
		ReplyTo: email,
	}

	sent, err := client.Emails.Send(params)
	if err != nil {
		fmt.Println(err.Error())
		return
	}
	fmt.Println(sent.Id)
}
