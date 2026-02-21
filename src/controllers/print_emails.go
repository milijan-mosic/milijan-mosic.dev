package controllers

import (
	"context"
	"log"
	"my-website/utils"
	"net/http"

	"encoding/json"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func PrintEmails(w http.ResponseWriter, r *http.Request) {
	db, err := gorm.Open(sqlite.Open(utils.DBPath), &gorm.Config{})
	if err != nil {
		log.Fatalln("failed to connect database")
		return
	}

	ctx := context.Background()

	requests, err := gorm.G[utils.ProjectRequest](db).Where("from_site = ?", "Moss").Find(ctx)
	if err != nil {
		log.Fatalln(err)
		return
	}

	prettyJSON, err := json.MarshalIndent(requests, "", "  ")
	if err != nil {
		log.Println("failed to marshal:", err)
	} else {
		log.Println(string(prettyJSON))
	}

	utils.RespondJSON(w, http.StatusOK, "success", "Printed out")
}
