"""
Phase 1 — LLM Basics: Simple Chat Endpoint

The simplest possible AI feature:
  1. Receive a user message + their JWT
  2. Fetch their tasks from Node.js API (inject as context)
  3. Call LLM with a system prompt + context + user message
  4. Return the response

Teaches: Prompt construction, context injection, async LLM calls, streaming.
"""

import json
from fastapi import APIRouter, Header, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from chains.task_summary_chain import summarize_tasks, get_priority_advice
from utils.node_api_client import NodeAPIClient
from utils.llm import get_llm

router = APIRouter(prefix="/chat", tags=["Phase 1 — LLM Chat"])


class ChatRequest(BaseModel):
    message: str


class SummarizeRequest(BaseModel):
    status: str = ""  # optional filter


# ── POST /ai/chat ──────────────────────────────────────────────────────────

@router.post("/")
async def chat(request: ChatRequest, authorization: str = Header(...)):
    """
    Contextual chat — the LLM knows about the user's tasks.

    Example queries:
      "How many tasks do I have pending?"
      "Summarize what my team is working on"
      "What should I focus on today?"
    """
    token = authorization.removeprefix("Bearer ")
    client = NodeAPIClient(token)

    try:
        tasks_resp = await client.get_tasks(limit=30)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to fetch tasks: {e}")

    tasks = tasks_resp.get("data", {}).get("docs", [])

    task_context = json.dumps([
        {
            "title": t["title"],
            "status": t["status"],
            "assignedTo": t.get("assignedTo", {}).get("username", "") if isinstance(t.get("assignedTo"), dict) else "",
            "description": t.get("description", ""),
        }
        for t in tasks
    ], indent=2)

    prompt = ChatPromptTemplate.from_messages([
        (
            "system",
            """You are an AI assistant embedded in a task management system.
You have access to the user's current tasks shown below.

Tasks:
{task_context}

Answer questions concisely. If asked to take action (create/update tasks),
tell the user to use the /agent endpoint instead.""",
        ),
        ("human", "{message}"),
    ])

    chain = prompt | get_llm() | StrOutputParser()
    reply = await chain.ainvoke({"task_context": task_context, "message": request.message})

    return {"reply": reply, "task_count": len(tasks)}


# ── POST /ai/chat/stream — Streaming version ───────────────────────────────

@router.post("/stream")
async def chat_stream(request: ChatRequest, authorization: str = Header(...)):
    """
    Same as /chat but streams the response token by token.
    Teaches: LangChain .astream() + FastAPI StreamingResponse.
    """
    token = authorization.removeprefix("Bearer ")
    client = NodeAPIClient(token)

    tasks_resp = await client.get_tasks(limit=20)
    tasks = tasks_resp.get("data", {}).get("docs", [])
    task_context = json.dumps([{"title": t["title"], "status": t["status"]} for t in tasks])

    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a task assistant. Tasks context:\n{task_context}"),
        ("human", "{message}"),
    ])

    chain = prompt | get_llm() | StrOutputParser()

    async def token_generator():
        async for chunk in chain.astream({"task_context": task_context, "message": request.message}):
            yield chunk

    return StreamingResponse(token_generator(), media_type="text/plain")


# ── POST /ai/chat/summarize ────────────────────────────────────────────────

@router.post("/summarize")
async def summarize(request: SummarizeRequest, authorization: str = Header(...)):
    """
    Uses task_summary_chain to produce a structured task summary.
    Teaches: reusable LCEL chains.
    """
    token = authorization.removeprefix("Bearer ")
    client = NodeAPIClient(token)

    params = {}
    if request.status:
        params["status"] = request.status

    tasks_resp = await client.get_tasks(**params)
    tasks = tasks_resp.get("data", {}).get("docs", [])

    summary = await summarize_tasks(tasks)
    return {"summary": summary, "task_count": len(tasks)}


# ── POST /ai/chat/advice ───────────────────────────────────────────────────

@router.post("/advice")
async def priority_advice(authorization: str = Header(...)):
    """
    Returns today's focus recommendations using priority_advice_chain.
    """
    token = authorization.removeprefix("Bearer ")
    client = NodeAPIClient(token)

    tasks_resp = await client.get_tasks()
    tasks = tasks_resp.get("data", {}).get("docs", [])

    advice = await get_priority_advice(tasks)
    return {"advice": advice}
