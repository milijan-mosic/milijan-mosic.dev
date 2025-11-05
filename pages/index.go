package pages

import (
	"my-website/resume"
	"my-website/utils"
	"net/http"
)

var contentPath string = "./sections/"

func Homepage(w http.ResponseWriter, r *http.Request) {
	content := []string{}

	files, err := utils.ReadFolderContent(contentPath)
	if err != nil {
		http.Error(w, "Folder not found", http.StatusInternalServerError)
		return
	}

	for _, file := range files {
		htmlContent, err := utils.RenderMarkdownFile(contentPath + file)
		if err != nil {
			http.Error(w, "Couldn't read markdown", http.StatusInternalServerError)
			return
		}
		content = append(content, htmlContent)
	}

	w.Header().Set("Content-Type", "text/html")
	resume.Page(content).Render(r.Context(), w)
}
