from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import create_tables
from app.core.middleware import ErrorHandlingMiddleware, LoggingMiddleware
from app.api import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle application lifespan events."""
    # Startup
    create_tables()
    yield
    # Shutdown (if needed in the future)
    pass


# Initialize FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.DESCRIPTION,
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Add error handling middleware (should be first)
app.add_middleware(ErrorHandlingMiddleware)

# Add request logging middleware
app.add_middleware(LoggingMiddleware)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=settings.CORS_METHODS,
    allow_headers=settings.CORS_HEADERS,
)

# Include API router with versioning
app.include_router(api_router, prefix=settings.API_V1_STR)

if __name__ == "__main__":
    import uvicorn
    import logging
    
    # Configure uvicorn to suppress access logs for health checks
    class HealthCheckFilter(logging.Filter):
        def filter(self, record: logging.LogRecord) -> bool:
            return '/health' not in record.getMessage()
    
    # Apply filter to uvicorn access logger
    uvicorn_access_logger = logging.getLogger("uvicorn.access")
    uvicorn_access_logger.addFilter(HealthCheckFilter())
    
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
