from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import init_db
from app.api.v1.auth import router as auth_router
from app.api.v1.workspaces import router as workspaces_router
from app.api.v1.blogs import router as blogs_router
from app.api.v1.posts import router as posts_router
from app.api.v1.ai import router as ai_router
from app.api.v1.campaigns import router as campaigns_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB schemas on startup
    await init_db()
    yield

app = FastAPI(
    title="Monster Jack Backend API",
    description="Multi-Tenant Marketing Automation Platform with Blog & Social Repurposing Engine",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router, prefix="/api/v1")
app.include_router(workspaces_router, prefix="/api/v1")
app.include_router(blogs_router, prefix="/api/v1")
app.include_router(posts_router, prefix="/api/v1")
app.include_router(ai_router, prefix="/api/v1")
app.include_router(campaigns_router, prefix="/api/v1")

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "Monster Jack API",
        "ai_provider": settings.AI_PROVIDER,
        "environment": settings.ENVIRONMENT
    }
