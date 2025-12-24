package pages

import (
	"net/http"
)

func Homepage(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/html")
	w.Header().Set(
		"Strict-Transport-Security",
		"max-age=63072000; includeSubDomains; preload",
	)

	err := Index().Render(r.Context(), w)
	if err != nil {
		panic(err)
	}
}
