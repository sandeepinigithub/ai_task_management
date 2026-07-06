"""
LLM factory — returns the configured chat model.

Swap LLM_PROVIDER in .env between "groq" and "openai" without
changing any chain or graph code.

Learning note:
  Both ChatGroq and ChatOpenAI implement the same BaseChatModel interface,
  so all LangChain chains, tools, and graphs work identically with either.
"""

from langchain_groq import ChatGroq
from langchain_openai import ChatOpenAI
from config import settings


def get_llm(temperature: float = 0.3):
    """
    Returns a configured LangChain chat model.

    Args:
        temperature: 0.0 = deterministic, 1.0 = creative.
                     Use low values for task reasoning, higher for summaries.
    """
    if settings.LLM_PROVIDER == "groq":
        return ChatGroq(
            api_key=settings.GROQ_API_KEY,
            model=settings.GROQ_MODEL,
            temperature=temperature,
        )

    return ChatOpenAI(
        api_key=settings.OPENAI_API_KEY,
        model=settings.OPENAI_MODEL,
        temperature=temperature,
    )
