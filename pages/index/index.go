package pages

import (
	"net/http"
)

// var contentPath string = "./sections/"

func Homepage(w http.ResponseWriter, r *http.Request) {
	// content := []string{}

	// files, err := utils.ReadFolderContent(contentPath)
	// if err != nil {
	// 	http.Error(w, "Folder not found", http.StatusInternalServerError)
	// 	return
	// }

	// for _, file := range files {
	// 	htmlContent, err := utils.RenderMarkdownFile(contentPath + file)
	// 	if err != nil {
	// 		http.Error(w, "Couldn't read markdown", http.StatusInternalServerError)
	// 		return
	// 	}
	// 	content = append(content, htmlContent)
	// }

	w.Header().Set("Content-Type", "text/html")
	err := Index().Render(r.Context(), w)
	if err != nil {
		panic(err)
	}
}
