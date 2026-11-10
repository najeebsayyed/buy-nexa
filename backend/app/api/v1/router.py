"""V1 API Router assembling all domain endpoint routers."""

from fastapi import APIRouter

from app.api.v1.endpoints import briefs, health

api_v1_router = APIRouter()
api_v1_router.include_router(health.router)
api_v1_router.include_router(briefs.router)
