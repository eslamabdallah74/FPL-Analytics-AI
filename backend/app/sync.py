import asyncio
import logging
from sqlalchemy.orm import Session
from app.database.database import engine, init_db, SessionLocal
from app.database.models import Team, Player, Gameweek, Fixture
from app.fpl.client import FPLClient

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

async def run_sync():
    logger.info("Initializing database schema...")
    init_db()

    client = FPLClient()
    db: Session = SessionLocal()

    try:
        logger.info("Fetching bootstrap-static from FPL...")
        bs_res = await client.get_bootstrap_static()
        if not bs_res.get("accessible") or not bs_res.get("raw_json"):
            logger.error(f"Failed to fetch bootstrap-static: {bs_res.get('error')}")
            return

        raw_bs = bs_res["raw_json"]

        # 1. Upsert Teams
        teams_data = raw_bs.get("teams", [])
        logger.info(f"Synchronizing {len(teams_data)} teams...")
        for t in teams_data:
            existing_team = db.query(Team).filter(Team.id == t["id"]).first()
            if existing_team:
                existing_team.name = t.get("name")
                existing_team.short_name = t.get("short_name")
                existing_team.code = t.get("code")
                existing_team.strength = t.get("strength")
                existing_team.strength_overall_home = t.get("strength_overall_home")
                existing_team.strength_overall_away = t.get("strength_overall_away")
                existing_team.strength_attack_home = t.get("strength_attack_home")
                existing_team.strength_attack_away = t.get("strength_attack_away")
                existing_team.strength_defence_home = t.get("strength_defence_home")
                existing_team.strength_defence_away = t.get("strength_defence_away")
            else:
                db.add(Team(
                    id=t["id"],
                    name=t.get("name"),
                    short_name=t.get("short_name"),
                    code=t.get("code"),
                    strength=t.get("strength"),
                    strength_overall_home=t.get("strength_overall_home"),
                    strength_overall_away=t.get("strength_overall_away"),
                    strength_attack_home=t.get("strength_attack_home"),
                    strength_attack_away=t.get("strength_attack_away"),
                    strength_defence_home=t.get("strength_defence_home"),
                    strength_defence_away=t.get("strength_defence_away")
                ))
        db.commit()

        # 2. Upsert Players
        players_data = raw_bs.get("elements", [])
        logger.info(f"Synchronizing {len(players_data)} players...")
        for p in players_data:
            existing_player = db.query(Player).filter(Player.id == p["id"]).first()
            player_dict = {
                "id": p["id"],
                "first_name": p.get("first_name"),
                "second_name": p.get("second_name"),
                "web_name": p.get("web_name", ""),
                "team_id": p.get("team"),
                "element_type": p.get("element_type", 1),
                "now_cost": p.get("now_cost"),
                "total_points": p.get("total_points"),
                "form": str(p.get("form")),
                "points_per_game": str(p.get("points_per_game")),
                "selected_by_percent": str(p.get("selected_by_percent")),
                "minutes": p.get("minutes"),
                "goals_scored": p.get("goals_scored"),
                "assists": p.get("assists"),
                "clean_sheets": p.get("clean_sheets"),
                "goals_conceded": p.get("goals_conceded"),
                "own_goals": p.get("own_goals"),
                "penalties_saved": p.get("penalties_saved"),
                "penalties_missed": p.get("penalties_missed"),
                "yellow_cards": p.get("yellow_cards"),
                "red_cards": p.get("red_cards"),
                "saves": p.get("saves"),
                "bonus": p.get("bonus"),
                "bps": p.get("bps"),
                "influence": str(p.get("influence")),
                "creativity": str(p.get("creativity")),
                "threat": str(p.get("threat")),
                "ict_index": str(p.get("ict_index")),
                "starts": p.get("starts"),
                "expected_goals": str(p.get("expected_goals")),
                "expected_assists": str(p.get("expected_assists")),
                "expected_goal_involvements": str(p.get("expected_goal_involvements")),
                "expected_goals_conceded": str(p.get("expected_goals_conceded"))
            }
            if existing_player:
                for k, v in player_dict.items():
                    setattr(existing_player, k, v)
            else:
                db.add(Player(**player_dict))
        db.commit()

        # 3. Upsert Gameweeks
        gw_data = raw_bs.get("events", [])
        logger.info(f"Synchronizing {len(gw_data)} gameweeks...")
        for g in gw_data:
            existing_gw = db.query(Gameweek).filter(Gameweek.id == g["id"]).first()
            if existing_gw:
                existing_gw.name = g.get("name")
                existing_gw.deadline_time = g.get("deadline_time")
                existing_gw.finished = g.get("finished", False)
                existing_gw.data_checked = g.get("data_checked", False)
                existing_gw.is_current = g.get("is_current", False)
                existing_gw.is_next = g.get("is_next", False)
                existing_gw.is_previous = g.get("is_previous", False)
            else:
                db.add(Gameweek(
                    id=g["id"],
                    name=g.get("name"),
                    deadline_time=g.get("deadline_time"),
                    finished=g.get("finished", False),
                    data_checked=g.get("data_checked", False),
                    is_current=g.get("is_current", False),
                    is_next=g.get("is_next", False),
                    is_previous=g.get("is_previous", False)
                ))
        db.commit()

        # 4. Upsert Fixtures
        logger.info("Fetching fixtures from FPL...")
        fix_res = await client.get_fixtures()
        if fix_res.get("accessible") and fix_res.get("raw_json"):
            fixtures_data = fix_res["raw_json"]
            logger.info(f"Synchronizing {len(fixtures_data)} fixtures...")
            for f in fixtures_data:
                existing_fix = db.query(Fixture).filter(Fixture.id == f["id"]).first()
                if existing_fix:
                    existing_fix.event_id = f.get("event")
                    existing_fix.team_h = f.get("team_h")
                    existing_fix.team_a = f.get("team_a")
                    existing_fix.team_h_score = f.get("team_h_score")
                    existing_fix.team_a_score = f.get("team_a_score")
                    existing_fix.finished = f.get("finished", False)
                    existing_fix.difficulty_h = f.get("team_h_difficulty")
                    existing_fix.difficulty_a = f.get("team_a_difficulty")
                    existing_fix.kickoff_time = f.get("kickoff_time")
                else:
                    db.add(Fixture(
                        id=f["id"],
                        event_id=f.get("event"),
                        team_h=f.get("team_h"),
                        team_a=f.get("team_a"),
                        team_h_score=f.get("team_h_score"),
                        team_a_score=f.get("team_a_score"),
                        finished=f.get("finished", False),
                        difficulty_h=f.get("team_h_difficulty"),
                        difficulty_a=f.get("team_a_difficulty"),
                        kickoff_time=f.get("kickoff_time")
                    ))
            db.commit()

        logger.info("FPL Data Synchronization Completed Successfully!")

    except Exception as e:
        logger.error(f"Error during synchronization: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(run_sync())
