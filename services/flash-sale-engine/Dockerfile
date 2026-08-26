# Multi-stage Docker build for Rust Flash Sale Engine
FROM rust:1.80-alpine AS builder

RUN apk add --no-cache musl-dev

WORKDIR /app
COPY Cargo.toml ./
COPY src ./src

RUN cargo build --release

# Minimal runtime stage
FROM alpine:3.20

RUN apk add --no-cache ca-certificates tzdata

WORKDIR /app
COPY --from=builder /app/target/release/flash-sale-engine /app/flash-sale-engine

ENV PORT=8086
ENV HOST=0.0.0.0

EXPOSE 8086

CMD ["/app/flash-sale-engine"]
