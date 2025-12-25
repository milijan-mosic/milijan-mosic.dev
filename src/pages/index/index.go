package pages

import (
	"net/http"
)

func Homepage(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/html")
	// w.Header().Set(
	// 	"Strict-Transport-Security",
	// 	"max-age=63072000; includeSubDomains; preload",
	// )
	// w.Header().Set(
	// 	"Cross-Origin-Opener-Policy",
	// 	"same-origin",
	// )
	// w.Header().Set(
	// 	"X-Frame-Options",
	// 	"SAMEORIGIN",
	// )
	// w.Header().Set(
	// 	"Content-Security-Policy",
	// 	"frame-ancestors 'self'",
	// )

	err := Index().Render(r.Context(), w)
	if err != nil {
		panic(err)
	}
}
