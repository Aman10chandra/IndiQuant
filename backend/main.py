"""
FastAPI main application — Indian Stock Dashboard Backend
"""
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from database import init_db
from routers import market, ai

load_dotenv()

CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")


import asyncio
from services.data_service import warmup_and_maintain_market_cache

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables on startup
    await init_db()
    print("[INFO] Database initialized")
    # Launch background RAM cache maintainer
    cache_task = asyncio.create_task(warmup_and_maintain_market_cache())
    print("[INFO] In-memory market RAM cache maintainer started")
    yield
    cache_task.cancel()
    print("[INFO] Shutting down")


app = FastAPI(
    title="Indian Stock Dashboard API",
    description="Backend for AI-powered Indian equity dashboard with NSE/BSE market data and AI analysis.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(market.router)
app.include_router(ai.router)


@app.get("/")
async def root():
    return {
        "name": "Indian Stock Dashboard API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "market": "/api/market/*",
            "ai": "/api/ai/*",
            "docs": "/docs",
        },
    }


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return Response(status_code=204)
