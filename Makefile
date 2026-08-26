.PHONY: all dev build test test-all lint format docker-up docker-down

all: test-all build

dev:
	npm --prefix frontend run dev

build:
	npm --prefix frontend run build
	cd backend && mvn clean package -DskipTests

test:
	npm --prefix frontend run test

test-python:
	cd services/ai-demand-engine && pytest

test-go:
	cd services/telemetry-service && go test -v -race ./...

test-rust:
	cd services/flash-sale-engine && cargo test

test-all:
	npm --prefix frontend run coverage
	cd backend && mvn test -Dspring.profiles.active=test
	cd services/ai-demand-engine && pytest
	cd services/telemetry-service && go test -v ./...
	cd services/flash-sale-engine && cargo test

lint:
	npm --prefix frontend run lint
	npm --prefix frontend run format:check

format:
	npm --prefix frontend run format

docker-up:
	docker compose up --build -d

docker-down:
	docker compose down
