// FPL Live API Service with local Vite proxy, Vercel serverless function & CORS proxy fallbacks

const PROXY_ALLORIGINS = 'https://api.allorigins.win/raw?url=';
const PROXY_CORSPROXY = 'https://corsproxy.io/?';
const PROXY_CODETABS = 'https://api.codetabs.com/v1/proxy?quest=';
const FPL_BASE = 'https://fantasy.premierleague.com/api';

async function fetchWithFallback(endpoint: string): Promise<any> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // 1. Try local Vite dev server proxy (/api/fpl/...)
  try {
    const res = await fetch(`/api/fpl${cleanEndpoint}`);
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object') return data;
    }
  } catch (e) {
    // Local Vite proxy failed or not in dev mode
  }

  // 2. Try Vercel Serverless API (/api/fpl?endpoint=...)
  try {
    const res = await fetch(`/api/fpl?endpoint=${encodeURIComponent(cleanEndpoint)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object' && !data.error) return data;
    }
  } catch (e) {
    // Vercel serverless handler failed
  }

  const targetUrl = `${FPL_BASE}${cleanEndpoint}`;

  // 3. Fallback to AllOrigins CORS proxy
  try {
    const res = await fetch(`${PROXY_ALLORIGINS}${encodeURIComponent(targetUrl)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object') return data;
    }
  } catch (e) {
    // AllOrigins proxy failed
  }

  // 4. Fallback to CorsProxy.io
  try {
    const res = await fetch(`${PROXY_CORSPROXY}${encodeURIComponent(targetUrl)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object') return data;
    }
  } catch (e) {
    // CorsProxy failed
  }

  // 5. Fallback to CodeTabs proxy
  try {
    const res = await fetch(`${PROXY_CODETABS}${encodeURIComponent(targetUrl)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object') return data;
    }
  } catch (e) {
    // CodeTabs proxy failed
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
