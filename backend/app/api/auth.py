import secrets
import hashlib
import base64
import logging
from datetime import datetime, timedelta
from typing import Any, Dict, Optional

from fastapi import APIRouter, Request, Depends, HTTPException, Query, Body
from fastapi.responses import RedirectResponse, JSONResponse
from sqlalchemy.orm import Session

from app.config import settings
from app.database.database import get_db
from app.database.models import User, FPLManager
from app.fpl.client import FPLClient
from app.fpl.service import FPLService

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Authentication"])
fpl_client = FPLClient()
fpl_service = FPLService(client=fpl_client)

def generate_pkce_verifier() -> str:
    """Generates a cryptographically random 64-character PKCE code verifier."""
    token = secrets.token_urlsafe(48)
    return token[:64]

def generate_pkce_challenge(verifier: str) -> str:
    """Generates an S256 PKCE code challenge from a verifier."""
    digest = hashlib.sha256(verifier.encode("ascii")).digest()
    challenge = base64.urlsafe_b64encode(digest).decode("ascii").rstrip("=")
    return challenge

def generate_state() -> str:
    """Generates a random state string for OAuth CSRF protection."""
    return secrets.token_urlsafe(32)

def encrypt_token(token: str) -> str:
    """Simple obfuscation/encryption for server-side token storage."""
    if not token:
        return ""
    key = settings.SECRET_KEY.encode("utf-8")
    cipher = bytes([b ^ key[i % len(key)] for i, b in enumerate(token.encode("utf-8"))])
    return base64.b64encode(cipher).decode("utf-8")

def decrypt_token(encrypted: str) -> str:
    """Decrypts server-side stored token."""
    if not encrypted:
        return ""
    try:
        cipher = base64.b64decode(encrypted.encode("utf-8"))
        key = settings.SECRET_KEY.encode("utf-8")
        plain = bytes([b ^ key[i % len(key)] for i, b in enumerate(cipher)])
        return plain.decode("utf-8")
    except Exception:
        return ""

@router.get("/auth/fpl/login")
async def fpl_login(request: Request):
    """Initiates OAuth 2.0 / OpenID Connect authorization code flow with PKCE."""
    # 1. Fetch live OIDC discovery document
    discovery = await fpl_client.get_oidc_discovery()
    if not discovery.get("accessible") or not discovery.get("data"):
        logger.error(f"OIDC Discovery failed: {discovery.get('error')}")
        return RedirectResponse(url="/?error=oidc_discovery_failed")

    oidc_data = discovery["data"]
    auth_endpoint = oidc_data.get("authorization_endpoint", "https://account.premierleague.com/as/authorize")

    # 2. Generate PKCE verifier, challenge (S256), and state
    code_verifier = generate_pkce_verifier()
    code_challenge = generate_pkce_challenge(code_verifier)
    state = generate_state()

    # 3. Store PKCE verifier & state in session
    request.session["oauth_state"] = state
    request.session["code_verifier"] = code_verifier

    # 4. Check if client ID is configured
    client_id = settings.FPL_CLIENT_ID
    if not client_id:
        logger.warning("FPL_CLIENT_ID not configured in environment. Prompting for Manager ID connection.")
        request.session["status_notice"] = "prompt_manager_id"
        return RedirectResponse(url="/?status=prompt_manager_id")

    # 5. Build authorization URL
    params = {
        "response_type": "code",
        "client_id": client_id,
        "redirect_uri": settings.FPL_REDIRECT_URI,
        "scope": "openid profile email offline_access",
        "state": state,
        "code_challenge": code_challenge,
        "code_challenge_method": "S256"
    }

    url_parts = [f"{k}={httpx.URL.quote(v)}" for k, v in params.items()]
    auth_url = f"{auth_endpoint}?{'&'.join(url_parts)}"

    return RedirectResponse(url=auth_url)

@router.get("/auth/fpl/callback")
async def fpl_callback(
    request: Request,
    code: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    error: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Handles OAuth callback, validates state, and exchanges code for access token via PKCE."""
    if error:
        logger.error(f"FPL Authorization error callback: {error}")
        return RedirectResponse(url=f"/?error={error}")

    stored_state = request.session.get("oauth_state")
    code_verifier = request.session.get("code_verifier")

    if not state or state != stored_state:
        logger.error("OAuth state mismatch in callback.")
        return RedirectResponse(url="/?error=state_mismatch")

    if not code or not code_verifier:
        logger.error("Missing authorization code or PKCE verifier.")
        return RedirectResponse(url="/?error=invalid_callback")

    # Fetch OIDC discovery for token endpoint
    discovery = await fpl_client.get_oidc_discovery()
    token_endpoint = discovery.get("data", {}).get("token_endpoint", "https://account.premierleague.com/as/token")

    # Exchange code for access token
    token_res = await fpl_client.exchange_code_pkce(
        token_endpoint=token_endpoint,
        client_id=settings.FPL_CLIENT_ID,
        code=code,
        code_verifier=code_verifier,
        redirect_uri=settings.FPL_REDIRECT_URI
    )

    if not token_res.get("accessible") or not token_res.get("raw_json"):
        logger.error(f"Token exchange failed: {token_res.get('error')}")
        return RedirectResponse(url="/?error=token_exchange_failed")

    raw_token = token_res["raw_json"]
    access_token = raw_token.get("access_token")
    refresh_token = raw_token.get("refresh_token")
    expires_in = raw_token.get("expires_in", 3600)

    # Verify token by calling /api/me/
    me_res = await fpl_client.get_me(token=access_token)
    fpl_user = me_res.get("raw_json", {}).get("player", {}) if me_res.get("accessible") else {}
    fpl_user_id = str(fpl_user.get("id")) if fpl_user else None
    fpl_manager_id = fpl_user.get("entry") if fpl_user else None

    # Save to local session & database
    user = None
    if fpl_user_id:
        user = db.query(User).filter(User.fpl_user_id == fpl_user_id).first()

    if not user:
        user = User(
            fpl_user_id=fpl_user_id or f"fpl_{secrets.token_hex(4)}",
            fpl_manager_id=fpl_manager_id,
            encrypted_access_token=encrypt_token(access_token),
            encrypted_refresh_token=encrypt_token(refresh_token) if refresh_token else None,
            token_expires_at=datetime.utcnow() + timedelta(seconds=expires_in),
            is_connected=True
        )
        db.add(user)
    else:
        user.encrypted_access_token = encrypt_token(access_token)
        if refresh_token:
            user.encrypted_refresh_token = encrypt_token(refresh_token)
        user.token_expires_at = datetime.utcnow() + timedelta(seconds=expires_in)
        user.is_connected = True

    db.commit()
    db.refresh(user)

    request.session["user_id"] = user.id
    request.session["is_connected"] = True
    request.session["fpl_manager_id"] = user.fpl_manager_id

    return RedirectResponse(url="/dashboard")

@router.post("/auth/fpl/connect-manager")
async def connect_via_manager_id(
    request: Request,
    payload: dict = Body(...),
    db: Session = Depends(get_db)
):
    """Allows connecting via Manager ID for public data platform & demonstration."""
    manager_id = payload.get("manager_id")
    if not manager_id:
        raise HTTPException(status_code=400, detail="Manager ID is required")

    try:
        manager_id = int(manager_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid Manager ID format")

    mgr_res = await fpl_client.get_manager(manager_id)
    if not mgr_res.get("accessible") or not (mgr_res.get("data") or mgr_res.get("raw_json")):
        raise HTTPException(status_code=404, detail=f"FPL Manager ID {manager_id} not found")

    mgr_data = mgr_res.get("data") or mgr_res.get("raw_json")
    player_name = f"{mgr_data.get('player_first_name', '')} {mgr_data.get('player_last_name', '')}".strip() or f"Manager {manager_id}"

    user = db.query(User).filter(User.fpl_manager_id == manager_id).first()
    if not user:
        user = User(
            fpl_manager_id=manager_id,
            is_connected=True
        )
        db.add(user)
    else:
        user.is_connected = True

    db.commit()
    db.refresh(user)

    request.session["user_id"] = user.id
    request.session["is_connected"] = True
    request.session["fpl_manager_id"] = manager_id
    request.session["fpl_user_name"] = player_name

    return {"status": "connected", "manager_id": manager_id, "user_name": player_name}

@router.post("/auth/fpl/connect-email")
async def connect_via_email(
    request: Request,
    payload: dict = Body(...),
    db: Session = Depends(get_db)
):
    """Authenticates using FPL Email & Password, automatically extracts Manager ID and connects user."""
    email = payload.get("email")
    password = payload.get("password")

    if not email or not password:
        raise HTTPException(status_code=400, detail="FPL Email and Password are required.")

    # 1. Attempt login against FPL
    auth_res = await fpl_client.login_fpl(email, password)
    session_id = auth_res.get("sessionid")

    if not auth_res.get("accessible") or not session_id:
        raise HTTPException(status_code=401, detail=auth_res.get("error", "Invalid FPL email or password."))

    # 2. Automatically resolve logged-in manager's identity via /api/me/
    me_res = await fpl_client.get_me(session_cookie=session_id)
    player_data = me_res.get("raw_json", {}).get("player") if me_res.get("accessible") else None
    
    manager_id = player_data.get("entry") if player_data else None
    player_name = f"{player_data.get('first_name', '')} {player_data.get('last_name', '')}".strip() if player_data else email

    if not manager_id:
        raise HTTPException(status_code=404, detail="Could not resolve FPL Manager ID for this account. Ensure you have created a team on FPL.")

    # 3. Create or update user
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            email=email,
            fpl_manager_id=manager_id,
            encrypted_access_token=encrypt_token(session_id),
            is_connected=True
        )
        db.add(user)
    else:
        user.fpl_manager_id = manager_id
        user.encrypted_access_token = encrypt_token(session_id)
        user.is_connected = True

    db.commit()
    db.refresh(user)

    request.session["user_id"] = user.id
    request.session["is_connected"] = True
    request.session["fpl_manager_id"] = manager_id
    request.session["fpl_user_name"] = player_name

    return {
        "status": "connected",
        "manager_id": manager_id,
        "user_name": player_name,
        "session_id": session_id
    }

@router.post("/auth/fpl/connect-token")
async def connect_via_token(
    request: Request,
    payload: dict = Body(...),
    db: Session = Depends(get_db)
):
    """Authenticates user by validating an FPL Session Cookie / Bearer Token."""
    token = payload.get("token")
    if not token:
        raise HTTPException(status_code=400, detail="FPL Session Cookie or Token is required.")

    # Validate token by calling /api/me/
    me_res = await fpl_client.get_me(token=token, session_cookie=token)
    if not me_res.get("accessible") or not me_res.get("raw_json"):
        raise HTTPException(status_code=401, detail="Invalid or expired FPL session token.")

    player_data = me_res["raw_json"].get("player", {})
    manager_id = player_data.get("entry")
    player_name = f"{player_data.get('first_name', '')} {player_data.get('last_name', '')}".strip() or f"Manager {manager_id}"

    if not manager_id:
        raise HTTPException(status_code=404, detail="Could not resolve FPL Manager ID for this token.")

    user = db.query(User).filter(User.fpl_manager_id == manager_id).first()
    if not user:
        user = User(
            fpl_manager_id=manager_id,
            encrypted_access_token=encrypt_token(token),
            is_connected=True
        )
        db.add(user)
    else:
        user.encrypted_access_token = encrypt_token(token)
        user.is_connected = True

    db.commit()
    db.refresh(user)

    request.session["user_id"] = user.id
    request.session["is_connected"] = True
    request.session["fpl_manager_id"] = manager_id
    request.session["fpl_user_name"] = player_name

    return {
        "status": "connected",
        "manager_id": manager_id,
        "user_name": player_name
    }


@router.post("/auth/fpl/disconnect")
async def fpl_disconnect(request: Request, db: Session = Depends(get_db)):
    """Disconnects FPL connection, revokes tokens, clears local session."""
    user_id = request.session.get("user_id")
    if user_id:
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            user.is_connected = False
            user.encrypted_access_token = None
            user.encrypted_refresh_token = None
            db.commit()

    request.session.clear()
    return RedirectResponse(url="/", status_code=303)

@router.get("/api/auth/status")
async def get_auth_status(request: Request, db: Session = Depends(get_db)):
    """Returns current user connection status."""
    is_connected = request.session.get("is_connected", False)
    manager_id = request.session.get("fpl_manager_id")
    user_name = request.session.get("fpl_user_name")

    if not user_name and manager_id:
        mgr_res = await fpl_client.get_manager(manager_id)
        if mgr_res.get("accessible") and mgr_res.get("data"):
            m = mgr_res["data"]
            user_name = f"{m.get('player_first_name', '')} {m.get('player_last_name', '')}".strip()

    bs = await fpl_service.get_gameweeks()
    curr_gw = bs.get("data", {}).get("current_gameweek", {}).get("id", 1) if bs.get("accessible") else 1

    return {
        "connected": is_connected,
        "fpl_manager_id": manager_id,
        "fpl_user_name": user_name or (f"Manager {manager_id}" if manager_id else None),
        "current_gameweek": curr_gw,
        "client_configured": bool(settings.FPL_CLIENT_ID)
    }

@router.get("/api/team")
async def get_user_team(request: Request):
    """Retrieves authenticated user's starting XI and bench."""
    manager_id = request.session.get("fpl_manager_id")
    if not manager_id:
        raise HTTPException(status_code=401, detail="FPL account not connected")

    bs = await fpl_service.get_gameweeks()
    curr_gw = bs.get("data", {}).get("current_gameweek", {}).get("id", 1) if bs.get("accessible") else 1

    picks_res = await fpl_service.get_manager_picks(manager_id, curr_gw)
    if not picks_res.get("accessible") or not picks_res.get("data"):
        raise HTTPException(status_code=404, detail="Could not retrieve squad picks for current gameweek")

    return {
        "manager_id": manager_id,
        "gameweek": curr_gw,
        "team": picks_res["data"]
    }
