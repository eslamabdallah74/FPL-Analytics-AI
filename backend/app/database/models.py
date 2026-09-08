from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from app.database.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=True)
    fpl_user_id = Column(String, nullable=True, index=True)
    fpl_manager_id = Column(Integer, nullable=True)
    encrypted_access_token = Column(Text, nullable=True)
    encrypted_refresh_token = Column(Text, nullable=True)
    token_expires_at = Column(DateTime, nullable=True)
    is_connected = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class FPLManager(Base):
    __tablename__ = "fpl_managers"

    id = Column(Integer, primary_key=True, index=True)  # FPL entry ID
    player_first_name = Column(String, nullable=True)
    player_last_name = Column(String, nullable=True)
    player_region_name = Column(String, nullable=True)
    player_region_iso_code_short = Column(String, nullable=True)
    summary_overall_points = Column(Integer, nullable=True)
    summary_overall_rank = Column(Integer, nullable=True)
    summary_event_points = Column(Integer, nullable=True)
    summary_event_rank = Column(Integer, nullable=True)
    current_event = Column(Integer, nullable=True)
    last_deadline_bank = Column(Integer, nullable=True)
    last_deadline_value = Column(Integer, nullable=True)
    last_deadline_total_transfers = Column(Integer, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    short_name = Column(String, nullable=False)
    code = Column(Integer, nullable=True)
    strength = Column(Integer, nullable=True)
    strength_overall_home = Column(Integer, nullable=True)
    strength_overall_away = Column(Integer, nullable=True)
    strength_attack_home = Column(Integer, nullable=True)
    strength_attack_away = Column(Integer, nullable=True)
    strength_defence_home = Column(Integer, nullable=True)
    strength_defence_away = Column(Integer, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Player(Base):
    __tablename__ = "players"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, nullable=True)
    second_name = Column(String, nullable=True)
    web_name = Column(String, nullable=False)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=True)
    element_type = Column(Integer, nullable=False)  # 1: GKP, 2: DEF, 3: MID, 4: FWD
    now_cost = Column(Integer, nullable=True)
    total_points = Column(Integer, nullable=True)
    form = Column(String, nullable=True)
    points_per_game = Column(String, nullable=True)
    selected_by_percent = Column(String, nullable=True)
    minutes = Column(Integer, nullable=True)
    goals_scored = Column(Integer, nullable=True)
    assists = Column(Integer, nullable=True)
    clean_sheets = Column(Integer, nullable=True)
    goals_conceded = Column(Integer, nullable=True)
    own_goals = Column(Integer, nullable=True)
    penalties_saved = Column(Integer, nullable=True)
    penalties_missed = Column(Integer, nullable=True)
    yellow_cards = Column(Integer, nullable=True)
    red_cards = Column(Integer, nullable=True)
    saves = Column(Integer, nullable=True)
    bonus = Column(Integer, nullable=True)
    bps = Column(Integer, nullable=True)
    influence = Column(String, nullable=True)
    creativity = Column(String, nullable=True)
    threat = Column(String, nullable=True)
    ict_index = Column(String, nullable=True)
    starts = Column(Integer, nullable=True)
    expected_goals = Column(String, nullable=True)
    expected_assists = Column(String, nullable=True)
    expected_goal_involvements = Column(String, nullable=True)
    expected_goals_conceded = Column(String, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Gameweek(Base):
    __tablename__ = "gameweeks"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    deadline_time = Column(String, nullable=True)
    finished = Column(Boolean, default=False)
    data_checked = Column(Boolean, default=False)
    is_current = Column(Boolean, default=False)
    is_next = Column(Boolean, default=False)
    is_previous = Column(Boolean, default=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Fixture(Base):
    __tablename__ = "fixtures"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, nullable=True)
    team_h = Column(Integer, ForeignKey("teams.id"), nullable=False)
    team_a = Column(Integer, ForeignKey("teams.id"), nullable=False)
    team_h_score = Column(Integer, nullable=True)
    team_a_score = Column(Integer, nullable=True)
    finished = Column(Boolean, default=False)
    difficulty_h = Column(Integer, nullable=True)
    difficulty_a = Column(Integer, nullable=True)
    kickoff_time = Column(String, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class PlayerGameweekStats(Base):
    __tablename__ = "player_gameweek_stats"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    player_id = Column(Integer, ForeignKey("players.id"), nullable=False, index=True)
    gameweek_id = Column(Integer, ForeignKey("gameweeks.id"), nullable=False, index=True)
    minutes = Column(Integer, default=0)
    goals_scored = Column(Integer, default=0)
    assists = Column(Integer, default=0)
    clean_sheets = Column(Integer, default=0)
    goals_conceded = Column(Integer, default=0)
    own_goals = Column(Integer, default=0)
    penalties_saved = Column(Integer, default=0)
    penalties_missed = Column(Integer, default=0)
    yellow_cards = Column(Integer, default=0)
    red_cards = Column(Integer, default=0)
    saves = Column(Integer, default=0)
    bonus = Column(Integer, default=0)
    bps = Column(Integer, default=0)
    total_points = Column(Integer, default=0)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
