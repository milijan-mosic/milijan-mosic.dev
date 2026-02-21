package pages

import (
	"log"
	"net/http"
)

func Homepage(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/html")

	err := Index().Render(r.Context(), w)
	if err != nil {
		log.Fatalln(err)
		return
	}
}
