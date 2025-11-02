# Base stage with common dependencies
FROM imbios/bun-node:20-slim AS base
ARG DEBIAN_FRONTEND=noninteractive

# Asia/Tokyo timezone
RUN apt-get -y update && \
  apt-get install -yq --no-install-recommends openssl git ca-certificates tzdata && \
  ln -fs /usr/share/zoneinfo/Asia/Tokyo /etc/localtime && \
  dpkg-reconfigure -f noninteractive tzdata && \
  rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# Test stage
FROM base AS test

# Set environment variables
ENV NODE_ENV=test \
    BUN_RUNTIME_TRANSPILER_CACHE_PATH=0

# Copy the frontend source code
COPY . ./

# Override entrypoint and set command to run tests
ENTRYPOINT []
CMD ["bun", "test"]

# Build stage
FROM base AS builder

# Copy environment file for build
COPY .env* ./

# Copy source code
COPY . .

# Build the app
RUN bun run build

# Production stage
FROM oven/bun:1.3.1-slim AS production

WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000

# Create non-root user
RUN groupadd -r bunuser && useradd -r -g bunuser bunuser

# Copy built application from builder stage
COPY --from=builder --chown=bunuser:bunuser /app/public ./public
COPY --from=builder --chown=bunuser:bunuser /app/.next/standalone ./
COPY --from=builder --chown=bunuser:bunuser /app/.next/static ./.next/static

USER bunuser

EXPOSE 3000

CMD ["bun", "run", "server.js"]
