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

func GetEnvVariable(key string) string {
	value := os.Getenv(key)
	if value == "" {
		log.Fatalf("Missing required environment variable: %s", key)
	}

	return value
}

func SaveToDb(newRequest ContactRequest) {
	db, err := gorm.Open(sqlite.Open(DBPath), &gorm.Config{})
	if err != nil {
		log.Fatalln("failed to connect database")
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

func SetupDatabase() {
	db, err := gorm.Open(sqlite.Open(DBPath), &gorm.Config{})
	if err != nil {
		log.Fatalln("failed to connect database")
		return
	}

	db.AutoMigrate(&ProjectRequest{})
}
