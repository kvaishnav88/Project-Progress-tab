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
```

---

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
```

---

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
```

---

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