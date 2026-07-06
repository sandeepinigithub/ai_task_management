"""
Phase 3 — LangChain Tools

Tools are functions the LLM agent can *choose* to call when it needs
real-world data or actions. Each tool has:
  - A name
  - A docstring (used as description — the LLM reads this to decide when to use it)
  - Type-annotated arguments (used to generate a JSON schema for the LLM)

The agent reasons: "The user asked to create a task → I should call create_task"
then constructs the arguments from conversation context.

Learning note:
  This is the bridge between the AI world and your existing Node.js API.
  The LLM never sees raw DB queries — it calls these typed Python functions,
  which in turn call the REST API with the user's own JWT token.
"""

import json
from langchain_core.tools import tool
from utils.node_api_client import NodeAPIClient


def create_task_tools(token: str) -> list:
    """
    Factory that creates a set of LangChain tools bound to a user's JWT token.
    Call this per-request so every agent action uses the requester's permissions.
    """
    client = NodeAPIClient(token)

    # ── Tool 1: Get Tasks ────────────────────────────────────────────────

    @tool
    async def get_my_tasks(status: str = "") -> str:
        """
        Retrieve tasks visible to the current user.
        Optionally filter by status: 'pending', 'inprogress', or 'completed'.
        Returns a JSON list of tasks with id, title, status, and assignee.
        """
        params = {}
        if status and status in ("pending", "inprogress", "completed"):
            params["status"] = status

        response = await client.get_tasks(**params)
        tasks = response.get("data", {}).get("docs", [])

        return json.dumps([
            {
                "id": t["_id"],
                "title": t["title"],
                "status": t["status"],
                "description": t.get("description", ""),
                "assignedTo": t.get("assignedTo", {}).get("username", "") if isinstance(t.get("assignedTo"), dict) else "",
            }
            for t in tasks
        ])

    # ── Tool 2: Create Task ──────────────────────────────────────────────

    @tool
    async def create_task(title: str, assigned_to_id: str, description: str = "") -> str:
        """
        Create a new task and assign it to a user.
        Requires the title, the user ID to assign it to (get from get_team_members),
        and an optional description.
        Always confirm with the user before calling this.
        """
        response = await client.create_task({
            "title": title,
            "description": description,
            "assignedTo": assigned_to_id,
        })
        task = response.get("data", {})
        return json.dumps({"created": True, "task_id": task.get("_id"), "title": task.get("title")})

    # ── Tool 3: Update Task Status ───────────────────────────────────────

    @tool
    async def update_task_status(task_id: str, status: str) -> str:
        """
        Update the status of a task.
        Valid statuses: 'pending', 'inprogress', 'completed'.
        Requires the task ID (get from get_my_tasks).
        """
        if status not in ("pending", "inprogress", "completed"):
            return json.dumps({"error": "Invalid status. Use: pending, inprogress, completed"})

        response = await client.update_task(task_id, {"status": status})
        task = response.get("data", {})
        return json.dumps({"updated": True, "task_id": task.get("_id"), "new_status": task.get("status")})

    # ── Tool 4: Get Team Members ─────────────────────────────────────────

    @tool
    async def get_team_members() -> str:
        """
        Get a list of users accessible to the current user (scoped by role).
        Returns id, username, and role for each user.
        Use the 'id' field when assigning tasks.
        """
        response = await client.get_master_user_list()
        users = response.get("data", [])
        return json.dumps([
            {"id": u["_id"], "username": u["username"], "role": u["role"]}
            for u in users
        ])

    # ── Tool 5: Dashboard Summary ────────────────────────────────────────

    @tool
    async def get_dashboard_summary() -> str:
        """
        Get a high-level summary of task counts by status.
        Useful for answering questions like 'How many tasks are pending?'
        """
        response = await client.get_dashboard_summary()
        return json.dumps(response.get("data", {}))

    return [
        get_my_tasks,
        create_task,
        update_task_status,
        get_team_members,
        get_dashboard_summary,
    ]
