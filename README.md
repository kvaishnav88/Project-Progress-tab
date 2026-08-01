<<<<<<< HEAD
# AuraGen – Self-Healing Generative UI

AuraGen is an AI-powered adaptive user interface system that detects user cognitive load from interaction telemetry and dynamically generates optimized React UI components using **LangGraph**, **LangChain**, and **Google Gemini**.

The system automatically simplifies user interfaces based on real-time behavioral analysis, reducing cognitive friction and improving usability.

---

# Project Overview

AuraGen continuously monitors user interaction telemetry such as:

- Mouse Velocity
- Hesitation Time
- Rage Clicks

The backend analyzes these signals to determine the user's cognitive load and dynamically generates an adaptive React UI component.

---

# Features

- AI-powered adaptive UI generation
- Real-time telemetry analysis
- Cognitive load detection
- Decision Engine for UI adaptation
- LangGraph workflow orchestration
- LangChain-powered prompt pipeline
- Google Gemini integration
- React + Next.js frontend
- Response validation
- Metrics logging
- Swagger API documentation
- Modular backend architecture

---

# Tech Stack

## Frontend

- Next.js 14
- React
- TypeScript
- Tailwind CSS
- Socket.IO Client
- Lucide Icons

---

## Backend

- Python
- FastAPI
- Pydantic
- LangGraph
- LangChain
- Google Gemini API

---

## Development Tools

- Git
- GitHub
- VS Code

---

# Project Structure

```text
Project-Progress-tab
│
├── backend/
│   ├── ai/
│   │   ├── chains/
│   │   ├── clients/
│   │   ├── prompts/
│   │   ├── services/
│   │   ├── interfaces/
│   │   ├── config.py
│   │   ├── constants.py
│   │   ├── factory.py
│   │   └── logger.py
│   │
│   ├── api/
│   ├── graph/
│   ├── models/
│   ├── tests/
│   ├── requirements.txt
│   └── main.py
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── context/
│   ├── lib/
│   └── package.json
│
└── README.md
=======
# AuraGen Backend (Week 2)

FastAPI backend with **PostgreSQL**, **Redis**, and **Socket.IO** — AI UI generation, history, telemetry, caching, and live progress events.

```text
                    React / Next.js
                          │
          HTTP APIs + Socket.IO
                          │
                          ▼
                    FastAPI Backend
                          │
      ┌───────────────────┼────────────────────┐
      │                   │                    │
      ▼                   ▼                    ▼
 PostgreSQL           Redis Cache          Socket.IO
      │                   │                    │
Users                Cached AI          Live Updates
Sessions             Telemetry          Progress Events
Telemetry            Generated UI       Notifications
Generated UI
History
>>>>>>> 9173720 (Add backend files for my feature)
```

---

<<<<<<< HEAD
# Backend Architecture

```text
Frontend
      │
      ▼
POST /generate-ui
      │
      ▼
FastAPI
      │
      ▼
LangGraph Workflow
      │
      ▼
Cognitive Analyzer
      │
      ▼
Decision Engine
      │
      ▼
Prompt Builder
      │
      ▼
LangChain ChatPromptTemplate
      │
      ▼
Google Gemini
      │
      ▼
Response Validator
      │
      ▼
Metrics Logger
      │
      ▼
GenerateResponse
      │
      ▼
Frontend
```

---

# API Endpoint

## Generate Adaptive UI

```
POST /generate-ui
```

## Request

```json
{
  "component_name": "LoginForm",
  "mouse_velocity": 35,
  "hesitation_time": 4,
  "rage_clicks": 2
}
```

## Response

```json
{
  "strategy": "medium_cognitive_load",
  "component": "...React TSX...",
  "is_valid": true,
  "generation_time": 11.94
}
```

---

# Running the Backend

```bash
cd backend

python -m venv .venv

.venv\Scripts\activate

pip install -r requirements.txt

uvicorn main:app --reload
```

Backend URL

```
http://127.0.0.1:8000
```

Swagger Documentation

```
http://127.0.0.1:8000/docs
```

---

# Running the Frontend

```bash
cd frontend

npm install

npm run dev
```

Frontend URL

```
http://localhost:3000
=======
## Prerequisites

- Python 3.11+
- PostgreSQL (Docker or local on port **5433**)
- Redis on **6379**

---

## Quick start

### 1. Start PostgreSQL & Redis

**Docker:**

```bash
docker compose up -d
```

**Local PostgreSQL 17 (Windows):**

```powershell
.\scripts\start_postgres.ps1
```

Ensure Redis responds: `redis-cli ping` → `PONG`.

### 2. Install deps & configure

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

```env
DATABASE_URL=postgresql+psycopg2://auragen:auragen@127.0.0.1:5433/auragen
REDIS_URL=redis://127.0.0.1:6379/0
CORS_ORIGINS=*
```

### 3. Run the API

```bash
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

| Resource | URL |
|----------|-----|
| Swagger | http://127.0.0.1:8000/docs |
| ReDoc | http://127.0.0.1:8000/redoc |
| Health | http://127.0.0.1:8000/health |
| Socket.IO | http://127.0.0.1:8000/socket.io |

### 4. Run tests

```bash
python scripts/test_week1.py
python scripts/test_socketio.py
python scripts/test_week2.py
>>>>>>> 9173720 (Add backend files for my feature)
```

---

<<<<<<< HEAD
# AI Workflow

```text
User Interaction
        │
        ▼
Telemetry Collection
(Mouse Velocity, Hesitation, Rage Clicks)
        │
        ▼
FastAPI API
        │
        ▼
LangGraph Workflow
        │
        ▼
Cognitive Analyzer
        │
        ▼
Decision Engine
        │
        ▼
Prompt Builder
        │
        ▼
LangChain ChatPromptTemplate
        │
        ▼
Google Gemini
        │
        ▼
React Component Generation
        │
        ▼
Response Validator
        │
        ▼
Metrics Logger
        │
        ▼
Frontend Rendering
=======
## Project structure

```text
backend/
├── app/
│   ├── api/routes.py                 # REST APIs (incl. POST /api/generate-ui)
│   ├── cache/redis_client.py         # Redis helpers
│   ├── core/                         # Config + exception handlers
│   ├── crud/                         # DB access
│   ├── db/database.py                # Engine, sessions, Week-2 column migrate
│   ├── middleware/                   # Request logging
│   ├── models/                       # SQLAlchemy models
│   ├── schemas/                      # Pydantic validation
│   ├── services/
│   │   ├── ai_generator.py           # Prompt → React component
│   │   └── generate_ui.py            # Cache → AI → Postgres → events
│   ├── websocket/socketio_server.py  # Live telemetry + AI progress
│   └── main.py
├── scripts/
│   ├── test_week1.py
│   ├── test_socketio.py
│   └── test_week2.py                 # End-to-end Week 2 workflow
├── docker-compose.yml
├── .env.example
└── requirements.txt
>>>>>>> 9173720 (Add backend files for my feature)
```

---

<<<<<<< HEAD
# Current Progress

## Completed

### AI Backend

- FastAPI backend
- LangGraph workflow
- LangChain integration
- Google Gemini integration
- Cognitive Analyzer
- Decision Engine
- Adaptive Prompt Builder
- Dynamic React UI generation
- Response Validator
- Metrics Logger
- Backend error handling
- Swagger documentation
- REST API

### Frontend

- Next.js application
- Dashboard
- AI Integration Panel
- API communication
- CORS configuration

---

# Future Enhancements

- Live rendering of generated React components
- Runtime component sandbox
- Real browser telemetry collection
- AI response caching
- Authentication
- PostgreSQL integration
- User history
- Analytics dashboard
- Deployment

---

# Team

AuraGen Development Team

- Frontend Development
- AI Backend Development
- Runtime Engine & Security
- Integration & Testing

---

# License

This project was developed for educational and research purposes.
=======
## Database schema

### `users`
| Column | Type |
|--------|------|
| id | Integer PK |
| name | String(100) |
| email | String(150) unique |
| password | String(255) |
| created_at | DateTime |

### `sessions`
| Column | Type |
|--------|------|
| id | Integer PK |
| user_id | FK → users.id |
| device / browser | String |
| login_time / logout_time | DateTime |

### `telemetry_logs`
| Column | Type |
|--------|------|
| id | Integer PK |
| session_id | FK → sessions.id |
| mouse_x / mouse_y | Float |
| clicks | Integer |
| scroll_speed | Float |
| hesitation_time | Float |
| cognitive_score | Float |
| created_at | DateTime |

### `generated_components`
| Column | Type |
|--------|------|
| id | Integer PK |
| user_id | FK → users.id |
| session_id | FK → sessions.id |
| component_name | String(200) |
| prompt | Text |
| generated_code | Text |
| created_at | DateTime |

Indexes exist on `user_id`, `session_id`, and `created_at` for history/telemetry queries.

---

## API reference

### System

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/` | Ready message |
| GET | `/health` | DB / Redis / Socket.IO status |
| GET | `/cache` | Redis smoke test |

**Errors (all APIs):** `400` Bad Request · `404` Not Found · `422` Validation · `500` Server Error · `503` Redis unavailable

---

### POST `/api/generate-ui`

**Purpose:** Generate a React component from a prompt, cache in Redis, save to PostgreSQL, broadcast Socket.IO progress.

**Request**
```json
{
  "prompt": "Create Login Page",
  "user_id": 1,
  "session_id": 1,
  "use_cache": true
}
```

**Response `201`**
```json
{
  "status": "success",
  "cached": false,
  "prompt_hash": "…",
  "id": 1,
  "user_id": 1,
  "session_id": 1,
  "component_name": "LoginPage",
  "prompt": "Create Login Page",
  "component": "export default function LoginPage() { … }",
  "generated_code": "export default function LoginPage() { … }",
  "created_at": "2026-07-24T…"
}
```

**Second identical request** returns `"cached": true` (Redis hit — no AI re-generation).

**Errors:** `400` empty prompt · `404` user/session missing · `500` server error

---

### GET `/api/generated-ui/history`

**Purpose:** List AI generation history (newest first).

**Query:** `?user_id=1&skip=0&limit=100`

**Response `200`**
```json
[
  {
    "id": 3,
    "user_id": 1,
    "session_id": 1,
    "component_name": "ProfilePage",
    "prompt": "Generate Profile Page",
    "generated_code": "…",
    "created_at": "…"
  }
]
```

---

### POST `/api/generated-ui`

**Purpose:** Manually save already-generated UI (without AI).

```json
{
  "user_id": 1,
  "session_id": 1,
  "component_name": "Login",
  "prompt": "Create Login Page",
  "generated_code": "<Login />"
}
```

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/generated-ui/{id}` | Get one |
| DELETE | `/api/generated-ui/{id}` | `204` |

---

### Auth / users

| Method | Path | Body |
|--------|------|------|
| POST | `/api/login` | `{ "email", "password" }` |
| POST | `/api/users` | `{ "name", "email", "password" }` → `201` |
| GET | `/api/users` | list |
| GET | `/api/users/{id}` | get one |
| PUT | `/api/users/{id}` | partial update |
| DELETE | `/api/users/{id}` | `204` |

Password min length: **6**. Email validated. Duplicate email → `409`.

---

### Sessions

| Method | Path | Notes |
|--------|------|-------|
| POST | `/api/sessions` | `{ "user_id", "device?", "browser?" }` |
| GET | `/api/sessions` | list |
| GET | `/api/sessions/{id}` | get one |
| PUT | `/api/sessions/{id}` | update |
| POST | `/api/sessions/{id}/end` | set logout_time |
| DELETE | `/api/sessions/{id}` | `204` |

---

### Telemetry (PostgreSQL)

| Method | Path | Notes |
|--------|------|-------|
| POST | `/api/telemetry` | save behavior log |
| GET | `/api/telemetry` | list (`?session_id=`) |
| GET | `/api/telemetry/{id}` | get one |
| DELETE | `/api/telemetry/{id}` | `204` |

**Request**
```json
{
  "session_id": 1,
  "mouse_x": 340,
  "mouse_y": 260,
  "clicks": 4,
  "scroll_speed": 12.5,
  "hesitation_time": 0.8,
  "cognitive_score": 0.78
}
```

`cognitive_score` must be between **0** and **1**.

---

### Redis cache APIs

| Method | Path | Notes |
|--------|------|-------|
| POST | `/api/cache/telemetry` | temp telemetry JSON |
| GET / DELETE | `/api/cache/telemetry/{session_id}` | retrieve / delete |
| POST | `/api/cache/ai` | manual AI cache by hash |
| GET / DELETE | `/api/cache/ai/{prompt_hash}` | retrieve / delete |

AI responses from `/api/generate-ui` are cached automatically under `ai:response:{sha256}`.

---

## Socket.IO

**Endpoint:** `http://127.0.0.1:8000` · path `/socket.io`

### Client → Server

| Event | Payload | Behavior |
|-------|---------|----------|
| (connect) | — | Server sends `connect_ack` |
| `ping_server` | any | Echo `pong_server` |
| `telemetry` | mouse/clicks/scroll/… | Redis + PostgreSQL (if `session_id` is int FK) |
| `generate_ui` | `{ prompt, user_id?, session_id?, use_cache? }` | Full AI pipeline with progress |

### Server → Client

| Event | When |
|-------|------|
| `connect_ack` | Client connected |
| `telemetry_received` | Telemetry accepted |
| `cognitive_score` | Score computed |
| `ai_started` | Generation began (`progress: 0`) |
| `ai_processing` | Progress `20` / `50` / `80` |
| `ai_completed` | Done (`progress: 100`) |
| `component_saved` | Row written to PostgreSQL |
| `history_updated` | Latest history snapshot |
| `error` | Validation / runtime error |

**Telemetry example**
```json
{
  "session_id": 1,
  "mouse_x": 340,
  "mouse_y": 260,
  "clicks": 4,
  "scroll_speed": 12.5,
  "hesitation_time": 0.8
}
```

**Generate example (Socket.IO)**
```js
socket.emit("generate_ui", {
  prompt: "Create Login Page",
  user_id: 1,
  session_id: 1
});
// listen: ai_started → ai_processing → ai_completed → component_saved → history_updated
```

---

## Frontend integration

| Frontend need | Backend |
|---------------|---------|
| Generate UI | `POST /api/generate-ui` **or** Socket `generate_ui` |
| Show history | `GET /api/generated-ui/history?user_id=` |
| Live progress | Socket events `ai_*` / `component_saved` / `history_updated` |
| Send behavior | Socket `telemetry` or `POST /api/telemetry` |
| Login / session | `POST /api/login`, `POST /api/sessions` |
| Health | `GET /health` |

Base URL: `http://127.0.0.1:8000`

---

## Performance & security (Week 2)

**Performance**
- Indexed FK / `created_at` columns for history & telemetry
- Redis AI cache avoids duplicate generation
- Login uses `get_user_by_email` (no full-table scan)
- Query `limit` caps on list endpoints
- Socket Redis writes run via `asyncio.to_thread`

**Security**
- Pydantic field validation (lengths, ranges, email)
- Reject empty prompts / unknown user or session
- Global exception handlers (`400` / `404` / `422` / `500`)
- CORS configurable via `CORS_ORIGINS`
- JWT auth & rate limiting planned for a later week

---

## Week 2 checklist

- [x] Save AI-generated components in PostgreSQL
- [x] Store AI generation history (`GET /api/generated-ui/history`)
- [x] Save telemetry automatically (Socket.IO → Redis + PostgreSQL)
- [x] Complete Socket.IO real-time events (AI progress + history)
- [x] Optimize Redis caching for AI responses
- [x] Complete API documentation (this README + `/docs`)
- [x] Improve backend performance (indexes, cache, query limits)
- [x] Add input validation and security
- [x] Backend APIs ready for frontend integration
- [x] End-to-end testing (`scripts/test_week2.py`)
>>>>>>> 9173720 (Add backend files for my feature)
