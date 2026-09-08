import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from starlette.middleware.sessions import SessionMiddleware

from app.config import settings
from app.api import fpl, health, auth, analytics
from app.database.database import init_db

templates_dir = os.path.join(os.path.dirname(__file__), "templates")
templates = Jinja2Templates(directory=templates_dir)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables on app startup
    try:
        init_db()
    except Exception as e:
        print(f"Database init warning: {e}")
    yield

app = FastAPI(
    title="FPL AI - FPL Authentication MVP",
    description="Connect your FPL account to analyze your team with AI.",
    version="1.0.0",
    lifespan=lifespan
)

# Encrypted session middleware for server-side state & cookie management
app.add_middleware(
    SessionMiddleware,
    secret_key=settings.SECRET_KEY,
    session_cookie="fpl_ai_session",
    max_age=14 * 24 * 3600  # 14 days
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(fpl.router)
app.include_router(analytics.router)

@app.get("/", response_class=HTMLResponse, tags=["FPL AI Landing"])
async def landing_page(request: Request):
    """Minimal FPL AI Landing Page with 'Connect FPL' primary action."""
    is_connected = request.session.get("is_connected", False)
    if is_connected:
        return RedirectResponse(url="/dashboard")

    return templates.TemplateResponse(request=request, name="index.html")

@app.get("/dashboard", response_class=HTMLResponse, tags=["Dashboard"])
async def dashboard_page(request: Request):
    """Connected Dashboard showing Manager Name, Gameweek, Starting XI & Bench."""
    is_connected = request.session.get("is_connected", False)
    if not is_connected:
        return RedirectResponse(url="/")

    return templates.TemplateResponse(request=request, name="dashboard.html")
