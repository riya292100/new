.PHONY: all dev build test test-all lint format docker-up docker-down

all: test-all build

dev:
	npm --prefix frontend run dev

build:
	npm --prefix frontend run build
	cd backend && mvn clean package -DskipTests

test:
	npm --prefix frontend run test

test-all:
	npm --prefix frontend run coverage
	cd backend && mvn clean test -Dspring.profiles.active=test

lint:
	npm --prefix frontend run lint
	npm --prefix frontend run format:check

format:
	npm --prefix frontend run format

docker-up:
	docker compose up --build -d

docker-down:
	docker compose down
