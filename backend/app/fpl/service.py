import json
import logging
from typing import Any, Dict, List, Optional
import redis
from app.config import settings
from app.fpl.client import FPLClient

logger = logging.getLogger(__name__)

ELEMENT_TYPES = {
    1: "GKP",
    2: "DEF",
    3: "MID",
    4: "FWD"
}

class FPLService:
    def __init__(self, client: Optional[FPLClient] = None):
        self.client = client or FPLClient()
        self.redis_client = None
        try:
            r = redis.Redis.from_url(settings.REDIS_URL, decode_responses=True)
            r.ping()
            self.redis_client = r
            logger.info("Redis cache connected successfully.")
        except Exception as e:
            logger.warning(f"Redis cache unavailable, proceeding without Redis: {e}")

    def _get_cache(self, key: str) -> Optional[Dict[str, Any]]:
        if not self.redis_client:
            return None
        try:
            val = self.redis_client.get(key)
            if val:
                return json.loads(val)
        except Exception as e:
            logger.error(f"Redis get error: {e}")
        return None

    def _set_cache(self, key: str, value: Dict[str, Any], ttl: int = 300):
        if not self.redis_client:
            return
        try:
            self.redis_client.setex(key, ttl, json.dumps(value))
        except Exception as e:
            logger.error(f"Redis set error: {e}")

    async def get_bootstrap_data(self, force_refresh: bool = False) -> Dict[str, Any]:
        cache_key = "fpl:bootstrap_static"
        if not force_refresh:
            cached = self._get_cache(cache_key)
            if cached:
                return cached

        res = await self.client.get_bootstrap_static()
        if res.get("accessible") and res.get("raw_json"):
            # Format high-level data summary
            raw = res["raw_json"]
            teams_map = {t["id"]: t["name"] for t in raw.get("teams", [])}
            elements = raw.get("elements", [])
            for el in elements:
                el["team_name"] = teams_map.get(el.get("team"), "Unknown")
                el["position_name"] = ELEMENT_TYPES.get(el.get("element_type"), "Unknown")
            
            res["data"] = {
                "total_players": len(elements),
                "total_teams": len(raw.get("teams", [])),
                "total_events": len(raw.get("events", [])),
                "players": elements,
                "teams": raw.get("teams", []),
                "events": raw.get("events", [])
            }
            self._set_cache(cache_key, res, ttl=600)
        return res

    async def get_teams(self) -> Dict[str, Any]:
        bs = await self.get_bootstrap_data()
        if bs.get("accessible") and bs.get("raw_json"):
            bs["data"] = bs["raw_json"].get("teams", [])
        return bs

    async def get_players(self) -> Dict[str, Any]:
        bs = await self.get_bootstrap_data()
        if bs.get("accessible") and bs.get("raw_json"):
            bs["data"] = bs["raw_json"].get("elements", [])
        return bs

    async def get_gameweeks(self) -> Dict[str, Any]:
        bs = await self.get_bootstrap_data()
        if bs.get("accessible") and bs.get("raw_json"):
            events = bs["raw_json"].get("events", [])
            curr = next((e for e in events if e.get("is_current")), None)
            nxt = next((e for e in events if e.get("is_next")), None)
            prev = next((e for e in events if e.get("is_previous")), None)
            bs["data"] = {
                "current_gameweek": curr,
                "next_gameweek": nxt,
                "previous_gameweek": prev,
                "all_gameweeks": events
            }
        return bs

    async def get_fixtures(self) -> Dict[str, Any]:
        cache_key = "fpl:fixtures"
        cached = self._get_cache(cache_key)
        if cached:
            return cached

        res = await self.client.get_fixtures()
        if res.get("accessible") and res.get("raw_json"):
            bs = await self.get_bootstrap_data()
            teams_map = {}
            if bs.get("raw_json"):
                teams_map = {t["id"]: t["name"] for t in bs["raw_json"].get("teams", [])}
            
            fixtures = res["raw_json"]
            for f in fixtures:
                f["team_h_name"] = teams_map.get(f.get("team_h"), f"Team {f.get('team_h')}")
                f["team_a_name"] = teams_map.get(f.get("team_a"), f"Team {f.get('team_a')}")
            
            upcoming = [f for f in fixtures if not f.get("finished")]
            completed = [f for f in fixtures if f.get("finished")]
            
            res["data"] = {
                "total_fixtures": len(fixtures),
                "upcoming": upcoming,
                "completed": completed,
                "all": fixtures
            }
            self._set_cache(cache_key, res, ttl=300)
        return res

    async def get_manager(self, manager_id: int) -> Dict[str, Any]:
        res = await self.client.get_manager(manager_id)
        if res.get("accessible") and res.get("raw_json"):
            raw = res["raw_json"]
            res["data"] = {
                "id": raw.get("id"),
                "player_first_name": raw.get("player_first_name"),
                "player_last_name": raw.get("player_last_name"),
                "player_region_name": raw.get("player_region_name"),
                "player_region_iso_code_short": raw.get("player_region_iso_code_short"),
                "summary_overall_points": raw.get("summary_overall_points"),
                "summary_overall_rank": raw.get("summary_overall_rank"),
                "summary_event_points": raw.get("summary_event_points"),
                "summary_event_rank": raw.get("summary_event_rank"),
                "current_event": raw.get("current_event"),
                "last_deadline_bank": raw.get("last_deadline_bank"),
                "last_deadline_value": raw.get("last_deadline_value"),
                "last_deadline_total_transfers": raw.get("last_deadline_total_transfers"),
                "leagues": raw.get("leagues", {})
            }
        return res

    async def get_manager_history(self, manager_id: int) -> Dict[str, Any]:
        res = await self.client.get_manager_history(manager_id)
        if res.get("accessible") and res.get("raw_json"):
            raw = res["raw_json"]
            res["data"] = {
                "current": raw.get("current", []),
                "past": raw.get("past", []),
                "chips": raw.get("chips", [])
            }
        return res

    async def get_manager_picks(self, manager_id: int, gameweek: int) -> Dict[str, Any]:
        res = await self.client.get_manager_picks(manager_id, gameweek)
        gw_attempt = gameweek
        while not res.get("accessible") and gw_attempt > 1:
            gw_attempt -= 1
            res = await self.client.get_manager_picks(manager_id, gw_attempt)

        if res.get("accessible") and res.get("raw_json"):
            raw = res["raw_json"]
            picks = raw.get("picks", [])
            
            # Fetch bootstrap for player name/team/position resolution
            bs = await self.get_bootstrap_data()
            players_map = {}
            teams_map = {}
            if bs.get("raw_json"):
                teams_map = {t["id"]: t["name"] for t in bs["raw_json"].get("teams", [])}
                players_map = {p["id"]: p for p in bs["raw_json"].get("elements", [])}

            starting_xi = []
            bench = []
            captain = None
            vice_captain = None

            for p in picks:
                pid = p.get("element")
                pinfo = players_map.get(pid, {})
                pick_data = {
                    "element": pid,
                    "player_web_name": pinfo.get("web_name", f"Player {pid}"),
                    "team_name": teams_map.get(pinfo.get("team"), "Unknown"),
                    "position": p.get("position"),
                    "multiplier": p.get("multiplier"),
                    "is_captain": p.get("is_captain", False),
                    "is_vice_captain": p.get("is_vice_captain", False),
                    "element_type": pinfo.get("element_type"),
                    "position_name": ELEMENT_TYPES.get(pinfo.get("element_type"), "Unknown"),
                    "selling_price": p.get("selling_price"),
                    "purchase_price": p.get("purchase_price")
                }

                if p.get("position", 15) <= 11:
                    starting_xi.append(pick_data)
                else:
                    bench.append(pick_data)

                if p.get("is_captain"):
                    captain = pick_data
                if p.get("is_vice_captain"):
                    vice_captain = pick_data

            res["data"] = {
                "gameweek_fetched": gw_attempt,
                "active_chip": raw.get("active_chip"),
                "entry_history": raw.get("entry_history", {}),
                "starting_xi": starting_xi,
                "bench": bench,
                "captain": captain,
                "vice_captain": vice_captain,
                "all_picks": picks
            }
        return res

    async def get_manager_transfers(self, manager_id: int) -> Dict[str, Any]:
        res = await self.client.get_manager_transfers(manager_id)
        if res.get("accessible") and res.get("raw_json"):
            transfers = res["raw_json"]
            bs = await self.get_bootstrap_data()
            players_map = {}
            if bs.get("raw_json"):
                players_map = {p["id"]: p.get("web_name") for p in bs["raw_json"].get("elements", [])}

            formatted_transfers = []
            for t in transfers:
                formatted_transfers.append({
                    "event": t.get("event"),
                    "time": t.get("time"),
                    "element_in": t.get("element_in"),
                    "element_in_name": players_map.get(t.get("element_in"), f"Player {t.get('element_in')}"),
                    "element_out": t.get("element_out"),
                    "element_out_name": players_map.get(t.get("element_out"), f"Player {t.get('element_out')}"),
                    "element_in_cost": t.get("element_in_cost"),
                    "element_out_cost": t.get("element_out_cost")
                })
            res["data"] = formatted_transfers
        return res

    async def get_player_summary(self, player_id: int) -> Dict[str, Any]:
        res = await self.client.get_player_summary(player_id)
        if res.get("accessible") and res.get("raw_json"):
            raw = res["raw_json"]
            bs = await self.get_bootstrap_data()
            teams_map = {}
            player_info = None
            if bs.get("raw_json"):
                teams_map = {t["id"]: t["name"] for t in bs["raw_json"].get("teams", [])}
                player_info = next((p for p in bs["raw_json"].get("elements", []) if p["id"] == player_id), None)

            history = raw.get("history", [])
            for h in history:
                opp_id = h.get("opponent_team")
                h["opponent_team_name"] = teams_map.get(opp_id, f"Team {opp_id}")

            fixtures = raw.get("fixtures", [])
            for f in fixtures:
                is_home = f.get("is_home", False)
                opp_id = f.get("team_a") if is_home else f.get("team_h")
                f["opponent_team_name"] = teams_map.get(opp_id, f"Team {opp_id}")

            res["data"] = {
                "player_info": player_info,
                "history": history,
                "upcoming_fixtures": fixtures,
                "history_past": raw.get("history_past", [])
            }
        return res

    async def get_gameweek_live(self, gameweek: int) -> Dict[str, Any]:
        res = await self.client.get_gameweek_live(gameweek)
        if res.get("accessible") and res.get("raw_json"):
            elements = res["raw_json"].get("elements", [])
            bs = await self.get_bootstrap_data()
            players_map = {}
            if bs.get("raw_json"):
                players_map = {p["id"]: p for p in bs["raw_json"].get("elements", [])}

            formatted_elements = []
            for el in elements:
                pid = el.get("id")
                pinfo = players_map.get(pid, {})
                stats = el.get("stats", {})
                formatted_elements.append({
                    "id": pid,
                    "web_name": pinfo.get("web_name", f"Player {pid}"),
                    "team": pinfo.get("team_name", "Unknown"),
                    "element_type": ELEMENT_TYPES.get(pinfo.get("element_type"), "Unknown"),
                    "minutes": stats.get("minutes", 0),
                    "goals_scored": stats.get("goals_scored", 0),
                    "assists": stats.get("assists", 0),
                    "clean_sheets": stats.get("clean_sheets", 0),
                    "goals_conceded": stats.get("goals_conceded", 0),
                    "own_goals": stats.get("own_goals", 0),
                    "penalties_saved": stats.get("penalties_saved", 0),
                    "penalties_missed": stats.get("penalties_missed", 0),
                    "yellow_cards": stats.get("yellow_cards", 0),
                    "red_cards": stats.get("red_cards", 0),
                    "saves": stats.get("saves", 0),
                    "bonus": stats.get("bonus", 0),
                    "bps": stats.get("bps", 0),
                    "total_points": stats.get("total_points", 0),
                    "explain": el.get("explain", [])
                })
            res["data"] = {
                "gameweek": gameweek,
                "total_players": len(formatted_elements),
                "players": formatted_elements
            }
        return res
