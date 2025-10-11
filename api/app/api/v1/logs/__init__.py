"""
Logs API endpoints

This module combines all log-related endpoints into organized sub-modules:
- CRUD operations: create, read, update, delete
- Analytics: aggregation and chart data
- Utilities: export and metadata
"""
from fastapi import APIRouter

from .create import router as create_router
from .read import router as read_router  
from .update import router as update_router
from .delete import router as delete_router
from .analytics import router as analytics_router
from .utilities import router as utilities_router

# Main router for all logs endpoints
router = APIRouter()

# Include all sub-routers
# Note: Order matters for route matching - specific routes before parameterized ones
router.include_router(create_router, tags=["logs-crud"])
router.include_router(analytics_router, tags=["logs-analytics"]) 
router.include_router(utilities_router, tags=["logs-utilities"])
router.include_router(update_router, tags=["logs-crud"])  # parameterized routes
router.include_router(delete_router, tags=["logs-crud"])  # parameterized routes  
router.include_router(read_router, tags=["logs-crud"])    # parameterized routes (/{log_id} comes last)