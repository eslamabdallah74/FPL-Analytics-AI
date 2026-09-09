import type { 
  DashboardResponse, 
  Player, 
  FixturePlannerResponse, 
  TransferTarget, 
  CaptainCandidate, 
  ComparisonResult,
  MyTeamResponse,
  PlayerActionVerdict,
  OptimalSquadRequest,
  OptimalSquadResponse 
} from '../types';

import { 
  getBootstrapStatic, 
  getFixtures, 
  getManager, 
  getManagerPicks, 
  getPlayerSummary 
} from './fplApi';

import {
  processPlayers,
  getFixturePlanner,
  getTransferTargets,
  getCaptainRankings,
  getDifferentials,
  comparePlayers as engineComparePlayers,
  analyzeMyTeam as engineAnalyzeMyTeam,
  getPlayerActionVerdict as engineGetPlayerActionVerdict,
  generateOptimalSquad as engineGenerateOptimalSquad
} from './analyticsEngine';

// In-memory data cache
let cachedBootstrap: any = null;
let cachedFixturesData: any[] = null as any;
let cachedProcessedPlayers: Player[] = null as any;
let cachedCurrentGw: number = 1;

async function ensureDataLoaded(): Promise<{ players: Player[]; teams: any[]; fixtures: any[]; currentGw: number }> {
  if (cachedProcessedPlayers && cachedBootstrap && cachedFixturesData) {
    return {
      players: cachedProcessedPlayers,
      teams: cachedBootstrap.teams,
      fixtures: cachedFixturesData,
      currentGw: cachedCurrentGw
    };
  }

  const [bootstrap, fixtures] = await Promise.all([
    getBootstrapStatic(),
    getFixtures()
  ]);

  cachedBootstrap = bootstrap;
  cachedFixturesData = fixtures;

  // Determine current active planning gameweek
  const events = bootstrap.events || [];
  const currentEvent = events.find((e: any) => e.is_current);
  const nextEvent = events.find((e: any) => e.is_next) || events.find((e: any) => !e.finished);

  let activeGw = 1;
  if (currentEvent && !currentEvent.finished) {
    activeGw = currentEvent.id;
  } else if (nextEvent) {
    activeGw = nextEvent.id;
  } else if (currentEvent) {
    activeGw = currentEvent.id;
  }

  cachedCurrentGw = activeGw;

  cachedProcessedPlayers = processPlayers(
    bootstrap.elements || [],
    bootstrap.teams || [],
    fixtures || [],
    cachedCurrentGw
  );

  return {
    players: cachedProcessedPlayers,
    teams: bootstrap.teams,
    fixtures,
    currentGw: cachedCurrentGw
  };
}

export async function fetchDashboard(): Promise<DashboardResponse> {
  const { players, teams, fixtures, currentGw } = await ensureDataLoaded();

  const validPlayers = players.filter((p) => p.minutes > 60);

  const topForm = [...validPlayers]
    .sort((a, b) => b.form_score - a.form_score)
    .slice(0, 8);

  const topValue = [...validPlayers]
    .sort((a, b) => b.value_score - a.value_score)
    .slice(0, 8);

  const transferTargets = getTransferTargets(players, 8);
  const captainCandidates = getCaptainRankings(players, 8);
  const differentials = getDifferentials(players, 10.0, 8);
  const plannerRes = getFixturePlanner(teams, fixtures, currentGw);

  return {
    current_gameweek: currentGw,
    total_players: players.length,
    top_form: topForm,
    top_value: topValue,
    transfer_targets: transferTargets,
    captain_candidates: captainCandidates,
    differentials,
    easy_fixture_runs: plannerRes.easy_runs
  };
}

export async function fetchMyTeam(managerId: number): Promise<MyTeamResponse> {
  const { players, currentGw } = await ensureDataLoaded();

  const [profile, picksRes] = await Promise.all([
    getManager(managerId),
    getManagerPicks(managerId, currentGw)
  ]);

  return engineAnalyzeMyTeam(profile, picksRes, players);
}

export async function fetchPlayers(params?: {
  position?: string;
  team_id?: number;
  max_price?: number;
  search?: string;
  sort_by?: string;
}): Promise<{ current_gameweek: number; total_results: number; players: Player[] }> {
  const { players, currentGw } = await ensureDataLoaded();

  let filtered = [...players];

  if (params?.position) {
    const posUpper = params.position.toUpperCase();
    filtered = filtered.filter((p) => p.position_name.toUpperCase() === posUpper);
  }

  if (params?.team_id) {
    filtered = filtered.filter((p) => p.team === params.team_id);
  }

  if (params?.max_price) {
    filtered = filtered.filter((p) => p.price <= (params.max_price as number));
  }

  if (params?.search) {
    const s = params.search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.web_name.toLowerCase().includes(s) ||
        p.first_name.toLowerCase().includes(s) ||
        p.second_name.toLowerCase().includes(s) ||
        p.team_name.toLowerCase().includes(s)
    );
  }

  const sortBy = params?.sort_by || 'transfer_score';
  filtered.sort((a: any, b: any) => (b[sortBy] ?? 0) - (a[sortBy] ?? 0));

  return {
    current_gameweek: currentGw,
    total_results: filtered.length,
    players: filtered
  };
}

export async function fetchPlayerDeepDive(id: number): Promise<{
  player: Player;
  action_verdict?: PlayerActionVerdict;
  history: any[];
  upcoming_fixtures: any[];
}> {
  const { players } = await ensureDataLoaded();
  const player = players.find((p) => p.id === id);
  if (!player) throw new Error(`Player ID ${id} not found`);

  let history: any[] = [];
  let upcomingFixtures: any[] = player.upcoming_fixtures || [];

  try {
    const summary = await getPlayerSummary(id);
    if (summary && summary.history) {
      history = summary.history;
    }
    if (summary && summary.fixtures) {
      upcomingFixtures = summary.fixtures;
    }
  } catch (e) {
    // If summary API fetch fails, proceed with base player data
  }

  const actionVerdict = engineGetPlayerActionVerdict(player);

  return {
    player,
    action_verdict: actionVerdict,
    history,
    upcoming_fixtures: upcomingFixtures
  };
}

export async function fetchFixtures(): Promise<FixturePlannerResponse> {
  const { teams, fixtures, currentGw } = await ensureDataLoaded();
  return getFixturePlanner(teams, fixtures, currentGw);
}

export async function fetchTransfers(
  topN: number = 15
): Promise<{ current_gameweek: number; total_targets: number; targets: TransferTarget[] }> {
  const { players, currentGw } = await ensureDataLoaded();
  const targets = getTransferTargets(players, topN);
  return {
    current_gameweek: currentGw,
    total_targets: targets.length,
    targets
  };
}

export async function fetchCaptains(
  topN: number = 10
): Promise<{ current_gameweek: number; candidates: CaptainCandidate[] }> {
  const { players, currentGw } = await ensureDataLoaded();
  const candidates = getCaptainRankings(players, topN);
  return {
    current_gameweek: currentGw,
    candidates
  };
}

export async function fetchDifferentials(
  maxOwnership: number = 10.0
): Promise<{ current_gameweek: number; max_ownership_filter: number; differentials: Player[] }> {
  const { players, currentGw } = await ensureDataLoaded();
  const diffs = getDifferentials(players, maxOwnership, 15);
  return {
    current_gameweek: currentGw,
    max_ownership_filter: maxOwnership,
    differentials: diffs
  };
}

export async function comparePlayers(p1Id: number, p2Id: number): Promise<ComparisonResult> {
  const { players } = await ensureDataLoaded();
  const p1 = players.find((p) => p.id === p1Id);
  const p2 = players.find((p) => p.id === p2Id);
  if (!p1 || !p2) throw new Error('One or both players not found for comparison');

  return engineComparePlayers(p1, p2);
}

export async function generateOptimalSquad(
  payload: OptimalSquadRequest
): Promise<OptimalSquadResponse> {
  const { players } = await ensureDataLoaded();
  return engineGenerateOptimalSquad(
    players,
    payload.budget ?? 100.0,
    payload.formation ?? '3-4-3',
    payload.locked_ids ?? [],
    payload.excluded_ids ?? []
  );
}
