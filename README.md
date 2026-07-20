# AuraGen – Self-Healing Generative UI

AuraGen is an AI-powered adaptive user interface system that detects cognitive load from user interaction telemetry and dynamically generates simplified React UI components using Large Language Models (Gemini) and LangGraph.

The goal is to reduce user friction by automatically adapting complex interfaces into guided experiences.

---

## Project Overview

AuraGen continuously analyzes user interaction patterns such as:

- Mouse movement
- Hesitation time
- Rage clicks
- Cognitive load score

Based on these signals, the AI backend generates an optimized React component that can replace or simplify the existing interface.

---

## Features

- AI-powered adaptive UI generation
- Cognitive load analysis
- FastAPI backend
- LangGraph workflow
- Gemini LLM integration
- React + Next.js frontend
- Dashboard for monitoring cognitive load
- Live AI response visualization
- REST API architecture
- Modular backend structure

---

## Tech Stack

### Frontend

- Next.js 14
- React
- TypeScript
- Tailwind CSS
- Lucide Icons

### Backend

- Python
- FastAPI
- Pydantic
- LangGraph
- Google Gemini API

### Development Tools

- Git
- GitHub
- VS Code

---

## Project Structure

```text
Project-Progress-tab
│
├── backend/
│   ├── ai/
│   ├── api/
│   ├── graph/
│   ├── models/
│   ├── tests/
│   └── main.py
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── context/
│   └── package.json
│
└── README.md
```

---

## Backend Architecture

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
      ├── Analyze Telemetry
      ├── Build Prompt
      └── Generate UI
                │
                ▼
          Gemini API
                │
                ▼
GenerateResponse
                │
                ▼
Frontend Dashboard
```

---

## API Endpoint

### Generate Adaptive UI

```
POST /generate-ui
```

### Request

```json
{
  "component_name": "Payment Form",
  "cognitive_score": 0.82,
  "mouse_velocity": 24,
  "hesitation_time": 5.2,
  "rage_clicks": 4
}
```

### Response

```json
{
  "strategy": "high_cognitive_load",
  "component": "...React TSX...",
  "is_valid": true,
  "generation_time": 2.74
}
```

---

## Running the Backend

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

Swagger

```
http://127.0.0.1:8000/docs
```

---

## Running the Frontend

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

## AI Workflow

```text
Telemetry

↓

FastAPI

↓

LangGraph

↓

Gemini

↓

Adaptive React Component

↓

Frontend
```

---

## Current Progress

### Completed

- Backend API
- FastAPI
- LangGraph workflow
- Gemini integration
- Prompt engineering
- Frontend integration
- Dashboard
- AI Integration Panel
- End-to-end API communication
- CORS configuration
- Swagger documentation

---

## Future Enhancements

- Live rendering of generated React components
- Real browser telemetry collection
- Component validation
- Database support
- Authentication
- Deployment
- Analytics dashboard
- User history

---

## Team

AuraGen Development Team

- Frontend Development
- AI Backend Development
- Telemetry & Analytics
- Integration & Testing

---

## License

This project was developed for educational and research purposes.