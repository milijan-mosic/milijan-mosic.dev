package pages

import (
	"net/http"
)

func Homepage(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/html")

	err := Index().Render(r.Context(), w)
	if err != nil {
		panic(err)
	}
}
