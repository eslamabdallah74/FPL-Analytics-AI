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

const API_BASE = '/api/v1/analytics';

export async function fetchDashboard(): Promise<DashboardResponse> {
  const res = await fetch(`${API_BASE}/dashboard`);
  if (!res.ok) throw new Error('Failed to fetch dashboard analytics');
  return res.json();
}

export async function fetchMyTeam(managerId: number): Promise<MyTeamResponse> {
  const res = await fetch(`${API_BASE}/my-team/${managerId}`);
  if (!res.ok) throw new Error(`FPL Team ID ${managerId} not found or inaccessible`);
  return res.json();
}

export async function fetchPlayers(params?: {
  position?: string;
  team_id?: number;
  max_price?: number;
  search?: string;
  sort_by?: string;
}): Promise<{ current_gameweek: number; total_results: number; players: Player[] }> {
  const query = new URLSearchParams();
  if (params?.position) query.append('position', params.position);
  if (params?.team_id) query.append('team_id', params.team_id.toString());
  if (params?.max_price) query.append('max_price', params.max_price.toString());
  if (params?.search) query.append('search', params.search);
  if (params?.sort_by) query.append('sort_by', params.sort_by);

  const res = await fetch(`${API_BASE}/players?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch players list');
  return res.json();
}

export async function fetchPlayerDeepDive(id: number): Promise<{ player: Player; action_verdict?: PlayerActionVerdict; history: any[]; upcoming_fixtures: any[] }> {
  const res = await fetch(`${API_BASE}/players/${id}`);
  if (!res.ok) throw new Error('Failed to fetch player details');
  return res.json();
}

export async function fetchFixtures(): Promise<FixturePlannerResponse> {
  const res = await fetch(`${API_BASE}/fixtures`);
  if (!res.ok) throw new Error('Failed to fetch fixture planner');
  return res.json();
}

export async function fetchTransfers(topN: number = 15): Promise<{ current_gameweek: number; total_targets: number; targets: TransferTarget[] }> {
  const res = await fetch(`${API_BASE}/transfers?top_n=${topN}`);
  if (!res.ok) throw new Error('Failed to fetch transfer targets');
  return res.json();
}

export async function fetchCaptains(topN: number = 10): Promise<{ current_gameweek: number; candidates: CaptainCandidate[] }> {
  const res = await fetch(`${API_BASE}/captains?top_n=${topN}`);
  if (!res.ok) throw new Error('Failed to fetch captain candidates');
  return res.json();
}

export async function fetchDifferentials(maxOwnership: number = 10.0): Promise<{ current_gameweek: number; max_ownership_filter: number; differentials: Player[] }> {
  const res = await fetch(`${API_BASE}/differentials?max_ownership=${maxOwnership}`);
  if (!res.ok) throw new Error('Failed to fetch differentials');
  return res.json();
}

export async function comparePlayers(p1Id: number, p2Id: number): Promise<ComparisonResult> {
  const res = await fetch(`${API_BASE}/compare?p1_id=${p1Id}&p2_id=${p2Id}`);
  if (!res.ok) throw new Error('Failed to fetch player comparison');
  return res.json();
}

export async function generateOptimalSquad(payload: OptimalSquadRequest): Promise<OptimalSquadResponse> {
  const res = await fetch(`${API_BASE}/generate-squad`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to generate optimal squad');
  return res.json();
}

