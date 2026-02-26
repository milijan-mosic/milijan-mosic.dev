package main

import (
	"log"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/httprate"

	"my-website/controllers"
	pages "my-website/pages/index"
	"my-website/utils"
)

func main() {
	app := chi.NewRouter()

	app.Use(middleware.RealIP)
	app.Use(middleware.RequestID)
	app.Use(middleware.Logger)
	app.Use(middleware.Compress(5))
	app.Use(middleware.CleanPath)
	app.Use(httprate.LimitByIP(1000, 1*time.Minute))
	app.Use(middleware.Timeout(5 * time.Second))
	app.Use(middleware.Heartbeat("/health"))
	app.Use(middleware.Recoverer)

	app.Route("/", func(r chi.Router) {
		r.Get("/", pages.Homepage)
		r.Post("/api/contact", controllers.HandleContact)
		r.Get("/email/print", controllers.PrintEmails)
	})

	app.Get("/robots.txt", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "./static/robots.txt")
	})
	app.Get("/sitemap.xml", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/xml")
		http.ServeFile(w, r, "./static/sitemap.xml")
	})

	app.Get("/favicon-96x96.png", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "image/png")
		http.ServeFile(w, r, "./static/favicon/favicon-96x96.png")
	})
	app.Get("/favicon.svg", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "image/svg+xml")
		http.ServeFile(w, r, "./static/favicon/favicon.svg")
	})
	app.Get("/favicon.ico", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "./static/favicon/favicon.ico")
	})
	app.Get("/apple-touch-icon.png", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "image/png")
		http.ServeFile(w, r, "./static/favicon/apple-touch-icon.png")
	})
	app.Get("/site.webmanifest", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "./static/favicon/site.webmanifest")
	})

	fs := http.FileServer(http.Dir("./static"))
	app.Handle("/static/*", http.StripPrefix("/static/", fs))

	utils.SetupDatabase()

	port := "20000"
	log.Printf("Listening on port: %s\n", port)
	err := http.ListenAndServe(":"+port, app)
	if err != nil {
		log.Fatalln("Failed to start server:", err)
	}
}
