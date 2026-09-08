# FPL Integration MVP

A Python Proof of Concept (PoC) application built with **FastAPI**, **HTTPX**, **SQLAlchemy**, **PostgreSQL**, and **Redis** to verify, demonstrate, and document integration with the **Fantasy Premier League (FPL)** API.

---

## 🚀 Getting Started

### Quick Start with Docker Compose

Ensure Docker and Docker Compose are installed, then run:

```bash
docker compose up --build
```

The application services will start:
- **Web Interface & Internal API**: [http://localhost:9000](http://localhost:9000)
- **FastAPI Swagger Docs**: [http://localhost:9000/docs](http://localhost:9000/docs)
- **PostgreSQL Database**: `localhost:5432` (`fpldb`)
- **Redis Cache**: `localhost:6379`

---

## 📊 FPL API Endpoint Authentication Investigation Matrix

During implementation, all official FPL API endpoints were empirically tested against `https://fantasy.premierleague.com/api/`. Below is the complete security and accessibility reference matrix:

| Endpoint | Purpose | Authentication | HTTP Status | Accessible | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET /api/bootstrap-static/` | Main bootstrap data (players, teams, gameweeks) | Public | `200 OK` | Yes | Accessible without headers |
| `GET /api/fixtures/` | All 380 season fixtures and results | Public | `200 OK` | Yes | Accessible without headers |
| `GET /api/event/{gw}/live/` | Live player stats & points per gameweek | Public | `200 OK` | Yes | Accessible without headers |
| `GET /api/entry/{manager_id}/` | Manager profile & summary stats | Public | `200 OK` | Yes | Accessible without headers |
| `GET /api/entry/{manager_id}/history/` | Manager historical GW points & ranks | Public | `200 OK` | Yes | Accessible without headers |
| `GET /api/entry/{manager_id}/event/{gw}/picks/` | Manager team picks (Starting XI & Bench) | Public | `200 OK` | Yes | Accessible without headers |
| `GET /api/entry/{manager_id}/transfers/` | Manager transfer history | Public | `200 OK` | Yes | Accessible without headers |
| `GET /api/element-summary/{player_id}/` | Player history & upcoming fixtures | Public | `200 OK` | Yes | Accessible without headers |
| `GET /api/my-team/{manager_id}/` | Current logged-in manager squad & bank | **Required** | `403 Forbidden` | **No** | Requires authenticated FPL `sessionid` cookie |

> [!NOTE]
> The MVP safely identifies and handles protected endpoints (`403 Forbidden`) without exposing user credentials or crashing.

---

## 🛠️ Internal API Endpoints

The FastAPI backend exposes normalized REST endpoints:

- `GET /health`: Health check for PostgreSQL & Redis.
- `GET /api/fpl/bootstrap`: Get high-level FPL bootstrap data.
- `GET /api/fpl/teams`: Get all Premier League teams.
- `GET /api/fpl/players`: Get all players with stats.
- `GET /api/fpl/gameweeks`: Get all gameweeks with current/next/previous status.
- `GET /api/fpl/fixtures`: Get upcoming and completed fixtures.
- `GET /api/fpl/manager/{manager_id}`: Get manager profile details.
- `GET /api/fpl/manager/{manager_id}/history`: Get manager gameweek history.
- `GET /api/fpl/manager/{manager_id}/picks/{gameweek}`: Get manager starting XI and bench.
- `GET /api/fpl/manager/{manager_id}/transfers`: Get manager transfers.
- `POST /api/fpl/login`: Authenticate against FPL via email/password or sessionid.
- `POST /api/fpl/my-team`: Retrieve authenticated manager squad data using sessionid cookie.
- `GET /api/fpl/player/{player_id}`: Get player summary.
- `GET /api/fpl/player/{player_id}/history`: Get player gameweek breakdown.
- `GET /api/fpl/gameweek/{gameweek}/live`: Get live gameweek stats.
- `GET /api/fpl/auth-audit`: Runs a live audit check across FPL endpoints.

---

## 🔄 FPL Data Synchronization Command

To populate or sync FPL data into PostgreSQL, execute the sync script:

```bash
# Inside the docker container or python environment:
python -m app.sync
```

This command performantly upserts:
1. Premier League Teams (`teams`)
2. Players (`players`)
3. Gameweeks (`gameweeks`)
4. Fixtures (`fixtures`)

---

## 🖥️ Usage Guide

1. Open `http://localhost:8000` in your web browser.
2. Click **⚡ Test FPL Connection** to verify connection latency and active numbers.
3. Enter **Manager ID** (e.g. `1`), select a **Gameweek** (e.g. `1`), and click **🛡️ Get Team (Picks)** to view the visual pitch formation and bench.
4. Click **📜 Manager History** or **🔄 Transfers** to inspect performance.
5. Enter **Player ID** (e.g. `328`) and click **📈 Player History** to view match-by-match stats.
6. Toggle the **Raw JSON Viewer** tab on any request to view response time, status code, endpoint URL, and formatted JSON output.
