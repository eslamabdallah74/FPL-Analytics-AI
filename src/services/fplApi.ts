// FPL Live API Service with browser CORS proxy fallback

const FPL_BASE = 'https://fantasy.premierleague.com/api';
const PROXY_1 = 'https://corsproxy.io/?';
const PROXY_2 = 'https://api.allorigins.win/raw?url=';

async function fetchWithFallback(endpoint: string): Promise<any> {
  const targetUrl = `${FPL_BASE}${endpoint}`;
  
  // Try direct fetch first
  try {
    const res = await fetch(targetUrl);
    if (res.ok) return await res.json();
  } catch (e) {
    // Direct fetch blocked by CORS, fallback to CORS proxies
  }

  // Try proxy 1
  try {
    const res = await fetch(`${PROXY_1}${encodeURIComponent(targetUrl)}`);
    if (res.ok) return await res.json();
  } catch (e) {
    // Proxy 1 failed
  }

  // Try proxy 2
  try {
    const res = await fetch(`${PROXY_2}${encodeURIComponent(targetUrl)}`);
    if (res.ok) return await res.json();
  } catch (e) {
    // Proxy 2 failed
  }

  throw new Error(`Failed to fetch FPL data from endpoint ${endpoint}`);
}

export async function getBootstrapStatic(): Promise<any> {
  return await fetchWithFallback('/bootstrap-static/');
}

export async function getFixtures(): Promise<any> {
  return await fetchWithFallback('/fixtures/');
}

export async function getManager(managerId: number): Promise<any> {
  return await fetchWithFallback(`/entry/${managerId}/`);
}

export async function getManagerPicks(managerId: number, gameweek: number): Promise<{ picksData: any; gameweekFetched: number }> {
  let gwAttempt = gameweek;
  while (gwAttempt >= 1) {
    try {
      const data = await fetchWithFallback(`/entry/${managerId}/event/${gwAttempt}/picks/`);
      if (data && (data.picks || data.elements)) {
        return { picksData: data, gameweekFetched: gwAttempt };
      }
    } catch (e) {
      // 404 or inaccessible (future GW locked by FPL), attempt previous GW
    }
    gwAttempt--;
  }
  throw new Error(`Unable to fetch picks for FPL Manager ID ${managerId}`);
}

export async function getPlayerSummary(playerId: number): Promise<any> {
  return await fetchWithFallback(`/element-summary/${playerId}/`);
}
