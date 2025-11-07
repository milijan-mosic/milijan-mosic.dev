package main

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/httprate"

	"my-website/pages"
	"my-website/utils"
)

func main() {
	app := chi.NewRouter()

	app.Use(middleware.RealIP)
	app.Use(middleware.RequestID)
	app.Use(middleware.Logger)
	app.Use(middleware.AllowContentEncoding("gzip"))
	app.Use(middleware.AllowContentType("application/json", "text/html", "text/javascript", "text/css"))
	app.Use(middleware.Compress(5, "application/json", "text/html", "text/javascript", "text/css"))
	app.Use(middleware.CleanPath)
	app.Use(httprate.LimitByIP(100, 1*time.Minute))
	app.Use(middleware.Timeout(5 * time.Second))
	app.Use(middleware.Heartbeat("/health"))
	app.Use(middleware.Recoverer)

	app.Get("/", pages.Homepage)

	workDir, _ := os.Getwd()
	filesDir := http.Dir(filepath.Join(workDir, "static"))
	utils.FileServer(app, "/static", filesDir)

	port := "8080"
	fmt.Printf("Listening on port: %s\n", port)
	err := http.ListenAndServe(":"+port, app)
	if err != nil {
		panic(err)
	}
}
