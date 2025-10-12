from fastapi import APIRouter

from app.api.v1 import general, logs

api_router = APIRouter()
api_router.include_router(general.router, tags=["General"])
api_router.include_router(logs.router, prefix="/logs")
