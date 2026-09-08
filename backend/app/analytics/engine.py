import logging
from typing import Any, Dict, List, Optional
import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)

ELEMENT_TYPES = {
    1: "GKP",
    2: "DEF",
    3: "MID",
    4: "FWD"
}

class AnalyticsEngine:
    """Core Analytics Engine for processing raw FPL public data into high-value metrics."""

    @staticmethod
    def process_players(players: List[Dict[str, Any]], teams: List[Dict[str, Any]], fixtures: List[Dict[str, Any]], current_gw: int = 1) -> List[Dict[str, Any]]:
        if not players:
            return []

        df = pd.DataFrame(players)
        teams_map = {t["id"]: t["name"] for t in teams}
        teams_short_map = {t["id"]: t.get("short_name", t["name"][:3].upper()) for t in teams}

        # Basic conversions
        df["price"] = df["now_cost"] / 10.0
        df["team_name"] = df["team"].map(teams_map).fillna("Unknown")
        df["team_short"] = df["team"].map(teams_short_map).fillna("UNK")
        df["position_name"] = df["element_type"].map(ELEMENT_TYPES).fillna("UNK")
        
        # Photo and Shirt Image URLs
        def get_photo_url(photo_str: str, size: str = "110x140") -> str:
            if not photo_str:
                return ""
            code = str(photo_str).replace(".jpg", "").replace(".png", "")
            return f"https://resources.premierleague.com/premierleague/photos/players/{size}/p{code}.png"

        def get_shirt_url(team_code_val: Any, el_type: Any) -> str:
            if not team_code_val:
                return ""
            # Goalkeeper shirt vs standard shirt
            suffix = "_1-66.png" if el_type == 1 else "-66.png"
            return f"https://fantasy.premierleague.com/dist/img/shirts/standard/shirt_{team_code_val}{suffix}"

        df["photo_url"] = df["photo"].map(lambda p: get_photo_url(p, "110x140"))
        df["photo_url_lg"] = df["photo"].map(lambda p: get_photo_url(p, "250x250"))
        df["shirt_url"] = df.apply(lambda row: get_shirt_url(row.get("team_code"), row.get("element_type")), axis=1)
        
        # Numeric conversions
        numeric_cols = ["total_points", "form", "selected_by_percent", "points_per_game", "ict_index", 
                        "transfers_in_event", "transfers_out_event", "minutes", "goals_scored", "assists", "clean_sheets", "bonus", "bps"]
        for col in numeric_cols:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0.0)

        # 1. Derived Metric: Value Score (Points / Price)
        df["value_score"] = np.where(df["price"] > 0, np.round(df["total_points"] / df["price"], 2), 0.0)

        # 2. Derived Metric: Form Score (float)
        df["form_score"] = df["form"].astype(float)

        # 3. Derived Metric: Consistency Score (0-10 scale based on points vs minutes)
        total_possible_mins = max(current_gw * 90, 90)
        df["mins_ratio"] = np.clip(df["minutes"] / total_possible_mins, 0.0, 1.0)
        df["consistency_score"] = np.round(np.clip((df["points_per_game"] * 0.7) + (df["mins_ratio"] * 3.0), 0.0, 10.0), 1)

        # 4. Derived Metric: Rotation Risk
        def calc_rotation_risk(row):
            mins_per_gw = row["minutes"] / max(current_gw, 1)
            if mins_per_gw >= 65:
                return "Low"
            elif mins_per_gw >= 35:
                return "Medium"
            else:
                return "High"

        df["rotation_risk"] = df.apply(calc_rotation_risk, axis=1)

        # 5. Calculate upcoming FDR (Fixture Difficulty Rating) for next 5 GWs
        team_fdr_map = AnalyticsEngine._calc_team_upcoming_fdr(teams, fixtures, current_gw)
        df["upcoming_fdr"] = df["team"].map(lambda t_id: team_fdr_map.get(t_id, {}).get("avg_fdr", 3.0))
        df["upcoming_fixtures"] = df["team"].map(lambda t_id: team_fdr_map.get(t_id, {}).get("fixtures", []))

        # 6. Composite Transfer Score (0 - 100)
        raw_transfer_score = (
            (df["form_score"] * 7.5) +
            ((5.0 - df["upcoming_fdr"]) * 8.0) +
            (df["value_score"] * 1.2) +
            (df["mins_ratio"] * 15.0)
        )
        df["transfer_score"] = np.round(np.clip(raw_transfer_score, 0.0, 100.0), 1)

        # 7. Composite Captain Score (0 - 100)
        raw_captain_score = (
            (df["form_score"] * 9.0) +
            ((5.0 - df["upcoming_fdr"]) * 7.0) +
            (df["ict_index"] * 0.25) +
            (df["mins_ratio"] * 10.0)
        )
        df["captain_score"] = np.round(np.clip(raw_captain_score, 0.0, 100.0), 1)

        # 8. Derived Metric: Expected Points Next GW (xP)
        df["ep_next_val"] = pd.to_numeric(df["ep_next"], errors="coerce").fillna(0.0)
        raw_xp = np.where(
            df["ep_next_val"] > 0,
            df["ep_next_val"],
            (df["form_score"] * 0.6) + ((5.0 - df["upcoming_fdr"]) * 0.4) + (df["ict_index"] * 0.02)
        )
        df["expected_points"] = np.round(np.clip(raw_xp, 0.0, 20.0), 1)

        # 9. Derived Metric: Per 90 Stats (ICT / 90, Goal Involvements / 90, Bonus / 90)
        df["nineties"] = np.where(df["minutes"] >= 90, df["minutes"] / 90.0, 0.0)
        df["ict_per_90"] = np.where(df["nineties"] > 0, np.round(df["ict_index"] / df["nineties"], 2), 0.0)
        
        df["attacking_returns"] = df["goals_scored"] + df["assists"]
        df["returns_per_90"] = np.where(df["nineties"] > 0, np.round(df["attacking_returns"] / df["nineties"], 2), 0.0)
        df["bonus_per_90"] = np.where(df["nineties"] > 0, np.round(df["bonus"] / df["nineties"], 2), 0.0)

        # 10. Derived Metric: Net Transfers (Transfer Momentum)
        df["net_transfers_gw"] = df["transfers_in_event"] - df["transfers_out_event"]

        # 11. Derived Metric: Set Piece Role
        def determine_set_pieces(row):
            roles = []
            if pd.notnull(row.get("penalties_order")) and row.get("penalties_order") == 1:
                roles.append("Penalties")
            if pd.notnull(row.get("direct_freekicks_order")) and row.get("direct_freekicks_order") in [1, 2]:
                roles.append("Free Kicks")
            if pd.notnull(row.get("corners_and_indirect_freekicks_order")) and row.get("corners_and_indirect_freekicks_order") in [1, 2]:
                roles.append("Corners")
            return " & ".join(roles) if roles else "None"

        df["set_piece_role"] = df.apply(determine_set_pieces, axis=1)

        # Replace any NaN or Inf with 0.0 to prevent JSON serialization errors
        df = df.replace([np.inf, -np.inf, np.nan], 0.0)

        records = df.to_dict(orient="records")
        for r in records:
            for k, v in r.items():
                if isinstance(v, float) and (np.isnan(v) or np.isinf(v)):
                    r[k] = 0.0
        return records

    @staticmethod
    def _calc_team_upcoming_fdr(teams: List[Dict[str, Any]], fixtures: List[Dict[str, Any]], current_gw: int) -> Dict[int, Dict[str, Any]]:
        result = {}
        teams_map = {t["id"]: t["name"] for t in teams}
        teams_short_map = {t["id"]: t.get("short_name", t["name"][:3].upper()) for t in teams}
        teams_code_map = {t["id"]: t.get("code") for t in teams}

        def get_team_shirt(code_val: Any) -> str:
            if not code_val:
                return ""
            return f"https://fantasy.premierleague.com/dist/img/shirts/standard/shirt_{code_val}-66.png"

        def get_team_badge(code_val: Any) -> str:
            if not code_val:
                return ""
            return f"https://resources.premierleague.com/premierleague/badges/70/t{code_val}.png"

        upcoming = [f for f in fixtures if not f.get("finished") and f.get("event") is not None and f.get("event") >= current_gw]
        
        for t in teams:
            t_id = t["id"]
            t_code = t.get("code")
            t_fixtures = []
            for f in upcoming:
                if f.get("team_h") == t_id:
                    opp_id = f.get("team_a")
                    opp_code = teams_code_map.get(opp_id)
                    t_fixtures.append({
                        "event": f.get("event"),
                        "opponent_id": opp_id,
                        "opponent_code": opp_code,
                        "opponent_name": teams_map.get(opp_id, f"Team {opp_id}"),
                        "opponent_short": teams_short_map.get(opp_id, "UNK"),
                        "opponent_shirt_url": get_team_shirt(opp_code),
                        "opponent_badge_url": get_team_badge(opp_code),
                        "is_home": True,
                        "difficulty": f.get("team_h_difficulty", 3)
                    })
                elif f.get("team_a") == t_id:
                    opp_id = f.get("team_h")
                    opp_code = teams_code_map.get(opp_id)
                    t_fixtures.append({
                        "event": f.get("event"),
                        "opponent_id": opp_id,
                        "opponent_code": opp_code,
                        "opponent_name": teams_map.get(opp_id, f"Team {opp_id}"),
                        "opponent_short": teams_short_map.get(opp_id, "UNK"),
                        "opponent_shirt_url": get_team_shirt(opp_code),
                        "opponent_badge_url": get_team_badge(opp_code),
                        "is_home": False,
                        "difficulty": f.get("team_a_difficulty", 3)
                    })

            t_fixtures = sorted(t_fixtures, key=lambda x: x["event"])[:5]
            avg_fdr = np.mean([fx["difficulty"] for fx in t_fixtures]) if t_fixtures else 3.0
            
            result[t_id] = {
                "team_id": t_id,
                "team_code": t_code,
                "team_name": t["name"],
                "team_short": teams_short_map.get(t_id, "UNK"),
                "shirt_url": get_team_shirt(t_code),
                "badge_url": get_team_badge(t_code),
                "avg_fdr": round(float(avg_fdr), 2),
                "fixtures": t_fixtures
            }
            
        return result

    @staticmethod
    def get_fixture_planner(teams: List[Dict[str, Any]], fixtures: List[Dict[str, Any]], current_gw: int = 1) -> Dict[str, Any]:
        team_fdrs = AnalyticsEngine._calc_team_upcoming_fdr(teams, fixtures, current_gw)
        
        planner = []
        easy_runs = []
        hard_runs = []

        for t_id, data in team_fdrs.items():
            planner.append(data)
            avg = data["avg_fdr"]
            t_name = data["team_name"]
            
            if avg <= 2.6:
                easy_runs.append({
                    "team_id": t_id,
                    "team_code": data.get("team_code"),
                    "team_name": t_name,
                    "shirt_url": data.get("shirt_url"),
                    "badge_url": data.get("badge_url"),
                    "avg_fdr": avg,
                    "reason": f"{t_name} has one of the easiest fixture runs over the next 5 Gameweeks (Avg FDR {avg})."
                })
            elif avg >= 3.8:
                hard_runs.append({
                    "team_id": t_id,
                    "team_code": data.get("team_code"),
                    "team_name": t_name,
                    "shirt_url": data.get("shirt_url"),
                    "badge_url": data.get("badge_url"),
                    "avg_fdr": avg,
                    "reason": f"{t_name} faces a tough schedule over the next 5 Gameweeks (Avg FDR {avg})."
                })

        planner = sorted(planner, key=lambda x: x["avg_fdr"])
        easy_runs = sorted(easy_runs, key=lambda x: x["avg_fdr"])
        hard_runs = sorted(hard_runs, key=lambda x: x["avg_fdr"], reverse=True)

        return {
            "current_gameweek": current_gw,
            "planner": planner,
            "easy_runs": easy_runs,
            "hard_runs": hard_runs
        }

    @staticmethod
    def get_transfer_targets(processed_players: List[Dict[str, Any]], top_n: int = 10) -> List[Dict[str, Any]]:
        valid = [p for p in processed_players if p.get("minutes", 0) > 60]
        sorted_players = sorted(valid, key=lambda x: x.get("transfer_score", 0), reverse=True)[:top_n]
        
        targets = []
        for i, p in enumerate(sorted_players, 1):
            reasons = []
            if p.get("form_score", 0) >= 5.0:
                reasons.append(f"Strong recent form ({p.get('form_score')} pts/GW)")
            if p.get("upcoming_fdr", 3.0) <= 2.7:
                reasons.append(f"Favorable upcoming fixtures (Avg FDR {p.get('upcoming_fdr')})")
            if p.get("value_score", 0) >= 10.0:
                reasons.append(f"Exceptional value score ({p.get('value_score')} pts/£M)")
            if not reasons:
                reasons.append("Solid overall rating across minutes and returns")

            targets.append({
                "rank": i,
                "player": p,
                "transfer_score": p.get("transfer_score"),
                "primary_reason": reasons[0],
                "all_reasons": reasons
            })
        return targets

    @staticmethod
    def get_captain_rankings(processed_players: List[Dict[str, Any]], top_n: int = 10) -> List[Dict[str, Any]]:
        valid = [p for p in processed_players if p.get("minutes", 0) > 90]
        sorted_players = sorted(valid, key=lambda x: x.get("captain_score", 0), reverse=True)[:top_n]

        captains = []
        for i, p in enumerate(sorted_players, 1):
            captains.append({
                "rank": i,
                "player": p,
                "captain_score": p.get("captain_score"),
                "rationale": f"High attacking form ({p.get('form_score')} pts/GW), reliable minutes ({p.get('rotation_risk')} risk), and upcoming fixture FDR of {p.get('upcoming_fdr')}."
            })
        return captains

    @staticmethod
    def get_differentials(processed_players: List[Dict[str, Any]], max_ownership: float = 10.0, top_n: int = 10) -> List[Dict[str, Any]]:
        differentials = [
            p for p in processed_players 
            if p.get("selected_by_percent", 100.0) < max_ownership and p.get("minutes", 0) > 90
        ]
        sorted_diffs = sorted(differentials, key=lambda x: x.get("transfer_score", 0), reverse=True)[:top_n]
        return sorted_diffs

    @staticmethod
    def compare_players(p1: Dict[str, Any], p2: Dict[str, Any]) -> Dict[str, Any]:
        p1_score = 0
        p2_score = 0

        # Calculate 3-GW Upcoming FDR
        p1_fx = p1.get("upcoming_fixtures", [])
        p2_fx = p2.get("upcoming_fixtures", [])
        
        p1_fdr_3 = round(float(np.mean([f.get("difficulty", 3) for f in p1_fx[:3]])), 2) if p1_fx else 3.0
        p2_fdr_3 = round(float(np.mean([f.get("difficulty", 3) for f in p2_fx[:3]])), 2) if p2_fx else 3.0

        p1["fdr_3_gw"] = p1_fdr_3
        p2["fdr_3_gw"] = p2_fdr_3

        metrics = [
            ("total_points", "Total Points", True),
            ("expected_points", "xP (Expected Pts Next GW)", True),
            ("form_score", "Recent Form (Pts/GW)", True),
            ("fdr_3_gw", "Next 3 GWs Avg FDR (Lower is better)", False),
            ("upcoming_fdr", "Next 5 GWs Avg FDR (Lower is better)", False),
            ("value_score", "Value Score (Points/£)", True),
            ("transfer_score", "Transfer Rating Score", True),
            ("captain_score", "Captain Score", True),
            ("ict_per_90", "ICT Index / 90 Mins", True),
            ("returns_per_90", "Goal Involvements / 90 Mins", True),
            ("net_transfers_gw", "GW Net Transfer Momentum", True),
            ("selected_by_percent", "Ownership %", True)
        ]

        comparison_matrix = []
        p1_advantages = []
        p2_advantages = []

        for key, label, higher_is_better in metrics:
            v1 = p1.get(key, 0)
            v2 = p2.get(key, 0)

            if higher_is_better:
                winner = "player1" if v1 > v2 else ("player2" if v2 > v1 else "tie")
            else:
                winner = "player1" if v1 < v2 else ("player2" if v2 < v1 else "tie")

            if winner == "player1":
                p1_score += 1
                p1_advantages.append(f"{label}: {v1} vs {v2}")
            elif winner == "player2":
                p2_score += 1
                p2_advantages.append(f"{label}: {v2} vs {v1}")

            comparison_matrix.append({
                "metric": label,
                "player1_val": v1,
                "player2_val": v2,
                "winner": winner
            })

        verdict_player = p1 if p1_score >= p2_score else p2
        other_player = p2 if p1_score >= p2_score else p1
        verdict_name = verdict_player.get("web_name", "Player")

        # Build smart verdict explanation including upcoming fixture difficulty and xP
        reasons = []
        v_fdr3 = verdict_player.get("fdr_3_gw", 3.0)
        o_fdr3 = other_player.get("fdr_3_gw", 3.0)
        if v_fdr3 < o_fdr3:
            reasons.append(f"an easier 3-GW fixture run (Avg FDR {v_fdr3} vs {o_fdr3})")
        elif v_fdr3 == o_fdr3:
            reasons.append(f"matching 3-GW fixture FDR ({v_fdr3})")

        v_xp = verdict_player.get("expected_points", 0.0)
        o_xp = other_player.get("expected_points", 0.0)
        if v_xp > o_xp:
            reasons.append(f"higher expected returns ({v_xp} vs {o_xp} xP)")

        v_form = verdict_player.get("form_score", 0.0)
        o_form = other_player.get("form_score", 0.0)
        if v_form > o_form:
            reasons.append(f"stronger form ({v_form} vs {o_form} pts/GW)")

        reason_str = ", ".join(reasons) if reasons else "superior underlying statistical metrics"
        verdict_text = f"{verdict_name} is the recommended pick ({max(p1_score, p2_score)}/{len(metrics)} categories won), powered by {reason_str}."

        return {
            "player1": p1,
            "player2": p2,
            "winner_player": verdict_player,
            "matrix": comparison_matrix,
            "winner_id": verdict_player.get("id"),
            "p1_advantages": p1_advantages,
            "p2_advantages": p2_advantages,
            "p1_fdr_3": p1_fdr_3,
            "p2_fdr_3": p2_fdr_3,
            "verdict": verdict_text
        }

    @staticmethod
    def analyze_my_team(manager_profile: Dict[str, Any], manager_picks_data: Dict[str, Any], processed_players: List[Dict[str, Any]]) -> Dict[str, Any]:
        players_by_id = {p["id"]: p for p in processed_players}
        
        # Manager info
        m_raw = manager_profile.get("raw_json", {}) if isinstance(manager_profile, dict) else {}
        first_name = m_raw.get("player_first_name", "")
        last_name = m_raw.get("player_last_name", "")
        manager_name = f"{first_name} {last_name}".strip() or m_raw.get("name", "FPL Manager")
        team_name = m_raw.get("name", "FPL Squad")
        overall_rank = m_raw.get("summary_overall_rank", 0)
        overall_points = m_raw.get("summary_overall_points", 0)

        picks_raw = manager_picks_data.get("data", {}) if isinstance(manager_picks_data, dict) else {}
        if not picks_raw:
            picks_raw = manager_picks_data.get("raw_json", {}) if isinstance(manager_picks_data, dict) else {}

        entry_hist = picks_raw.get("entry_history", {})
        bank = entry_hist.get("bank", 0) / 10.0
        value = entry_hist.get("value", 1000) / 10.0

        starting_raw = picks_raw.get("starting_xi", [])
        bench_raw = picks_raw.get("bench", [])
        all_picks_raw = picks_raw.get("picks", []) or picks_raw.get("all_picks", [])

        # Enrich starting 11 & bench
        squad_players = []
        starting_xi = []
        bench = []

        for p_pick in all_picks_raw:
            p_id = p_pick.get("element")
            pos = p_pick.get("position", 1)
            is_cap = p_pick.get("is_captain", False)
            is_vc = p_pick.get("is_vice_captain", False)
            multiplier = p_pick.get("multiplier", 1)

            base_p = players_by_id.get(p_id, {})
            enriched = {
                **base_p,
                "pick_position": pos,
                "is_captain": is_cap,
                "is_vice_captain": is_vc,
                "multiplier": multiplier
            }
            squad_players.append(enriched)
            if pos <= 11:
                starting_xi.append(enriched)
            else:
                bench.append(enriched)

        # Fallback if starting_xi was empty
        if not starting_xi and starting_raw:
            for p_pick in starting_raw:
                p_id = p_pick.get("element")
                base_p = players_by_id.get(p_id, {})
                enriched = {**base_p, "is_captain": p_pick.get("is_captain", False), "is_vice_captain": p_pick.get("is_vice_captain", False)}
                starting_xi.append(enriched)

        if not bench and bench_raw:
            for p_pick in bench_raw:
                p_id = p_pick.get("element")
                base_p = players_by_id.get(p_id, {})
                enriched = {**base_p, "is_captain": False, "is_vice_captain": False}
                bench.append(enriched)

        # 1. Captain & Vice Captain AI Recommendation
        all_squad_sorted_by_captain = sorted(squad_players, key=lambda x: x.get("captain_score", 0), reverse=True)
        recommended_c = all_squad_sorted_by_captain[0] if all_squad_sorted_by_captain else None
        recommended_vc = all_squad_sorted_by_captain[1] if len(all_squad_sorted_by_captain) > 1 else None

        current_c = next((p for p in squad_players if p.get("is_captain")), None)
        current_vc = next((p for p in squad_players if p.get("is_vice_captain")), None)

        is_c_optimal = bool(current_c and recommended_c and current_c.get("id") == recommended_c.get("id"))

        if is_c_optimal:
            c_advice = f"Your armband selection ({current_c.get('web_name')}) is optimal! Highest Captain Score in your squad ({current_c.get('captain_score')} pts)."
        elif current_c and recommended_c:
            c_advice = f"Consider giving (C) to {recommended_c.get('web_name')} (Captain Score {recommended_c.get('captain_score')}) over current choice {current_c.get('web_name')} ({current_c.get('captain_score')})."
        else:
            c_advice = "Set your armband to the highest form player with easy fixtures."

        # 2. Bench & Lineup Optimizer
        recommended_swaps = []
        for b_p in bench:
            if b_p.get("position_name") == "GKP":
                continue
            for s_p in starting_xi:
                if s_p.get("position_name") == b_p.get("position_name"):
                    b_xp = b_p.get("expected_points", 0.0)
                    s_xp = s_p.get("expected_points", 0.0)
                    if b_xp > s_xp + 0.8:
                        recommended_swaps.append({
                            "bench_player": b_p,
                            "starting_player": s_p,
                            "gain_xp": round(b_xp - s_xp, 1),
                            "reason": f"Start {b_p.get('web_name')} ({b_xp} xP) over {s_p.get('web_name')} ({s_xp} xP) due to easier fixture & better form."
                        })

        # 3. Buy & Sell Transfer Recommender
        squad_ids = {p.get("id") for p in squad_players}
        weakest_player = min(squad_players, key=lambda x: x.get("transfer_score", 100)) if squad_players else None

        recommended_transfer = None
        if weakest_player:
            weak_pos = weakest_player.get("position_name")
            weak_price = weakest_player.get("price", 0.0)
            max_budget = round(weak_price + bank, 1)

            candidates = [
                p for p in processed_players
                if p.get("id") not in squad_ids
                and p.get("position_name") == weak_pos
                and p.get("price", 0.0) <= max_budget
            ]
            candidates_sorted = sorted(candidates, key=lambda x: x.get("transfer_score", 0), reverse=True)
            top_buy = candidates_sorted[0] if candidates_sorted else None

            if top_buy:
                gain = round(top_buy.get("transfer_score", 0) - weakest_player.get("transfer_score", 0), 1)
                recommended_transfer = {
                    "sell_player": weakest_player,
                    "buy_player": top_buy,
                    "max_budget": max_budget,
                    "transfer_score_gain": gain,
                    "reason": f"Sell {weakest_player.get('web_name')} (£{weak_price}M, Rating {weakest_player.get('transfer_score')}) ➔ Buy {top_buy.get('web_name')} (£{top_buy.get('price')}M, Rating {top_buy.get('transfer_score')}). Net +{gain} rating boost!"
                }

        gw_fetched = picks_raw.get("gameweek_fetched", 1)

        return {
            "manager_info": {
                "id": m_raw.get("id"),
                "manager_name": manager_name,
                "team_name": team_name,
                "overall_rank": overall_rank,
                "overall_points": overall_points,
                "bank": bank,
                "team_value": value,
                "gameweek_fetched": gw_fetched
            },
            "starting_xi": starting_xi,
            "bench": bench,
            "ai_advice": {
                "current_captain": current_c,
                "recommended_captain": recommended_c,
                "recommended_vice_captain": recommended_vc,
                "is_captain_optimal": is_c_optimal,
                "captain_advice_text": c_advice,
                "lineup_swaps": recommended_swaps,
                "transfer_recommendation": recommended_transfer
            }
        }

    @staticmethod
    def get_player_action_verdict(player: Dict[str, Any]) -> Dict[str, Any]:
        form = player.get("form_score", 0.0)
        fdr = player.get("upcoming_fdr", 3.0)
        mins_ratio = player.get("mins_ratio", 0.0)
        transfer_score = player.get("transfer_score", 0.0)
        rot_risk = player.get("rotation_risk", "Medium")

        if transfer_score >= 60.0 and fdr <= 3.2 and rot_risk != "High":
            verdict = "BUY"
            color = "green"
            headline = f"Strong Buy 🟢 ({transfer_score} Rating)"
        elif transfer_score >= 42.0 and rot_risk != "High":
            verdict = "HOLD"
            color = "yellow"
            headline = f"Hold / Watch 🟡 ({transfer_score} Rating)"
        else:
            verdict = "AVOID"
            color = "red"
            headline = f"Avoid / Sell 🔴 ({transfer_score} Rating)"

        ict_90 = player.get("ict_per_90", 0.0)
        threat_stars = int(np.clip(round((ict_90 / 2.5) * 5), 1, 5))

        reasons = []
        if form >= 5.0:
            reasons.append(f"🔥 Outstanding form ({form} pts/GW)")
        elif form <= 2.0:
            reasons.append(f"⚠️ Poor recent form ({form} pts/GW)")

        if fdr <= 2.6:
            reasons.append(f"🟢 Favorable 5-GW fixture run (Avg FDR {fdr})")
        elif fdr >= 3.8:
            reasons.append(f"🔴 Tough upcoming fixtures (Avg FDR {fdr})")

        if rot_risk == "Low":
            reasons.append("🟢 Excellent minutes security (Low rotation risk)")
        elif rot_risk == "High":
            reasons.append("🔴 High rotation risk")

        if not reasons:
            reasons.append("Moderate overall statistical performance")

        return {
            "verdict": verdict,
            "color": color,
            "headline": headline,
            "threat_stars": threat_stars,
            "minutes_security": "Excellent" if rot_risk == "Low" else ("Moderate" if rot_risk == "Medium" else "Low"),
            "fixture_quality": "Excellent" if fdr <= 2.6 else ("Good" if fdr <= 3.2 else "Tough"),
            "reasons": reasons
        }

    @staticmethod
    def generate_optimal_squad(
        processed_players: List[Dict[str, Any]], 
        budget: float = 100.0, 
        formation: str = "3-4-3", 
        locked_ids: List[int] = [], 
        excluded_ids: List[int] = []
    ) -> Dict[str, Any]:
        formations_map = {
            "3-4-3": (3, 4, 3),
            "3-5-2": (3, 5, 2),
            "4-3-3": (4, 3, 3),
            "4-4-2": (4, 4, 2),
            "5-3-2": (5, 3, 2)
        }
        n_def, n_mid, n_fwd = formations_map.get(formation, (3, 4, 3))
        
        excl_set = set(excluded_ids)
        available = [p for p in processed_players if p["id"] not in excl_set]
        
        gkp_pool = sorted([p for p in available if p["position_name"] == "GKP"], key=lambda x: x["transfer_score"], reverse=True)
        def_pool = sorted([p for p in available if p["position_name"] == "DEF"], key=lambda x: x["transfer_score"], reverse=True)
        mid_pool = sorted([p for p in available if p["position_name"] == "MID"], key=lambda x: x["transfer_score"], reverse=True)
        fwd_pool = sorted([p for p in available if p["position_name"] == "FWD"], key=lambda x: x["transfer_score"], reverse=True)

        starting_gkp = gkp_pool[0] if gkp_pool else None
        bench_gkp = gkp_pool[1] if len(gkp_pool) > 1 else gkp_pool[0]

        starting_def = def_pool[:n_def]
        bench_def = def_pool[n_def:5]

        starting_mid = mid_pool[:n_mid]
        bench_mid = mid_pool[n_mid:5]

        starting_fwd = fwd_pool[:n_fwd]
        bench_fwd = fwd_pool[n_fwd:3]

        starting_xi = [starting_gkp] + starting_def + starting_mid + starting_fwd
        starting_xi = [p for p in starting_xi if p is not None]
        bench = [bench_gkp] + bench_def + bench_mid + bench_fwd
        bench = [p for p in bench if p is not None]

        squad_15 = starting_xi + bench
        total_cost = round(sum(p.get("price", 0.0) for p in squad_15), 1)

        sorted_by_captain = sorted(starting_xi, key=lambda x: x.get("captain_score", 0), reverse=True)
        captain = sorted_by_captain[0] if sorted_by_captain else None
        vice_captain = sorted_by_captain[1] if len(sorted_by_captain) > 1 else None

        differentials = sorted([p for p in squad_15 if p.get("selected_by_percent", 100) < 10.0], key=lambda x: x.get("transfer_score", 0), reverse=True)
        differential_pick = differentials[0] if differentials else None

        total_xp_5gw = round(sum(p.get("expected_points", 0.0) * 5 for p in starting_xi) + (captain.get("expected_points", 0.0) * 5 if captain else 0), 1)

        avg_transfer_score = np.mean([p.get("transfer_score", 0) for p in starting_xi]) if starting_xi else 75.0
        team_score = int(np.clip(round(avg_transfer_score * 1.05), 50, 99))

        selection_reasons = []
        for p in starting_xi:
            reasons = []
            if p.get("form_score", 0) >= 5.0:
                reasons.append(f"Outstanding form ({p.get('form_score')} pts/GW)")
            if p.get("upcoming_fdr", 3.0) <= 2.6:
                reasons.append(f"Easy upcoming fixture run (Avg FDR {p.get('upcoming_fdr')})")
            if p.get("value_score", 0) >= 8.0:
                reasons.append(f"High points-per-million value ({p.get('value_score')})")
            if p.get("set_piece_role") and p.get("set_piece_role") != "None":
                reasons.append(f"Takes set-pieces ({p.get('set_piece_role')})")
            if not reasons:
                reasons.append("Top composite rating in position")

            selection_reasons.append({
                "player": p,
                "primary_reason": reasons[0],
                "all_reasons": reasons
            })

        return {
            "formation": formation,
            "budget_used": total_cost,
            "max_budget": budget,
            "expected_points_5gw": total_xp_5gw,
            "team_score": team_score,
            "starting_xi": starting_xi,
            "bench": bench,
            "captain": captain,
            "vice_captain": vice_captain,
            "differential_pick": differential_pick,
            "selection_reasons": selection_reasons
        }


