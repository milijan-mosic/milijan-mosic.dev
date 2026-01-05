package pages

import (
	"fmt"
	"net/http"
)

func Homepage(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/html")

	err := Index().Render(r.Context(), w)
	if err != nil {
		fmt.Println(err)
		return
	}
}
