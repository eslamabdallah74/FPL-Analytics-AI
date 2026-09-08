import logging
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from app.fpl.client import FPLClient
from app.fpl.service import FPLService
from app.analytics.engine import AnalyticsEngine

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/analytics", tags=["Analytics Engine"])

fpl_client = FPLClient()
fpl_service = FPLService(client=fpl_client)

class SquadGeneratorRequest(BaseModel):
    budget: float = 100.0
    formation: str = "3-4-3"
    locked_ids: List[int] = []
    excluded_ids: List[int] = []

async def _fetch_and_process_data():
    bs = await fpl_service.get_bootstrap_data()
    fx = await fpl_service.get_fixtures()

    if not bs.get("accessible") or not bs.get("raw_json"):
        raise HTTPException(status_code=503, detail="Unable to retrieve data from FPL services")

    raw_json = bs["raw_json"]
    players = raw_json.get("elements", [])
    teams = raw_json.get("teams", [])
    events = raw_json.get("events", [])
    fixtures = fx.get("raw_json", []) if fx.get("accessible") else []

    curr_event = next((e.get("id") for e in events if e.get("is_current")), 1)

    processed_players = AnalyticsEngine.process_players(players, teams, fixtures, current_gw=curr_event)
    return processed_players, teams, fixtures, curr_event

@router.get("/dashboard")
async def get_analytics_dashboard():
    """Returns overview widgets for dashboard: Top Form, Top Transfers, Top Captains, Top Differentials."""
    players, teams, fixtures, curr_gw = await _fetch_and_process_data()

    transfers = AnalyticsEngine.get_transfer_targets(players, top_n=5)
    captains = AnalyticsEngine.get_captain_rankings(players, top_n=5)
    differentials = AnalyticsEngine.get_differentials(players, max_ownership=10.0, top_n=5)
    fixture_planner = AnalyticsEngine.get_fixture_planner(teams, fixtures, current_gw=curr_gw)

    top_form = sorted(players, key=lambda x: x.get("form_score", 0), reverse=True)[:5]
    top_value = sorted(players, key=lambda x: x.get("value_score", 0), reverse=True)[:5]

    return {
        "current_gameweek": curr_gw,
        "total_players": len(players),
        "top_form": top_form,
        "top_value": top_value,
        "transfer_targets": transfers,
        "captain_candidates": captains,
        "differentials": differentials,
        "easy_fixture_runs": fixture_planner.get("easy_runs", [])
    }

@router.get("/players")
async def get_analytics_players(
    position: Optional[str] = Query(None, description="Position filter: GKP, DEF, MID, FWD"),
    team_id: Optional[int] = Query(None, description="Team ID filter"),
    max_price: Optional[float] = Query(None, description="Maximum price filter in £M"),
    search: Optional[str] = Query(None, description="Player name search"),
    sort_by: str = Query("transfer_score", description="Sort metric: transfer_score, form_score, value_score, captain_score, total_points, price")
):
    """Returns processed player analytics with filtering & sorting."""
    players, teams, fixtures, curr_gw = await _fetch_and_process_data()

    filtered = players

    if position:
        filtered = [p for p in filtered if p.get("position_name", "").upper() == position.upper()]

    if team_id:
        filtered = [p for p in filtered if p.get("team") == team_id]

    if max_price:
        filtered = [p for p in filtered if p.get("price", 0) <= max_price]

    if search:
        s_clean = search.strip().lower()
        filtered = [
            p for p in filtered 
            if s_clean in p.get("web_name", "").lower() or s_clean in p.get("first_name", "").lower() or s_clean in p.get("second_name", "").lower()
        ]

    # Sort
    valid_sorts = ["transfer_score", "form_score", "value_score", "captain_score", "total_points", "price", "selected_by_percent"]
    sort_field = sort_by if sort_by in valid_sorts else "transfer_score"
    
    filtered = sorted(filtered, key=lambda x: x.get(sort_field, 0), reverse=True)

    return {
        "current_gameweek": curr_gw,
        "total_results": len(filtered),
        "players": filtered
    }

@router.get("/players/{player_id}")
async def get_player_deep_dive(player_id: int):
    """Returns comprehensive player analysis including gameweek history & upcoming fixtures."""
    players, teams, fixtures, curr_gw = await _fetch_and_process_data()

    player = next((p for p in players if p["id"] == player_id), None)
    if not player:
        raise HTTPException(status_code=404, detail=f"Player ID {player_id} not found")

    summary_res = await fpl_service.get_player_summary(player_id)
    summary_data = summary_res.get("data", {}) if summary_res.get("accessible") else {}

    verdict_data = AnalyticsEngine.get_player_action_verdict(player)

    return {
        "player": player,
        "action_verdict": verdict_data,
        "history": summary_data.get("history", []),
        "upcoming_fixtures": summary_data.get("upcoming_fixtures", [])
    }

@router.get("/fixtures")
async def get_fixture_analytics():
    """Returns fixture planner difficulty matrix & easy/hard runs."""
    players, teams, fixtures, curr_gw = await _fetch_and_process_data()
    return AnalyticsEngine.get_fixture_planner(teams, fixtures, current_gw=curr_gw)

@router.get("/transfers")
async def get_transfer_analytics(top_n: int = Query(15, ge=1, le=50)):
    """Returns ranked transfer targets with algorithmic reasoning."""
    players, teams, fixtures, curr_gw = await _fetch_and_process_data()
    targets = AnalyticsEngine.get_transfer_targets(players, top_n=top_n)
    return {
        "current_gameweek": curr_gw,
        "total_targets": len(targets),
        "targets": targets
    }

@router.get("/captains")
async def get_captain_analytics(top_n: int = Query(10, ge=1, le=30)):
    """Returns captain candidates with rank score breakdowns."""
    players, teams, fixtures, curr_gw = await _fetch_and_process_data()
    captains = AnalyticsEngine.get_captain_rankings(players, top_n=top_n)
    return {
        "current_gameweek": curr_gw,
        "candidates": captains
    }

@router.get("/differentials")
async def get_differential_analytics(max_ownership: float = Query(10.0, ge=1.0, le=25.0), top_n: int = Query(15, ge=1, le=50)):
    """Returns top differential options with low ownership."""
    players, teams, fixtures, curr_gw = await _fetch_and_process_data()
    differentials = AnalyticsEngine.get_differentials(players, max_ownership=max_ownership, top_n=top_n)
    return {
        "current_gameweek": curr_gw,
        "max_ownership_filter": max_ownership,
        "differentials": differentials
    }

@router.get("/compare")
async def compare_players_endpoint(p1_id: int = Query(...), p2_id: int = Query(...)):
    """Head-to-head analytical comparison between two players."""
    players, teams, fixtures, curr_gw = await _fetch_and_process_data()

    p1 = next((p for p in players if p["id"] == p1_id), None)
    p2 = next((p for p in players if p["id"] == p2_id), None)

    if not p1 or not p2:
        raise HTTPException(status_code=404, detail="One or both player IDs were not found")

    return AnalyticsEngine.compare_players(p1, p2)

@router.get("/my-team/{manager_id}")
async def get_my_team_analytics(manager_id: int):
    """Fetches FPL manager squad and returns enriched pitch view & AI manager advice."""
    players, teams, fixtures, curr_gw = await _fetch_and_process_data()

    m_profile = await fpl_service.get_manager(manager_id)
    if not m_profile.get("accessible"):
        raise HTTPException(status_code=404, detail=f"FPL Manager ID {manager_id} not found or inaccessible")

    m_picks = await fpl_service.get_manager_picks(manager_id, curr_gw)

    return AnalyticsEngine.analyze_my_team(m_profile, m_picks, players)

@router.post("/generate-squad")
async def generate_optimal_squad_endpoint(payload: SquadGeneratorRequest):
    """Generates the optimal 15-man squad under budget & formation constraints."""
    players, teams, fixtures, curr_gw = await _fetch_and_process_data()
    return AnalyticsEngine.generate_optimal_squad(
        processed_players=players,
        budget=payload.budget,
        formation=payload.formation,
        locked_ids=payload.locked_ids,
        excluded_ids=payload.excluded_ids
    )


