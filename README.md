# AI Task Management

A full-stack task management application with a **3-tier role hierarchy** (Manager → Team Lead → Employee) and an integrated **AI service** for learning LLM, RAG, LangChain, and LangGraph.

---

## Project Structure

```
ai_task_management/
├── task-management-backend/   # Node.js + Express REST API + Socket.IO
├── task-management-ui/        # Angular 21 SPA (PrimeNG + Bootstrap)
└── ai-service/                # Python + FastAPI (LangChain + LangGraph)
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend API | Node.js, Express v5, MongoDB (Mongoose v9) |
| Authentication | JWT + bcrypt |
| Real-time | Socket.IO v4 |
| Frontend | Angular 21, PrimeNG v21, Bootstrap 5 |
| AI Service | Python, FastAPI, LangChain, LangGraph |
| LLM Provider | Groq (free) or OpenAI |
| Vector Store | ChromaDB + sentence-transformers |

---

## Prerequisites

- Node.js >= 18
- Python >= 3.11
- MongoDB (local or Atlas)
- [Groq API key](https://console.groq.com) — free, no credit card

---

## Quick Start

### 1. Clone & Install

```bash
git clone <repo-url>
cd ai_task_management
```

**Backend**
```bash
cd task-management-backend
npm install
cp .env.example .env        # fill in MONGO_URI, JWT_SECRET
```

**Frontend**
```bash
cd task-management-ui
npm install
```

**AI Service**
```bash
cd ai-service
python -m venv venv
source venv/bin/activate     # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env         # fill in GROQ_API_KEY
```

---

### 2. Seed the Database

Creates the initial **Manager** account.

```bash
cd task-management-backend
npm run seed
```

Default manager credentials:
```
Email   : manager@yopmail.com
Password: Password@123
```

---

### 3. Start All Services

Open **three terminals** and run each in parallel:

| Terminal | Command | URL |
|----------|---------|-----|
| Backend | `cd task-management-backend && npm run dev` | http://localhost:3000 |
| Frontend | `cd task-management-ui && npm start` | http://localhost:4200 |
| AI Service | `cd ai-service && source venv/bin/activate && uvicorn main:app --reload --port 8000` | http://localhost:8000 |

---

## Environment Variables

### `task-management-backend/.env`

```env
NODE_ENV=development
PORT=3000
MONGO_URI=mongodb://localhost:27017/ai_task_management_db
JWT_SECRET=your_jwt_secret_here
CLIENT_ORIGIN=http://localhost:4200
```

### `ai-service/.env`

```env
NODE_API_URL=http://localhost:3000/api
LLM_PROVIDER=groq                          # or "openai"
GROQ_API_KEY=your_groq_api_key_here        # console.groq.com
GROQ_MODEL=llama-3.3-70b-versatile
OPENAI_API_KEY=your_openai_api_key_here    # only if LLM_PROVIDER=openai
EMBEDDING_MODEL=all-MiniLM-L6-v2
CHROMA_DB_PATH=./chroma_db
PORT=8000
```

---

## Role Hierarchy

```
Manager
  └── Team Lead
        └── Employee
```

| Role | Capabilities |
|------|-------------|
| **Manager** | Create users, assign any task, view all data, sprint planning |
| **Team Lead** | Assign tasks within their team, view team data |
| **Employee** | View and update own assigned tasks |

---

## API Overview

### Node.js Backend (`:3000`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Register user |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/users` | Manager / TL | List users (scoped) |
| POST | `/api/users` | Manager | Create user |
| GET | `/api/tasks` | All | List tasks (scoped by role) |
| POST | `/api/tasks` | All | Create task |
| PATCH | `/api/tasks/:id` | All | Update task |
| DELETE | `/api/tasks/:id` | All | Delete task |
| GET | `/api/tasks/dashboard/summary` | All | Role-scoped counts |
| GET | `/api/tasks/dashboard/recent` | All | Recent 5 tasks |

### AI Service (`:8000`)

> Full interactive docs: **http://localhost:8000/docs**

| Phase | Endpoint | Description |
|-------|----------|-------------|
| 1 — LLM | `POST /ai/chat/` | Contextual chat with your tasks |
| 1 — LLM | `POST /ai/chat/stream` | Same, streams token by token |
| 1 — LLM | `POST /ai/chat/summarize` | AI task summary |
| 1 — LLM | `POST /ai/chat/advice` | Today's priority recommendations |
| 2 — RAG | `POST /ai/search/index` | Embed tasks into vector store |
| 2 — RAG | `POST /ai/search/` | Semantic task search |
| 3 — Agent | `POST /ai/agent/` | Conversational task agent |
| 4 — LangGraph | `POST /ai/graphs/sprint/plan` | AI sprint planner (step 1) |
| 4 — LangGraph | `POST /ai/graphs/sprint/execute` | Apply approved plan (step 2) |
| 4 — LangGraph | `POST /ai/graphs/escalate` | Stale task escalation |

All AI endpoints require `Authorization: Bearer <jwt>` — use the token from `/api/auth/login`.

---

## Real-time Events (Socket.IO)

Clients connect with `Authorization: Bearer <token>` in the handshake header.

| Event | Payload | Who receives |
|-------|---------|-------------|
| `task:created` | `{ task, actorId }` | Assignee + their TL + all Managers |
| `task:updated` | `{ task, actorId }` | Assignee + their TL + all Managers |
| `task:deleted` | `{ taskId, actorId }` | Assignee + their TL + all Managers |
| `task:reassigned` | `{ task, actorId }` | Assignee + their TL + all Managers |

---

## AI Learning Roadmap

This project is structured to progressively teach AI concepts:

```
Phase 1 → LLM Basics
  Use: POST /ai/chat  (ask questions about your tasks)
  Learn: Prompt construction, context injection, streaming

Phase 2 → RAG (Retrieval-Augmented Generation)
  Use: POST /ai/search/index  then  POST /ai/search
  Learn: Embeddings, vector similarity search, ChromaDB

Phase 3 → LangChain
  Use: POST /ai/agent
  Learn: LCEL chains, tools, agents, multi-turn memory
  Files: ai-service/chains/, ai-service/tools/

Phase 4 → LangGraph
  Use: POST /ai/graphs/sprint/plan  →  /execute
       POST /ai/graphs/escalate
  Learn: Stateful graphs, conditional edges, human-in-the-loop
  Files: ai-service/graphs/
```

---

## Dashboard AI Features

After logging in, the dashboard (`/portal/layout/dashboard`) includes:

- **Today's Focus** — AI-generated priority advice based on your tasks (auto-loads)
- **AI Assistant chat** — Stream responses token by token; click suggestion chips to try sample questions

---

## Useful Commands

```bash
# Re-seed database (idempotent — safe to re-run)
cd task-management-backend && npm run seed

# Re-index tasks into vector store (after adding new tasks)
curl -X POST http://localhost:8000/ai/search/index \
  -H "Authorization: Bearer <your-jwt>"

# Kill process on port 8000 if already in use
lsof -ti :8000 | xargs kill -9
```

---

## Project Author

**Sandeep Kumar Shukla**
