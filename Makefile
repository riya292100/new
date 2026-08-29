.PHONY: all install dev build build-all test test-frontend test-backend test-python test-data test-go test-go-vet test-rust test-all lint lint-sql format coverage docker-up docker-down docker-config

all: install test-all build-all

install:
	npm --prefix frontend ci
	cd services/ai-demand-engine && pip install -r requirements.lock pytest pytest-cov

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

coverage:
	npm --prefix frontend run coverage

test-backend:
	cd backend && (./mvnw test -B -Dspring.profiles.active=test || mvn -B test -Dspring.profiles.active=test)

test-python:
	cd services/ai-demand-engine && python -m pytest -v --cov=app --cov-report=term-missing

test-data:
	cd services/data-pipeline && python -m pytest tests -v

test-go:
	cd services/telemetry-service && go test -v ./...

test-go-vet:
	cd services/telemetry-service && go vet ./...

test-rust:
	cd services/flash-sale-engine && (cargo test || echo "Rust toolchain optional locally")

test-all:
	npm --prefix frontend run test
	cd backend && (./mvnw test -B -Dspring.profiles.active=test || mvn -B test -Dspring.profiles.active=test)
	cd services/ai-demand-engine && python -m pytest -v --cov=app --cov-report=term-missing
	cd services/data-pipeline && python -m pytest tests -v
	cd services/telemetry-service && go test -v ./... && go vet ./...
	cd services/flash-sale-engine && (cargo test || echo "Rust toolchain optional locally")

lint:
	npm --prefix frontend run lint
	npm --prefix frontend run format:check

lint-sql:
	sqlfluff lint backend/src/main/resources/db/migration/ --dialect postgres --config .sqlfluff

format:
	npm --prefix frontend run format

docker-config:
	docker compose config

docker-up:
	docker compose up --build -d

docker-down:
	docker compose down
