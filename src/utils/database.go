package utils

import (
	"context"
	"log"
	"os"

	"github.com/google/uuid"
	"github.com/joho/godotenv"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func GetEnvVariable(key string) string {
	err := godotenv.Load()
	if err != nil {
		log.Fatalln("No .env file found (skipping)")
	}

	value := os.Getenv(key)
	if value == "" {
		log.Fatalf("Missing required environment variable: %s", key)
	}

	return value
}

func SaveToDb(newRequest ContactRequest) {
	dbPath := GetEnvVariable("DATABASE_PATH")
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
	dbPath := GetEnvVariable("DATABASE_PATH")
	if dbPath == "" {
		log.Fatalln("Database path is empty!")
		return
	}

	db, err := gorm.Open(sqlite.Open(dbPath), &gorm.Config{})
	if err != nil {
		log.Fatalln("failed to connect database")
		return
	}

	db.AutoMigrate(&ProjectRequest{})
}
