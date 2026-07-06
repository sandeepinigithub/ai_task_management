"""
Phase 4 — LangGraph: Task Escalation Agent

A simpler LangGraph example that demonstrates:
  - Conditional edges (branch on data)
  - A fully automated linear workflow (no human-in-the-loop needed)

This fills the empty cron/ + events/ folders in your Node.js backend conceptually.
In production you'd trigger this graph on a schedule (every morning, or via cron).

Graph flow:
  [find_stale_tasks]
        ↓
  (has stale tasks?)
    ↓ YES              ↓ NO
  [draft_message]    [END — nothing to do]
        ↓
  [build_report]
        ↓
       END  (caller sends report back to the manager via Socket.IO)
"""

from typing import TypedDict
from langgraph.graph import StateGraph, END
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from datetime import datetime, timezone, timedelta
from utils.node_api_client import NodeAPIClient
from utils.llm import get_llm


# ── State ──────────────────────────────────────────────────────────────────

class EscalationState(TypedDict):
    token: str
    stale_days: int           # tasks older than this (pending) are stale
    stale_tasks: list         # tasks that need escalation
    escalation_message: str   # LLM-drafted message to send to manager
    report: dict              # final structured report


# ── Nodes ──────────────────────────────────────────────────────────────────

async def find_stale_tasks(state: EscalationState) -> EscalationState:
    """
    Node 1: Find pending tasks that haven't moved in N days.
    These are candidates for escalation.
    """
    client = NodeAPIClient(state["token"])
    response = await client.get_tasks(status="pending", limit=100)
    all_pending = response.get("data", {}).get("docs", [])

    cutoff = datetime.now(timezone.utc) - timedelta(days=state.get("stale_days", 3))

    stale = []
    for task in all_pending:
        created_at_str = task.get("createdAt", "")
        if created_at_str:
            created_at = datetime.fromisoformat(created_at_str.replace("Z", "+00:00"))
            if created_at < cutoff:
                stale.append(task)

    return {**state, "stale_tasks": stale}


async def draft_escalation_message(state: EscalationState) -> EscalationState:
    """
    Node 2: LLM drafts a concise escalation notification for the manager.
    """
    tasks_text = "\n".join(
        f"- [{t['_id']}] {t['title']} (created: {t.get('createdAt', 'unknown')})"
        for t in state["stale_tasks"]
    )

    prompt = ChatPromptTemplate.from_messages([
        (
            "system",
            "You write concise, professional escalation notices for a task management system.",
        ),
        (
            "human",
            f"""The following tasks have been pending for more than {state.get('stale_days', 3)} days:

{tasks_text}

Write a short escalation message (3-5 sentences) to alert the manager.""",
        ),
    ])

    chain = prompt | get_llm(temperature=0.2) | StrOutputParser()
    message = await chain.ainvoke({})
    return {**state, "escalation_message": message}


async def build_report(state: EscalationState) -> EscalationState:
    """
    Node 3: Package results into a structured report.
    The caller (router) can forward this to a manager via Socket.IO.
    """
    report = {
        "stale_task_count": len(state["stale_tasks"]),
        "stale_task_ids": [t["_id"] for t in state["stale_tasks"]],
        "escalation_message": state["escalation_message"],
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }
    return {**state, "report": report}


# ── Routing ────────────────────────────────────────────────────────────────

def should_escalate(state: EscalationState) -> str:
    """
    Conditional edge function.
    LangGraph calls this after find_stale_tasks to decide the next node.
    Returns the name of the next node to run.
    """
    return "draft_message" if state["stale_tasks"] else END


# ── Graph Assembly ─────────────────────────────────────────────────────────

def build_escalation_graph():
    graph = StateGraph(EscalationState)

    graph.add_node("find_stale_tasks", find_stale_tasks)
    graph.add_node("draft_message", draft_escalation_message)
    graph.add_node("build_report", build_report)

    graph.set_entry_point("find_stale_tasks")

    # Conditional edge: branch based on whether there are stale tasks
    graph.add_conditional_edges(
        "find_stale_tasks",
        should_escalate,
        {
            "draft_message": "draft_message",
            END: END,
        },
    )

    graph.add_edge("draft_message", "build_report")
    graph.add_edge("build_report", END)

    return graph.compile()
