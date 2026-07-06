"""
Phase 3 — LangChain: LCEL Chains

LangChain Expression Language (LCEL) composes components using the `|` pipe:
  PromptTemplate | LLM | OutputParser

Each component is a Runnable — they share a common interface (.invoke,
.ainvoke, .stream, .batch), making them composable and swappable.

This module provides two reusable chains:
  1. task_summary_chain  — summarizes a list of tasks
  2. priority_advice_chain — gives priority recommendations
"""

import json
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from utils.llm import get_llm


# ── Chain 1: Task Summary ──────────────────────────────────────────────────

_SUMMARY_PROMPT = ChatPromptTemplate.from_messages([
    (
        "system",
        """You are a task management analyst.
Analyze the given tasks and produce a structured summary covering:
- Total count and breakdown by status (pending / inprogress / completed)
- Top 3 priorities worth focusing on
- Any patterns or concerns (e.g. too many pending, blocked work)

Be concise — under 200 words. Use bullet points.""",
    ),
    ("human", "Tasks:\n{tasks_json}"),
])

# LCEL chain: prompt → LLM → plain string output
# Learning note: StrOutputParser simply extracts .content from the AIMessage
task_summary_chain = _SUMMARY_PROMPT | get_llm(temperature=0.3) | StrOutputParser()


async def summarize_tasks(tasks: list) -> str:
    """
    Summarize a list of task dicts in natural language.

    Usage:
        tasks = [{"title": "Fix bug", "status": "pending"}, ...]
        summary = await summarize_tasks(tasks)
    """
    trimmed = [
        {"title": t["title"], "status": t["status"], "description": t.get("description", "")}
        for t in tasks[:30]  # cap context window
    ]
    return await task_summary_chain.ainvoke({"tasks_json": json.dumps(trimmed, indent=2)})


# ── Chain 2: Priority Advice ───────────────────────────────────────────────

_PRIORITY_PROMPT = ChatPromptTemplate.from_messages([
    (
        "system",
        """You are a productivity coach for software teams.
Given the user's pending and in-progress tasks, recommend what they should
work on today and why. Consider task age and description keywords.

Keep it to 3-5 bullet points.""",
    ),
    ("human", "My tasks:\n{tasks_json}\n\nWhat should I focus on today?"),
])

priority_advice_chain = _PRIORITY_PROMPT | get_llm(temperature=0.4) | StrOutputParser()


async def get_priority_advice(tasks: list) -> str:
    """
    Given a task list, return today's focus recommendations.
    """
    active = [
        {"title": t["title"], "status": t["status"], "description": t.get("description", ""), "created": t.get("createdAt", "")}
        for t in tasks
        if t.get("status") in ("pending", "inprogress")
    ][:20]

    return await priority_advice_chain.ainvoke({"tasks_json": json.dumps(active, indent=2)})
