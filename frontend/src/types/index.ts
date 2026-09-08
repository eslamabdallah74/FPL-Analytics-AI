export interface UpcomingFixture {
  event: number;
  opponent_id: number;
  opponent_name: string;
  opponent_short: string;
  opponent_code?: number;
  opponent_shirt_url?: string;
  opponent_badge_url?: string;
  is_home: boolean;
  difficulty: number;
}

export interface Player {
  id: number;
  web_name: string;
  first_name: string;
  second_name: string;
  team: number;
  team_name: string;
  team_short: string;
  element_type: number;
  position_name: string;
  price: number;
  total_points: number;
  form_score: number;
  value_score: number;
  consistency_score: number;
  rotation_risk: 'Low' | 'Medium' | 'High';
  upcoming_fdr: number;
  upcoming_fixtures: UpcomingFixture[];
  transfer_score: number;
  captain_score: number;
  selected_by_percent: number;
  goals_scored: number;
  assists: number;
  clean_sheets: number;
  bonus: number;
  ict_index: number;
  minutes: number;
  expected_points?: number;
  ict_per_90?: number;
  attacking_returns?: number;
  returns_per_90?: number;
  bonus_per_90?: number;
  net_transfers_gw?: number;
  set_piece_role?: string;
  photo_url?: string;
  photo_url_lg?: string;
  shirt_url?: string;
}

export interface TeamFixturePlanner {
  team_id: number;
  team_name: string;
  team_short: string;
  team_code?: number;
  shirt_url?: string;
  badge_url?: string;
  avg_fdr: number;
  fixtures: UpcomingFixture[];
}

export interface FixtureRunAlert {
  team_id: number;
  team_name: string;
  team_code?: number;
  shirt_url?: string;
  badge_url?: string;
  avg_fdr: number;
  reason: string;
}

export interface FixturePlannerResponse {
  current_gameweek: number;
  planner: TeamFixturePlanner[];
  easy_runs: FixtureRunAlert[];
  hard_runs: FixtureRunAlert[];
}

export interface TransferTarget {
  rank: number;
  player: Player;
  transfer_score: number;
  primary_reason: string;
  all_reasons: string[];
}

export interface CaptainCandidate {
  rank: number;
  player: Player;
  captain_score: number;
  rationale: string;
}

export interface ComparisonMatrixItem {
  metric: string;
  player1_val: number;
  player2_val: number;
  winner: 'player1' | 'player2' | 'tie';
}

export interface ComparisonResult {
  player1: Player;
  player2: Player;
  winner_player?: Player;
  matrix: ComparisonMatrixItem[];
  winner_id: number;
  verdict: string;
  p1_advantages?: string[];
  p2_advantages?: string[];
  p1_fdr_3?: number;
  p2_fdr_3?: number;
}

export interface DashboardResponse {
  current_gameweek: number;
  total_players: number;
  top_form: Player[];
  top_value: Player[];
  transfer_targets: TransferTarget[];
  captain_candidates: CaptainCandidate[];
  differentials: Player[];
  easy_fixture_runs: FixtureRunAlert[];
}

export interface EnrichedSquadPlayer extends Player {
  pick_position?: number;
  is_captain?: boolean;
  is_vice_captain?: boolean;
  multiplier?: number;
}

export interface LineupSwapRecommendation {
  bench_player: EnrichedSquadPlayer;
  starting_player: EnrichedSquadPlayer;
  gain_xp: number;
  reason: string;
}

export interface TransferRecommendation {
  sell_player: EnrichedSquadPlayer;
  buy_player: Player;
  max_budget: number;
  transfer_score_gain: number;
  reason: string;
}

export interface AIAdvice {
  current_captain?: EnrichedSquadPlayer;
  recommended_captain?: EnrichedSquadPlayer;
  recommended_vice_captain?: EnrichedSquadPlayer;
  is_captain_optimal: boolean;
  captain_advice_text: string;
  lineup_swaps: LineupSwapRecommendation[];
  transfer_recommendation?: TransferRecommendation;
}

export interface ManagerInfo {
  id: number;
  manager_name: string;
  team_name: string;
  overall_rank: number;
  overall_points: number;
  bank: number;
  team_value: number;
  gameweek_fetched?: number;
}

export interface MyTeamResponse {
  manager_info: ManagerInfo;
  starting_xi: EnrichedSquadPlayer[];
  bench: EnrichedSquadPlayer[];
  ai_advice: AIAdvice;
}

export interface PlayerActionVerdict {
  verdict: 'BUY' | 'HOLD' | 'AVOID';
  color: 'green' | 'yellow' | 'red';
  headline: string;
  threat_stars: number;
  minutes_security: string;
  fixture_quality: string;
  reasons: string[];
}

export interface PlayerSelectionReason {
  player: Player;
  primary_reason: string;
  all_reasons: string[];
}

export interface OptimalSquadRequest {
  budget?: number;
  formation?: string;
  locked_ids?: number[];
  excluded_ids?: number[];
}

export interface OptimalSquadResponse {
  formation: string;
  budget_used: number;
  max_budget: number;
  expected_points_5gw: number;
  team_score: number;
  starting_xi: Player[];
  bench: Player[];
  captain?: Player;
  vice_captain?: Player;
  differential_pick?: Player;
  selection_reasons: PlayerSelectionReason[];
}

