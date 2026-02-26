package utils

import (
	"context"
	"log"
	"os"

	"github.com/google/uuid"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

const DBPath = "/data/emails.db"

// const DBPath = "./data/emails.db" // ONLY FOR LOCAL USAGE

var DB *gorm.DB

func GetEnvVariable(key string) string {
	value := os.Getenv(key)
	if value == "" {
		log.Fatalf("Missing required environment variable: %s", key)
	}

	return value
}

func SaveToDb(newRequest ContactRequest) {
	ctx := context.Background()

	err := gorm.G[ProjectRequest](DB).Create(ctx, &ProjectRequest{
		RequestId: uuid.New().String(),
		FromSite:  newRequest.FromSite,
		Name:      newRequest.Name,
		Email:     newRequest.Email,
		Message:   newRequest.Message,
		Replied:   false,
		Note:      "",
	})
	if err != nil {
		log.Fatalln("Failed to save to database:", err)
	}
}

func SetupDatabase() {
	var err error

	DB, err = gorm.Open(sqlite.Open(DBPath), &gorm.Config{})
	if err != nil {
		log.Fatalln("Failed to connect database:", err)
	}

	err = DB.AutoMigrate(&ProjectRequest{})
	if err != nil {
		log.Fatalln("failed to migrate:", err)
	}

	log.Println("Database connected successfully")
}
