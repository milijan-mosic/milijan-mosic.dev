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
	r := chi.NewRouter()

	r.Use(middleware.RealIP)
	r.Use(middleware.RequestID)
	r.Use(middleware.Logger)
	r.Use(middleware.AllowContentEncoding("gzip"))
	r.Use(middleware.AllowContentType("application/json", "text/html", "text/javascript", "text/css"))
	r.Use(middleware.Compress(5, "application/json", "text/html", "text/javascript", "text/css"))
	r.Use(middleware.CleanPath)
	r.Use(httprate.LimitByIP(100, 1*time.Minute))
	r.Use(middleware.Timeout(5 * time.Second))
	r.Use(middleware.Heartbeat("/health"))
	r.Use(middleware.Recoverer)

	r.Get("/", pages.Homepage)

	workDir, _ := os.Getwd()
	filesDir := http.Dir(filepath.Join(workDir, "static"))
	utils.FileServer(r, "/static", filesDir)

	port := "8080"
	fmt.Printf("Listening on port: %s\n", port)
	err := http.ListenAndServe(":"+port, r)
	if err != nil {
		panic(err)
	}
}
