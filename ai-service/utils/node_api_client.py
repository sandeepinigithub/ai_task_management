"""
HTTP client for calling the Node.js Task Management API.

The ai-service NEVER touches MongoDB directly.
All data access goes through the existing REST API,
which enforces JWT auth and role-based access automatically.
"""

import httpx
from config import settings


class NodeAPIClient:
    """Async HTTP client scoped to a single user's JWT token."""

    def __init__(self, token: str):
        self.base_url = settings.NODE_API_URL
        self.headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        }

    # ── Tasks ──────────────────────────────────────────────────────────────

    async def get_tasks(self, **params) -> dict:
        """GET /api/tasks — role-scoped list with optional filters."""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/tasks",
                headers=self.headers,
                params=params,
                timeout=10.0,
            )
            response.raise_for_status()
            return response.json()

    async def get_task_by_id(self, task_id: str) -> dict:
        """GET /api/tasks/:id"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/tasks/{task_id}",
                headers=self.headers,
                timeout=10.0,
            )
            response.raise_for_status()
            return response.json()

    async def create_task(self, task_data: dict) -> dict:
        """POST /api/tasks"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/tasks",
                headers=self.headers,
                json=task_data,
                timeout=10.0,
            )
            response.raise_for_status()
            return response.json()

    async def update_task(self, task_id: str, updates: dict) -> dict:
        """PATCH /api/tasks/:id"""
        async with httpx.AsyncClient() as client:
            response = await client.patch(
                f"{self.base_url}/tasks/{task_id}",
                headers=self.headers,
                json=updates,
                timeout=10.0,
            )
            response.raise_for_status()
            return response.json()

    async def get_dashboard_summary(self) -> dict:
        """GET /api/tasks/dashboard/summary — role-wise counts."""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/tasks/dashboard/summary",
                headers=self.headers,
                timeout=10.0,
            )
            response.raise_for_status()
            return response.json()

    # ── Users ──────────────────────────────────────────────────────────────

    async def get_users(self) -> dict:
        """GET /api/users — manager sees all, teamlead sees their team."""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/users",
                headers=self.headers,
                timeout=10.0,
            )
            response.raise_for_status()
            return response.json()

    async def get_master_user_list(self) -> dict:
        """GET /api/users/master-list — flat list, all roles can call."""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/users/master-list",
                headers=self.headers,
                timeout=10.0,
            )
            response.raise_for_status()
            return response.json()
