# www.milijan-mosic.dev

Dev setup

## Website rendering

```sh
cd src/ ; templ generate --watch --proxy="http://localhost:20000" --cmd="go run ."
```

## Tailwind CSS tree-shaking

```sh
npx @tailwindcss/cli -i ./src/static/css/global.css -o ./src/static/css/base.css --watch
```
