"""
Phase 3 — LangChain Agent: Conversational Task Manager

Uses langgraph.prebuilt.create_react_agent — the modern replacement for
the old create_tool_calling_agent + AgentExecutor pattern (removed in LangChain 1.x).

create_react_agent compiles a small LangGraph internally:
  [LLM] → decides tool calls → [Tools] → result back to LLM → repeat until done

Supports multi-turn conversation via the `history` field.

Teaches: Tool calling agents, ReAct reasoning loop, chat history.
"""

from fastapi import APIRouter, Header
from pydantic import BaseModel
from langgraph.prebuilt import create_react_agent
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from tools.task_tools import create_task_tools
from utils.llm import get_llm

router = APIRouter(prefix="/agent", tags=["Phase 3 — LangChain Agent"])

SYSTEM_PROMPT = """You are an AI-powered task management assistant.
You have access to tools to view, create, and update tasks.

Guidelines:
- Always fetch current data before answering questions about tasks
- For create/update actions: confirm the details before executing
- Be concise and action-oriented
- If you don't have permission for an action, explain why"""


class Message(BaseModel):
    role: str       # "human" or "ai"
    content: str


class AgentRequest(BaseModel):
    message: str
    history: list[Message] = []     # previous turns for multi-turn conversation


# ── POST /ai/agent ─────────────────────────────────────────────────────────

@router.post("/")
async def run_agent(request: AgentRequest, authorization: str = Header(...)):
    """
    Conversational agent that manages tasks via natural language.

    Example interactions:
      "Show me all my pending tasks"
      "Create a task for John to review the API documentation"
      "Mark task <id> as completed"
      "How many tasks does my team have in progress?"

    The agent decides which tools to call — you don't hardcode the flow.
    """
    token = authorization.removeprefix("Bearer ")

    # Tools created per-request so they use this user's JWT token
    tools = create_task_tools(token)
    llm = get_llm(temperature=0.2)

    # create_react_agent compiles a ReAct loop graph internally.
    # 'prompt' here sets the system message for the agent.
    agent = create_react_agent(llm, tools, prompt=SYSTEM_PROMPT)

    # Build the full message list: system + history + current message
    messages = []
    for msg in request.history:
        if msg.role == "human":
            messages.append(HumanMessage(content=msg.content))
        else:
            messages.append(AIMessage(content=msg.content))

    messages.append(HumanMessage(content=request.message))

    result = await agent.ainvoke({"messages": messages})

    # The last message in the result is the final AI response
    reply = result["messages"][-1].content

    return {
        "reply": reply,
        "history": [
            *[{"role": m.role, "content": m.content} for m in request.history],
            {"role": "human", "content": request.message},
            {"role": "ai", "content": reply},
        ],
    }
