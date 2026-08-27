.PHONY: all install dev build build-all test test-frontend test-backend test-python test-go test-rust test-all lint format docker-up docker-down

all: install test-all build-all

install:
	npm --prefix frontend ci
	cd services/ai-demand-engine && pip install -r requirements.lock

dev:
	npm --prefix frontend run dev

build:
	npm --prefix frontend run build

build-all:
	npm --prefix frontend run build
	cd backend && (./mvnw clean package -DskipTests || mvn clean package -DskipTests)
	cd services/telemetry-service && go build -v -o telemetry-server main.go

test:
	npm --prefix frontend run test

test-frontend:
	npm --prefix frontend run test

test-backend:
	cd backend && (./mvnw test -B -Dspring.profiles.active=test || mvn -B test -Dspring.profiles.active=test)

test-python:
	cd services/ai-demand-engine && pytest

test-go:
	cd services/telemetry-service && go test -v ./...

test-rust:
	cd services/flash-sale-engine && (cargo test || echo "Rust toolchain optional locally")

test-all:
	npm --prefix frontend run test
	cd backend && (./mvnw test -B -Dspring.profiles.active=test || mvn -B test -Dspring.profiles.active=test)
	cd services/ai-demand-engine && pytest
	cd services/telemetry-service && go test -v ./...
	cd services/flash-sale-engine && (cargo test || echo "Rust toolchain optional locally")

lint:
	npm --prefix frontend run lint
	npm --prefix frontend run format:check

format:
	npm --prefix frontend run format

docker-up:
	docker compose up --build -d

docker-down:
	docker compose down
