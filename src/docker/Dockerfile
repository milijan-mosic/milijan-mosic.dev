# =========================
# Build stage
# =========================
FROM golang:1.25-alpine AS builder

# Install certs & git (for private/public modules)
RUN apk add --no-cache ca-certificates git

WORKDIR /app

# Copy only go.mod/go.sum first (better caching)
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest of the source
COPY . .

# Build a static binary
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -ldflags="-s -w" -o app

# =========================
# Runtime stage
# =========================
FROM gcr.io/distroless/base-debian12

WORKDIR /app

# Copy binary and certs
COPY --from=builder /app/app /app/app
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

# Run as non-root (distroless default)
USER nonroot:nonroot

EXPOSE 10000

ENTRYPOINT ["/app/app"]
