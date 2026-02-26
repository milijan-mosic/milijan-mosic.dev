# =========================
# Build stage
# =========================
FROM golang:1.25-alpine3.23 AS builder

# Install build deps for CGO
RUN apk add --no-cache ca-certificates git gcc musl-dev sqlite-dev

WORKDIR /app

# Copy go.mod/go.sum first (better caching)
COPY go.mod go.sum ./
RUN go mod download

# Copy source
COPY . .

# Build binary with CGO enabled
RUN CGO_ENABLED=1 GOOS=linux GOARCH=amd64 \
    go build -ldflags="-s -w" -o app

# =========================
# Runtime stage
# =========================
FROM alpine:3.23

WORKDIR /app
RUN mkdir -p /data

# Runtime deps
RUN apk add --no-cache ca-certificates sqlite-libs

# Copy binary + static files + certs
COPY --from=builder /app/app /app/app
COPY --from=builder /app/static /app/static
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

EXPOSE 20000

ENTRYPOINT ["/app/app"]
