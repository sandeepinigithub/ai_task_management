"""
Phase 4 — LangGraph: Sprint Planner with Human-in-the-Loop

LangGraph models AI workflows as a directed graph:
  - Nodes  = functions that read and write to a shared State dict
  - Edges  = transitions between nodes (fixed or conditional)
  - State  = a TypedDict that flows through the graph

Human-in-the-loop pattern used here:
  The graph runs in two phases:
    Phase 1 (plan):    fetch data → LLM generates sprint plan → return to user
    Phase 2 (execute): user approves → create tasks → return confirmation

  This avoids accidentally creating tasks without manager review.

Graph flow:
  [fetch_data] → [analyze_and_plan] → (return plan to user for review)
                                             ↓ user approves
                                       [create_tasks] → END
"""

import json
from typing import TypedDict
from langgraph.graph import StateGraph, END
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from utils.node_api_client import NodeAPIClient
from utils.llm import get_llm


# ── State ──────────────────────────────────────────────────────────────────

class SprintState(TypedDict):
    token: str                    # JWT — passed through all nodes
    pending_tasks: list           # fetched from Node.js API
    team_members: list            # fetched from Node.js API
    sprint_plan: str              # LLM-generated plan (markdown)
    tasks_to_create: list         # parsed from LLM plan
    created_task_ids: list        # IDs of tasks created in DB
    error: str                    # error message if something fails


# ── Nodes ──────────────────────────────────────────────────────────────────

async def fetch_data(state: SprintState) -> SprintState:
    """
    Node 1: Pull pending tasks and team roster from the Node.js API.
    Runs first so the LLM has real data to reason about.
    """
    client = NodeAPIClient(state["token"])

    try:
        tasks_resp = await client.get_tasks(status="pending", limit=50)
        pending_tasks = tasks_resp.get("data", {}).get("docs", [])

        users_resp = await client.get_master_user_list()
        team_members = users_resp.get("data", [])

        return {**state, "pending_tasks": pending_tasks, "team_members": team_members}

    except Exception as e:
        return {**state, "error": f"Failed to fetch data: {str(e)}"}


async def analyze_and_plan(state: SprintState) -> SprintState:
    """
    Node 2: LLM reads pending tasks + team roster and produces a sprint plan.
    The plan includes which tasks to assign to whom, with reasoning.
    """
    if state.get("error"):
        return state

    tasks_json = json.dumps([
        {"id": t["_id"], "title": t["title"], "description": t.get("description", "")}
        for t in state["pending_tasks"]
    ], indent=2)

    members_json = json.dumps([
        {"id": u["_id"], "username": u["username"], "role": u["role"]}
        for u in state["team_members"]
        if u["role"] != "manager"  # only assign to leads and employees
    ], indent=2)

    prompt = ChatPromptTemplate.from_messages([
        (
            "system",
            """You are a sprint planning assistant.
Given the pending tasks and team members, create a sprint plan.

For each task you recommend, output a JSON block in this exact format:
```json
[
  {{"task_id": "<id>", "assign_to_id": "<user_id>", "reason": "<short reason>"}}
]
```

Then provide a brief narrative summary of the plan.""",
        ),
        (
            "human",
            "Pending tasks:\n{tasks}\n\nTeam members:\n{members}\n\nCreate a sprint plan.",
        ),
    ])

    chain = prompt | get_llm(temperature=0.4) | StrOutputParser()
    plan_text = await chain.ainvoke({"tasks": tasks_json, "members": members_json})

    # Try to extract the JSON assignments from the plan
    tasks_to_create = _extract_json_from_plan(plan_text)

    return {**state, "sprint_plan": plan_text, "tasks_to_create": tasks_to_create}


async def create_tasks(state: SprintState) -> SprintState:
    """
    Node 3: Apply the approved sprint plan by updating task assignments
    via the Node.js API. Only runs after human approval.
    """
    if state.get("error") or not state.get("tasks_to_create"):
        return state

    client = NodeAPIClient(state["token"])
    created_ids = []

    for item in state["tasks_to_create"]:
        try:
            await client.update_task(
                item["task_id"],
                {"assignedTo": item["assign_to_id"]},
            )
            created_ids.append(item["task_id"])
        except Exception:
            pass  # log and continue

    return {**state, "created_task_ids": created_ids}


# ── Graph Assembly ─────────────────────────────────────────────────────────

def build_planning_graph():
    """Compile and return the sprint planning graph (Phase 1 only)."""
    graph = StateGraph(SprintState)
    graph.add_node("fetch_data", fetch_data)
    graph.add_node("analyze_and_plan", analyze_and_plan)

    graph.set_entry_point("fetch_data")
    graph.add_edge("fetch_data", "analyze_and_plan")
    graph.add_edge("analyze_and_plan", END)

    return graph.compile()


def build_execution_graph():
    """Compile and return the task creation graph (Phase 2, after approval)."""
    graph = StateGraph(SprintState)
    graph.add_node("create_tasks", create_tasks)

    graph.set_entry_point("create_tasks")
    graph.add_edge("create_tasks", END)

    return graph.compile()


# ── Helpers ────────────────────────────────────────────────────────────────

def _extract_json_from_plan(text: str) -> list:
    """Parse the JSON assignment block from the LLM's response."""
    import re
    match = re.search(r"```json\s*(\[.*?\])\s*```", text, re.DOTALL)
    if not match:
        return []
    try:
        return json.loads(match.group(1))
    except json.JSONDecodeError:
        return []
