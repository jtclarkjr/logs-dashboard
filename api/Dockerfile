# Use Python 3.11 slim image
FROM python:3.11-slim AS base

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Set work directory
WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .

# Install system dependencies and Python dependencies in one layer
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential \
        curl \
    && pip install --no-cache-dir -r requirements.txt \
    && apt-get purge -y --auto-remove build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy application code (shared by all stages)
COPY --chmod=755 entrypoint.sh test_runner.sh* ./
COPY . .

# Development stage
FROM base AS development

# Expose port
EXPOSE 8000

# Set entrypoint and default command
ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

# Test stage
FROM base AS test

# Set test-specific environment variables
ENV DEBUG=true \
    PYTHONPATH=/app

# Override entrypoint and set command to run tests
ENTRYPOINT []
CMD ["/app/test_runner.sh"]

# Production stage
FROM base AS production

# Create non-root user and change ownership
RUN groupadd -r appuser && useradd -r -g appuser appuser \
    && chown -R appuser:appuser /app

USER appuser

# Expose port
EXPOSE 8000

# Set entrypoint and default command
ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
