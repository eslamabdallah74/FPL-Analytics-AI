import time
import logging
from typing import Any, Dict, Optional
import httpx
from app.config import settings

logger = logging.getLogger(__name__)

DEFAULT_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9",
}

PINGONE_OIDC_DISCOVERY_URL = "https://account.premierleague.com/as/.well-known/openid-configuration"

class FPLClient:
    def __init__(self, base_url: Optional[str] = None):
        self.base_url = (base_url or settings.FPL_BASE_URL).rstrip("/") + "/"

    async def _fetch(self, endpoint: str, headers_extra: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
        url = f"{self.base_url}{endpoint.lstrip('/')}"
        start_time = time.perf_counter()
        
        headers = dict(DEFAULT_HEADERS)
        if headers_extra:
            headers.update(headers_extra)

        async with httpx.AsyncClient(headers=headers, timeout=15.0, follow_redirects=True) as client:
            try:
                response = await client.get(url)
                duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
                
                is_auth_required = response.status_code in (401, 403)
                is_accessible = response.status_code == 200
                
                raw_json = None
                error_detail = None
                
                if response.status_code == 200:
                    try:
                        raw_json = response.json()
                    except Exception as exc:
                        error_detail = f"Failed to parse JSON: {str(exc)}"
                        is_accessible = False
                elif is_auth_required:
                    try:
                        err_json = response.json()
                        error_detail = f"Auth Failure ({response.status_code}): {err_json.get('detail', response.reason_phrase)}"
                    except Exception:
                        error_detail = f"Authentication Required (HTTP {response.status_code})"
                else:
                    error_detail = f"HTTP Error {response.status_code}: {response.reason_phrase}"
                
                return {
                    "status_code": response.status_code,
                    "response_time_ms": duration_ms,
                    "endpoint": f"/api/{endpoint.lstrip('/')}",
                    "url": str(response.url),
                    "requires_auth": is_auth_required,
                    "accessible": is_accessible,
                    "raw_json": raw_json if raw_json is not None else (err_json if 'err_json' in locals() else None),
                    "error": error_detail
                }
            except httpx.TimeoutException:
                duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
                logger.error(f"Timeout requesting {url}")
                return {
                    "status_code": 504,
                    "response_time_ms": duration_ms,
                    "endpoint": f"/api/{endpoint.lstrip('/')}",
                    "url": url,
                    "requires_auth": False,
                    "accessible": False,
                    "raw_json": None,
                    "error": "Connection timeout while reaching FPL API."
                }
            except httpx.RequestError as exc:
                duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
                logger.error(f"Network error requesting {url}: {exc}")
                return {
                    "status_code": 500,
                    "response_time_ms": duration_ms,
                    "endpoint": f"/api/{endpoint.lstrip('/')}",
                    "url": url,
                    "requires_auth": False,
                    "accessible": False,
                    "raw_json": None,
                    "error": f"Network failure: {str(exc)}"
                }

    async def get_bootstrap_static(self) -> Dict[str, Any]:
        return await self._fetch("bootstrap-static/")

    async def get_fixtures(self) -> Dict[str, Any]:
        return await self._fetch("fixtures/")

    async def get_gameweek_live(self, gameweek: int) -> Dict[str, Any]:
        return await self._fetch(f"event/{gameweek}/live/")

    async def get_manager(self, manager_id: int) -> Dict[str, Any]:
        return await self._fetch(f"entry/{manager_id}/")

    async def get_manager_history(self, manager_id: int) -> Dict[str, Any]:
        return await self._fetch(f"entry/{manager_id}/history/")

    async def get_manager_picks(self, manager_id: int, gameweek: int) -> Dict[str, Any]:
        return await self._fetch(f"entry/{manager_id}/event/{gameweek}/picks/")

    async def get_player_summary(self, player_id: int) -> Dict[str, Any]:
        return await self._fetch(f"element-summary/{player_id}/")

    async def get_leagues_classic(self, manager_id: int) -> Dict[str, Any]:
        res = await self.get_manager(manager_id)
        if res.get("accessible") and res.get("raw_json"):
            res["raw_json"] = res["raw_json"].get("leagues", {}).get("classic", [])
        return res

    async def get_leagues_h2h(self, manager_id: int) -> Dict[str, Any]:
        res = await self.get_manager(manager_id)
        if res.get("accessible") and res.get("raw_json"):
            res["raw_json"] = res["raw_json"].get("leagues", {}).get("h2h", [])
        return res

    async def get_manager_transfers(self, manager_id: int) -> Dict[str, Any]:
        return await self._fetch(f"entry/{manager_id}/transfers/")

    async def login_fpl(self, email: str, password: str) -> Dict[str, Any]:
        """Authenticates user with FPL using email and password via Premier League login endpoint."""
        login_url = "https://users.premierleague.com/accounts/login/"
        payload = {
            "login": email,
            "password": password,
            "app": "plfpl-web",
            "redirect_uri": "https://fantasy.premierleague.com/"
        }
        headers = dict(DEFAULT_HEADERS)
        headers["Content-Type"] = "application/x-www-form-urlencoded"

        async with httpx.AsyncClient(headers=headers, timeout=15.0, follow_redirects=False) as client:
            try:
                res = await client.post(login_url, data=payload)
                sessionid = None
                
                # Check cookies returned
                for name, val in res.cookies.items():
                    if name in ("pl_profile", "sessionid"):
                        sessionid = val
                        break

                if not sessionid:
                    # Check Set-Cookie headers directly
                    set_cookie = res.headers.get("set-cookie", "")
                    if "pl_profile=" in set_cookie or "sessionid=" in set_cookie:
                        import re
                        m = re.search(r'(?:pl_profile|sessionid)=([^;]+)', set_cookie)
                        if m:
                            sessionid = m.group(1)

                if res.status_code in (200, 302, 303) and sessionid:
                    return {
                        "accessible": True,
                        "sessionid": sessionid,
                        "cookies": dict(res.cookies)
                    }
                else:
                    error_msg = "Invalid FPL email or password." if res.status_code in (200, 400, 401) else f"FPL login HTTP {res.status_code}"
                    return {
                        "accessible": False,
                        "error": error_msg,
                        "status_code": res.status_code
                    }
            except Exception as exc:
                return {
                    "accessible": False,
                    "error": f"Login network error: {str(exc)}"
                }

    async def get_me(self, token: Optional[str] = None, session_cookie: Optional[str] = None) -> Dict[str, Any]:
        """Queries /api/me/ using X-API-Authorization Bearer JWT header or Cookie."""
        extra_headers = {}
        if token:
            extra_headers["X-API-Authorization"] = f"Bearer {token}"
            extra_headers["Authorization"] = f"Bearer {token}"
        
        cookie_val = session_cookie or token
        if cookie_val:
            extra_headers["Cookie"] = f"pl_profile={cookie_val}; sessionid={cookie_val}"
            
        return await self._fetch("me/", headers_extra=extra_headers)

    async def get_my_team(self, manager_id: int, token: Optional[str] = None, session_cookie: Optional[str] = None) -> Dict[str, Any]:
        """Queries /api/my-team/{manager_id}/ using Bearer token or legacy sessionid cookie."""
        extra_headers = {}
        if token:
            extra_headers["X-API-Authorization"] = f"Bearer {token}"
            extra_headers["Authorization"] = f"Bearer {token}"
        if session_cookie:
            extra_headers["Cookie"] = f"sessionid={session_cookie}"

        return await self._fetch(f"my-team/{manager_id}/", headers_extra=extra_headers)

    async def get_oidc_discovery(self) -> Dict[str, Any]:
        """Queries live PingOne OpenID Connect discovery endpoint for FPL authorization server."""
        start_time = time.perf_counter()
        async with httpx.AsyncClient(headers=DEFAULT_HEADERS, timeout=10.0, follow_redirects=True) as client:
            try:
                response = await client.get(PINGONE_OIDC_DISCOVERY_URL)
                duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
                if response.status_code == 200:
                    raw = response.json()
                    return {
                        "status_code": 200,
                        "response_time_ms": duration_ms,
                        "endpoint": "/as/.well-known/openid-configuration",
                        "url": PINGONE_OIDC_DISCOVERY_URL,
                        "requires_auth": False,
                        "accessible": True,
                        "raw_json": raw,
                        "data": {
                            "issuer": raw.get("issuer"),
                            "authorization_endpoint": raw.get("authorization_endpoint"),
                            "token_endpoint": raw.get("token_endpoint"),
                            "userinfo_endpoint": raw.get("userinfo_endpoint"),
                            "jwks_uri": raw.get("jwks_uri"),
                            "grant_types_supported": raw.get("grant_types_supported"),
                            "scopes_supported": raw.get("scopes_supported")
                        }
                    }
                else:
                    return {
                        "status_code": response.status_code,
                        "response_time_ms": duration_ms,
                        "endpoint": "/as/.well-known/openid-configuration",
                        "url": PINGONE_OIDC_DISCOVERY_URL,
                        "requires_auth": False,
                        "accessible": False,
                        "raw_json": None,
                        "error": f"HTTP {response.status_code}"
                    }
            except Exception as exc:
                duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
    async def exchange_code_pkce(
        self,
        token_endpoint: str,
        client_id: str,
        code: str,
        code_verifier: str,
        redirect_uri: str
    ) -> Dict[str, Any]:
        """Exchanges PKCE authorization code for OAuth access tokens with PingOne token endpoint."""
        start_time = time.perf_counter()
        data = {
            "grant_type": "authorization_code",
            "client_id": client_id,
            "code": code,
            "code_verifier": code_verifier,
            "redirect_uri": redirect_uri
        }
        headers = dict(DEFAULT_HEADERS)
        headers["Content-Type"] = "application/x-www-form-urlencoded"

        async with httpx.AsyncClient(headers=headers, timeout=15.0, follow_redirects=True) as client:
            try:
                response = await client.post(token_endpoint, data=data)
                duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
                if response.status_code == 200:
                    return {
                        "status_code": 200,
                        "response_time_ms": duration_ms,
                        "accessible": True,
                        "raw_json": response.json()
                    }
                else:
                    return {
                        "status_code": response.status_code,
                        "response_time_ms": duration_ms,
                        "accessible": False,
                        "error": f"Token Exchange Error ({response.status_code}): {response.text}"
                    }
            except Exception as exc:
                duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
                return {
                    "status_code": 500,
                    "response_time_ms": duration_ms,
                    "accessible": False,
                    "error": str(exc)
                }

