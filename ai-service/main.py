"""
AI Service — FastAPI entry point

Runs alongside the Node.js backend as a separate microservice.
All AI logic (LLM, RAG, LangChain, LangGraph) lives here.
Data access always goes through the Node.js REST API.

Start:
    uvicorn main:app --reload --port 8000

Docs:
    http://localhost:8000/docs   (Swagger UI — try all endpoints here)
    http://localhost:8000/redoc
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from routers import chat, search, agent, graphs

app = FastAPI(
    title="AI Task Management — AI Service",
    description="""
## Learning Roadmap

| Phase | Concept | Endpoints |
|-------|---------|-----------|
| 1 | LLM Basics | `/ai/chat`, `/ai/chat/stream`, `/ai/chat/summarize` |
| 2 | RAG | `/ai/search/index`, `/ai/search` |
| 3 | LangChain Agent | `/ai/agent` |
| 4 | LangGraph | `/ai/graphs/sprint/plan`, `/ai/graphs/escalate` |

All endpoints require `Authorization: Bearer <jwt>` (use a token from the Node.js login endpoint).
""",
    version="1.0.0",
)

# Allow requests from the Angular frontend and the Node.js backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200",  # Angular dev server
        "http://localhost:3000",  # Node.js backend (server-to-server)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all routers under /ai prefix
app.include_router(chat.router,   prefix="/ai")
app.include_router(search.router, prefix="/ai")
app.include_router(agent.router,  prefix="/ai")
app.include_router(graphs.router, prefix="/ai")


@app.get("/health", tags=["Health"])
async def health():
    return {
        "status": "ok",
        "service": "ai-service",
        "llm_provider": settings.LLM_PROVIDER,
        "node_api_url": settings.NODE_API_URL,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=settings.PORT, reload=True)
