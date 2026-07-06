"""
Phase 4 — LangGraph: Multi-Step Agent Workflows

Two LangGraph workflows exposed as REST endpoints:

  1. Sprint Planner (two-phase, human-in-the-loop):
       POST /ai/graphs/sprint/plan    — generate plan (returns for review)
       POST /ai/graphs/sprint/execute — approve and apply plan

  2. Escalation Agent (fully automated):
       POST /ai/graphs/escalate       — find stale tasks + draft manager notice

Teaches: StateGraph, nodes, edges, conditional branching, human-in-the-loop pattern.
"""

from fastapi import APIRouter, Header
from pydantic import BaseModel
from graphs.sprint_planner import build_planning_graph, build_execution_graph, SprintState
from graphs.escalation_agent import build_escalation_graph, EscalationState

router = APIRouter(prefix="/graphs", tags=["Phase 4 — LangGraph"])


# ── Sprint Planner ─────────────────────────────────────────────────────────

class ExecuteRequest(BaseModel):
    tasks_to_create: list   # from the /plan response, after user reviews


@router.post("/sprint/plan")
async def sprint_plan(authorization: str = Header(...)):
    """
    Phase 1 of sprint planning:
      - Fetches all pending tasks
      - Fetches team members
      - LLM generates a sprint assignment plan

    Returns the plan as text + a structured list of proposed assignments.
    The user reviews this before calling /sprint/execute.

    Graph: fetch_data → analyze_and_plan → END
    """
    token = authorization.removeprefix("Bearer ")

    graph = build_planning_graph()

    initial_state: SprintState = {
        "token": token,
        "pending_tasks": [],
        "team_members": [],
        "sprint_plan": "",
        "tasks_to_create": [],
        "created_task_ids": [],
        "error": "",
    }

    final_state = await graph.ainvoke(initial_state)

    if final_state.get("error"):
        return {"success": False, "error": final_state["error"]}

    return {
        "success": True,
        "plan": final_state["sprint_plan"],
        "proposed_assignments": final_state["tasks_to_create"],
        "pending_task_count": len(final_state["pending_tasks"]),
        "team_member_count": len(final_state["team_members"]),
    }


@router.post("/sprint/execute")
async def sprint_execute(request: ExecuteRequest, authorization: str = Header(...)):
    """
    Phase 2 of sprint planning — only call after reviewing /sprint/plan output.
    Applies the approved assignments via the Node.js API.

    Graph: create_tasks → END
    """
    token = authorization.removeprefix("Bearer ")

    graph = build_execution_graph()

    initial_state: SprintState = {
        "token": token,
        "pending_tasks": [],
        "team_members": [],
        "sprint_plan": "",
        "tasks_to_create": request.tasks_to_create,
        "created_task_ids": [],
        "error": "",
    }

    final_state = await graph.ainvoke(initial_state)

    return {
        "success": True,
        "applied_count": len(final_state["created_task_ids"]),
        "task_ids": final_state["created_task_ids"],
    }


# ── Escalation Agent ───────────────────────────────────────────────────────

class EscalationRequest(BaseModel):
    stale_days: int = 3   # flag tasks pending longer than this many days


@router.post("/escalate")
async def run_escalation(request: EscalationRequest, authorization: str = Header(...)):
    """
    Automated escalation workflow:
      1. Finds pending tasks older than stale_days
      2. LLM drafts a concise escalation message
      3. Returns a report (send to manager via Socket.IO in production)

    Graph: find_stale_tasks → (conditional) → draft_message → build_report → END
    """
    token = authorization.removeprefix("Bearer ")

    graph = build_escalation_graph()

    initial_state: EscalationState = {
        "token": token,
        "stale_days": request.stale_days,
        "stale_tasks": [],
        "escalation_message": "",
        "report": {},
    }

    final_state = await graph.ainvoke(initial_state)

    if not final_state.get("stale_tasks"):
        return {"success": True, "message": "No stale tasks found. All good!", "report": None}

    return {"success": True, "report": final_state["report"]}
