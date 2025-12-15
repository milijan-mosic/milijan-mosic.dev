package main

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/go-chi/chi/v5"
)

type ContactRequest struct {
	Name    string `json:"name"`
	Email   string `json:"email"`
	Message string `json:"message"`
}

type ContactResponse struct {
	Status  string `json:"status"`
	Message string `json:"message"`
}

func ContactRouter() http.Handler {
	r := chi.NewRouter()
	r.Post("/", HandleContact)
	return r
}

func HandleContact(w http.ResponseWriter, r *http.Request) {
	var req ContactRequest

	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(&req); err != nil {
		respondJSON(w, http.StatusBadRequest, "invalid_json", "Could not parse request body")
		return
	}

	// Validate input
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

	// TODO: Save to database OR forward to email service
	// Example:
	// go emailService.Send(req.Name, req.Email, req.Message)

	respondJSON(w, http.StatusOK, "success", "Message sent successfully")
}

func respondJSON(w http.ResponseWriter, code int, status string, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)

	err := json.NewEncoder(w).Encode(ContactResponse{
		Status:  status,
		Message: message,
	})
	if err != nil {
		panic(err)
	}
}

func isValidEmail(email string) bool {
	email = strings.TrimSpace(email)
	if len(email) < 5 || !strings.Contains(email, "@") || !strings.Contains(email, ".") {
		return false
	}
	return true
}
