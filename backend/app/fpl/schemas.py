from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict

class BaseResponseEnvelope(BaseModel):
    status_code: int
    response_time_ms: float
    endpoint: str
    url: str
    requires_auth: bool
    accessible: bool
    raw_json: Optional[Any] = None
    data: Optional[Any] = None
    error: Optional[str] = None

class PlayerSchema(BaseModel):
    id: int
    first_name: Optional[str] = None
    second_name: Optional[str] = None
    web_name: str
    team: Optional[int] = None
    team_name: Optional[str] = None
    element_type: int
    position_name: Optional[str] = None
    now_cost: Optional[int] = None
    total_points: Optional[int] = None
    form: Optional[str] = None
    points_per_game: Optional[str] = None
    selected_by_percent: Optional[str] = None
    minutes: Optional[int] = None
    goals_scored: Optional[int] = None
    assists: Optional[int] = None
    clean_sheets: Optional[int] = None
    goals_conceded: Optional[int] = None
    own_goals: Optional[int] = None
    penalties_saved: Optional[int] = None
    penalties_missed: Optional[int] = None
    yellow_cards: Optional[int] = None
    red_cards: Optional[int] = None
    saves: Optional[int] = None
    bonus: Optional[int] = None
    bps: Optional[int] = None
    influence: Optional[str] = None
    creativity: Optional[str] = None
    threat: Optional[str] = None
    ict_index: Optional[str] = None
    starts: Optional[int] = None
    expected_goals: Optional[str] = None
    expected_assists: Optional[str] = None
    expected_goal_involvements: Optional[str] = None
    expected_goals_conceded: Optional[str] = None

    model_config = ConfigDict(extra="ignore")

class TeamSchema(BaseModel):
    id: int
    name: str
    short_name: str
    code: Optional[int] = None
    strength: Optional[int] = None
    strength_overall_home: Optional[int] = None
    strength_overall_away: Optional[int] = None
    strength_attack_home: Optional[int] = None
    strength_attack_away: Optional[int] = None
    strength_defence_home: Optional[int] = None
    strength_defence_away: Optional[int] = None

    model_config = ConfigDict(extra="ignore")

class GameweekSchema(BaseModel):
    id: int
    name: str
    deadline_time: Optional[str] = None
    finished: bool
    data_checked: bool
    is_current: bool
    is_next: bool
    is_previous: bool

    model_config = ConfigDict(extra="ignore")

class FixtureSchema(BaseModel):
    id: int
    event: Optional[int] = None
    team_h: int
    team_a: int
    team_h_name: Optional[str] = None
    team_a_name: Optional[str] = None
    team_h_score: Optional[int] = None
    team_a_score: Optional[int] = None
    finished: bool
    kickoff_time: Optional[str] = None
    team_h_difficulty: Optional[int] = None
    team_a_difficulty: Optional[int] = None

    model_config = ConfigDict(extra="ignore")

class ManagerSchema(BaseModel):
    id: int
    player_first_name: Optional[str] = None
    player_last_name: Optional[str] = None
    player_region_name: Optional[str] = None
    player_region_iso_code_short: Optional[str] = None
    summary_overall_points: Optional[int] = None
    summary_overall_rank: Optional[int] = None
    summary_event_points: Optional[int] = None
    summary_event_rank: Optional[int] = None
    current_event: Optional[int] = None
    last_deadline_bank: Optional[int] = None
    last_deadline_value: Optional[int] = None
    last_deadline_total_transfers: Optional[int] = None

    model_config = ConfigDict(extra="ignore")

class PickSchema(BaseModel):
    element: int
    player_web_name: Optional[str] = None
    team_name: Optional[str] = None
    position: int
    multiplier: int
    is_captain: bool
    is_vice_captain: bool
    element_type: Optional[int] = None
    position_name: Optional[str] = None
    selling_price: Optional[int] = None
    purchase_price: Optional[int] = None

class ManagerPicksResponseSchema(BaseModel):
    starting_xi: List[PickSchema] = []
    bench: List[PickSchema] = []
    captain: Optional[PickSchema] = None
    vice_captain: Optional[PickSchema] = None
    active_chip: Optional[str] = None

class TokenAuthRequestSchema(BaseModel):
    access_token: Optional[str] = None
    manager_id: Optional[int] = None
    session_id: Optional[str] = None


