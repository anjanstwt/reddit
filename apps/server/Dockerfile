FROM golang:1.27-alpine AS build
WORKDIR /src
ENV CGO_ENABLED=0 GOWORK=off

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN go build -trimpath -ldflags="-s -w" -o /out/server ./cmd/server

FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=build /out/server /server
ENV SERVER_ENV=production SERVER_PORT=8080
EXPOSE 8080
ENTRYPOINT ["/server"]
