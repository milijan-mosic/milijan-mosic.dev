package controllers

import (
	"context"
	"log"
	"my-website/utils"
	"net/http"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func PrintEmails(w http.ResponseWriter, r *http.Request) {
	dbPath := utils.GetEnvVariable("DATABASE_PATH")
	if dbPath == "" {
		log.Fatalln("Database path is empty!")
		return
	}

	db, err := gorm.Open(sqlite.Open(dbPath), &gorm.Config{})
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
	for _, request := range requests {
		log.Println(request)
	}
	utils.RespondJSON(w, http.StatusOK, "success", "Printed out")
}
