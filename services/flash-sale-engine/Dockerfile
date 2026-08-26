# Stage 1: Build binary using Rust stable slim
FROM rust:1.80-slim-bookworm AS builder

WORKDIR /app
COPY Cargo.toml ./
COPY src ./src

RUN cargo build --release

# Stage 2: Minimal runtime image
FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=builder /app/target/release/flash-sale-engine /app/flash-sale-engine

ENV PORT=8086
ENV HOST=0.0.0.0

EXPOSE 8086

CMD ["/app/flash-sale-engine"]
