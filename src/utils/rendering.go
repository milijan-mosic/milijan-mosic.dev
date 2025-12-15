package utils

import (
	"bytes"
	"os"

	"github.com/yuin/goldmark"
)

func RenderContent(mdContent []byte) (string, error) {
	var buf bytes.Buffer
	if err := goldmark.Convert(mdContent, &buf); err != nil {
		return "", err
	}

	return buf.String(), nil
}

func RenderMarkdownFile(path string) (string, error) {
	mdContent, err := os.ReadFile(path)
	if err != nil {
		return "", err
	}

	return RenderContent(mdContent)
}

func ReadFolderContent(folder_path string) ([]string, error) {
	content, err := os.ReadDir(folder_path)
	if err != nil {
		return []string{}, err
	}

	var files []string
	for _, value := range content {
		files = append(files, value.Name())
	}

	return files, nil
}
