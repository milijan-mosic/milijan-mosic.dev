package controllers

import (
	"encoding/json"
	"fmt"
	"log"
	"my-website/utils"
	"net/http"
	"strings"

	"github.com/resend/resend-go/v3"
)

func HandleContact(w http.ResponseWriter, r *http.Request) {
	var req utils.ContactRequest

	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(&req); err != nil {
		utils.RespondJSON(w, http.StatusBadRequest, "invalid_json", "Could not parse request body")
		return
	}

	if strings.TrimSpace(req.FromSite) == "" {
		utils.RespondJSON(w, http.StatusBadRequest, "invalid_name", "`FromSite` is required")
		return
	}
	if strings.TrimSpace(req.Name) == "" {
		utils.RespondJSON(w, http.StatusBadRequest, "invalid_name", "Name is required")
		return
	}
	if !isValidEmail(req.Email) {
		utils.RespondJSON(w, http.StatusBadRequest, "invalid_email", "Valid email is required")
		return
	}
	if len(strings.TrimSpace(req.Message)) < 5 {
		utils.RespondJSON(w, http.StatusBadRequest, "invalid_message", "Message must be at least 5 characters long")
		return
	}

	sendEmail(req.Name, req.Email, req.Message)
	utils.SaveToDb(req)
	utils.RespondJSON(w, http.StatusOK, "success", "Message sent successfully")
}

func isValidEmail(email string) bool {
	email = strings.TrimSpace(email)
	if len(email) < 5 || !strings.Contains(email, "@") || !strings.Contains(email, ".") {
		return false
	}
	return true
}

func sendEmail(name, email, message string) {
	apiKey := utils.GetEnvVariable("RESEND_API_KEY")
	if apiKey == "" {
		log.Fatalln("Resend API key is empty!")
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
		log.Fatalln("Sending email failed:", err)
		return
	}
	log.Printf("Email sent successfully, ID: %s", sent.Id)
}
