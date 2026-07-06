"""
Phase 2 — RAG: Semantic Search Endpoints

Two-step workflow:
  1. /search/index  — embed all tasks into Chroma (run once, then on task changes)
  2. /search        — query the vector store + LLM answers the question

Teaches: Embeddings, vector stores, retrieval-augmented generation.
"""

from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel
from vector_store.embeddings import TaskVectorStore
from utils.node_api_client import NodeAPIClient
from utils.llm import get_llm
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

router = APIRouter(prefix="/search", tags=["Phase 2 — RAG Search"])


class SearchRequest(BaseModel):
    query: str
    top_k: int = 5
    with_answer: bool = True   # if False, return only matching tasks (no LLM)


# ── POST /ai/search/index ──────────────────────────────────────────────────

@router.post("/index")
async def index_tasks(authorization: str = Header(...)):
    """
    Embed all tasks into the Chroma vector store.

    Call this:
      - Once after initial setup
      - After bulk task imports
      - (In production: hook into task:created / task:updated events)
    """
    token = authorization.removeprefix("Bearer ")
    client = NodeAPIClient(token)

    try:
        tasks_resp = await client.get_tasks(limit=500)
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))

    tasks = tasks_resp.get("data", {}).get("docs", [])

    if not tasks:
        return {"message": "No tasks found to index", "indexed": 0}

    store = TaskVectorStore()
    count = store.index_tasks(tasks)

    return {
        "message": f"Successfully indexed {count} tasks",
        "indexed": count,
        "total_in_store": store.count(),
    }


# ── POST /ai/search ────────────────────────────────────────────────────────

@router.post("/")
async def semantic_search(request: SearchRequest, authorization: str = Header(...)):
    """
    RAG pipeline:
      1. Embed the user's query
      2. Find top-K similar tasks in Chroma (vector similarity, not keyword)
      3. Inject matching tasks into an LLM prompt
      4. LLM generates a grounded answer

    Example queries:
      "Find tasks related to authentication"
      "Any work done on the payment module?"
      "What bugs are being tracked?"
    """
    store = TaskVectorStore()

    if store.count() == 0:
        raise HTTPException(
            status_code=400,
            detail="Vector store is empty. Call POST /ai/search/index first.",
        )

    # Step 1 & 2 — Retrieve
    results = store.search(request.query, k=request.top_k)

    if not request.with_answer:
        return {"results": results, "count": len(results)}

    # Step 3 — Augment prompt with retrieved context
    context_lines = [
        f"[{r['status'].upper()}] {r['title']}: {r['description']} (relevance: {r['relevance_score']})"
        for r in results
    ]
    context = "\n".join(context_lines) if context_lines else "No relevant tasks found."

    # Step 4 — Generate grounded answer
    prompt = ChatPromptTemplate.from_messages([
        (
            "system",
            """You are a task management assistant answering questions about project work.
Use ONLY the retrieved tasks below to answer. Do not invent information.
If the tasks don't contain enough information, say so clearly.

Retrieved tasks:
{context}""",
        ),
        ("human", "{query}"),
    ])

    chain = prompt | get_llm(temperature=0.1) | StrOutputParser()
    answer = await chain.ainvoke({"context": context, "query": request.query})

    return {
        "answer": answer,
        "sources": results,
        "source_count": len(results),
    }


# ── GET /ai/search/stats ───────────────────────────────────────────────────

@router.get("/stats")
async def vector_store_stats():
    """Check how many tasks are currently indexed."""
    store = TaskVectorStore()
    return {"indexed_tasks": store.count()}
