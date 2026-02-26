# www.milijan-mosic.dev

Dev setup

## Website rendering

```sh
cd src/ ; templ generate --watch --proxy="http://localhost:20000" --cmd="go run ."
```

## Tailwind CSS building and tree-shaking

```sh
cd src/ ; npx @tailwindcss/cli -i ./static/css/global.css -o ./static/css/base.css --watch
```

## Shader watching

```sh
cd src/ ; npx vite build --watch
```
