package controllers

import (
	"context"
	"log"
	"my-website/utils"
	"net/http"

	"encoding/json"

	"gorm.io/gorm"
)

func PrintEmails(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()

	requests, err := gorm.G[utils.ProjectRequest](utils.DB).Where("from_site = ?", "Moss").Find(ctx)
	if err != nil {
		log.Fatalln("Printing emails failed:", err)
		return
	}

	prettyJSON, err := json.MarshalIndent(requests, "", "  ")
	if err != nil {
		log.Println("Failed to marshal:", err)
	} else {
		log.Println(string(prettyJSON))
	}

	utils.RespondJSON(w, http.StatusOK, "success", "Printed out")
}
