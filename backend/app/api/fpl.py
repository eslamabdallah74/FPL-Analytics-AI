from typing import Any, Dict, Optional
from fastapi import APIRouter, Query, Path
from app.fpl.service import FPLService
from app.fpl.schemas import BaseResponseEnvelope, TokenAuthRequestSchema

router = APIRouter(prefix="/api/fpl", tags=["FPL Integration"])
service = FPLService()

@router.get("/bootstrap", response_model=BaseResponseEnvelope)
async def get_bootstrap(refresh: bool = Query(False, description="Force cache refresh")):
    return await service.get_bootstrap_data(force_refresh=refresh)

@router.get("/teams", response_model=BaseResponseEnvelope)
async def get_teams():
    return await service.get_teams()

@router.get("/players", response_model=BaseResponseEnvelope)
async def get_players():
    return await service.get_players()

@router.get("/gameweeks", response_model=BaseResponseEnvelope)
async def get_gameweeks():
    return await service.get_gameweeks()

@router.get("/fixtures", response_model=BaseResponseEnvelope)
async def get_fixtures():
    return await service.get_fixtures()

@router.get("/manager/{manager_id}", response_model=BaseResponseEnvelope)
async def get_manager(manager_id: int = Path(..., description="FPL Manager ID")):
    return await service.get_manager(manager_id)

@router.get("/manager/{manager_id}/history", response_model=BaseResponseEnvelope)
async def get_manager_history(manager_id: int = Path(..., description="FPL Manager ID")):
    return await service.get_manager_history(manager_id)

@router.get("/manager/{manager_id}/picks/{gameweek}", response_model=BaseResponseEnvelope)
async def get_manager_picks(
    manager_id: int = Path(..., description="FPL Manager ID"),
    gameweek: int = Path(..., description="Gameweek Number")
):
    return await service.get_manager_picks(manager_id, gameweek)

@router.get("/manager/{manager_id}/transfers", response_model=BaseResponseEnvelope)
async def get_manager_transfers(manager_id: int = Path(..., description="FPL Manager ID")):
    return await service.get_manager_transfers(manager_id)

@router.get("/oidc-discovery", response_model=BaseResponseEnvelope)
async def get_oidc_discovery():
    """Queries live PingOne OpenID Connect discovery metadata for FPL auth server."""
    return await service.client.get_oidc_discovery()

@router.get("/me", response_model=BaseResponseEnvelope)
async def get_me(token: Optional[str] = Query(None, description="OAuth Access Token (JWT)")):
    """Queries /api/me/ endpoint using X-API-Authorization: Bearer <token>."""
    return await service.client.get_me(token=token)

@router.get("/manager/{manager_id}/my-team", response_model=BaseResponseEnvelope)
async def get_my_team_audit(
    manager_id: int = Path(..., description="FPL Manager ID"),
    token: Optional[str] = Query(None, description="OAuth Access Token (JWT)"),
    session_id: Optional[str] = Query(None, description="Optional FPL sessionid cookie")
):
    """Queries /api/my-team/{manager_id}/ with Bearer token or sessionid cookie."""
    return await service.client.get_my_team(manager_id, token=token, session_cookie=session_id)

@router.post("/token-auth", response_model=BaseResponseEnvelope)
async def verify_token_auth(payload: TokenAuthRequestSchema):
    """Verifies an OAuth Access Token against /api/me/ and /api/my-team/{manager_id}/."""
    token = payload.access_token
    manager_id = payload.manager_id
    session_id = payload.session_id

    if not token and not session_id:
        return {
            "status_code": 400,
            "response_time_ms": 0.0,
            "endpoint": "/api/fpl/token-auth",
            "url": "https://fantasy.premierleague.com/",
            "requires_auth": True,
            "accessible": False,
            "raw_json": None,
            "data": None,
            "error": "Provide access_token (JWT) or session_id cookie."
        }

    me_res = await service.client.get_me(token=token)
    team_res = None
    if manager_id:
        team_res = await service.client.get_my_team(manager_id, token=token, session_cookie=session_id)

    return {
        "status_code": me_res["status_code"],
        "response_time_ms": me_res["response_time_ms"],
        "endpoint": "/api/fpl/token-auth",
        "url": "https://fantasy.premierleague.com/api/me/",
        "requires_auth": True,
        "accessible": me_res["accessible"],
        "raw_json": {
            "me_response": me_res,
            "my_team_response": team_res
        },
        "data": {
            "me_data": me_res.get("raw_json"),
            "my_team_data": team_res.get("raw_json") if team_res else None
        },
        "error": me_res.get("error")
    }

@router.get("/player/{player_id}", response_model=BaseResponseEnvelope)
async def get_player(player_id: int = Path(..., description="FPL Player ID")):
    return await service.get_player_summary(player_id)

@router.get("/player/{player_id}/history", response_model=BaseResponseEnvelope)
async def get_player_history(player_id: int = Path(..., description="FPL Player ID")):
    return await service.get_player_summary(player_id)

@router.get("/gameweek/{gameweek}/live", response_model=BaseResponseEnvelope)
async def get_gameweek_live(gameweek: int = Path(..., description="Gameweek Number")):
    return await service.get_gameweek_live(gameweek)

@router.get("/auth-audit")
async def get_auth_audit():
    """Runs live connectivity check across key FPL public and authenticated endpoints."""
    endpoints_to_test = [
        ("GET /api/bootstrap-static/ (Public)", service.client.get_bootstrap_static()),
        ("GET /api/fixtures/ (Public)", service.client.get_fixtures()),
        ("GET /api/event/1/live/ (Public)", service.client.get_gameweek_live(1)),
        ("GET /api/entry/1/ (Public)", service.client.get_manager(1)),
        ("GET /api/entry/1/history/ (Public)", service.client.get_manager_history(1)),
        ("GET /api/entry/1/event/1/picks/ (Public)", service.client.get_manager_picks(1, 1)),
        ("GET /api/entry/1/transfers/ (Public)", service.client.get_manager_transfers(1)),
        ("GET /api/element-summary/1/ (Public)", service.client.get_player_summary(1)),
        ("GET /api/me/ (OAuth Bearer)", service.client.get_me()),
        ("GET /api/my-team/1/ (OAuth Bearer / Cookie)", service.client.get_my_team(1)),
        ("GET PingOne OIDC Discovery Document", service.client.get_oidc_discovery()),
    ]
    
    audit_results = []
    for name, coro in endpoints_to_test:
        res = await coro
        audit_results.append({
            "endpoint": name,
            "http_status": res["status_code"],
            "requires_auth": res["requires_auth"],
            "accessible": res["accessible"],
            "response_time_ms": res["response_time_ms"],
            "notes": "Publicly accessible endpoint" if res["accessible"] else (
                f"OAuth / JWT Authentication Required ({res.get('error', '')})" if res["requires_auth"] else res.get("error")
            )
        })

    return {
        "status": "completed",
        "audit": audit_results
    }
