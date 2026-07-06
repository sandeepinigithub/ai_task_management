"""
Phase 2 — RAG: Vector Store for Task Embeddings

How RAG works here:
  1. INDEX: Each task's title + description is converted into a
     numerical vector (embedding) and stored in Chroma DB.

  2. SEARCH: When the user queries ("find payment-related tasks"),
     the query is also embedded, and Chroma finds the task vectors
     closest to it using cosine similarity — no keyword matching needed.

  3. AUGMENT: Top-K matching tasks are injected into the LLM prompt
     as context, so the LLM can answer grounded in real data.

Learning note:
  An "embedding" is a list of ~384 numbers that captures the *meaning*
  of a text. Similar meanings = similar vectors = close in vector space.
"""

from sentence_transformers import SentenceTransformer
import chromadb
from config import settings


class TaskVectorStore:
    """Wraps a Chroma collection for task semantic search."""

    COLLECTION_NAME = "tasks"

    def __init__(self):
        # PersistentClient saves embeddings to disk (survives restarts)
        self.chroma = chromadb.PersistentClient(path=settings.CHROMA_DB_PATH)
        self.collection = self.chroma.get_or_create_collection(
            name=self.COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"},  # cosine similarity
        )
        # Loads a small but capable model (~90MB, auto-downloaded)
        self.encoder = SentenceTransformer(settings.EMBEDDING_MODEL)

    # ── Indexing ───────────────────────────────────────────────────────────

    def index_tasks(self, tasks: list) -> int:
        """
        Embed and upsert tasks into Chroma.
        Call this after tasks are created or updated (or via /search/index).
        """
        if not tasks:
            return 0

        documents, metadatas, ids, embeddings = [], [], [], []

        for task in tasks:
            # Combine title + description for richer embeddings
            text = f"{task['title']}. {task.get('description', '')}".strip()
            documents.append(text)

            metadatas.append({
                "task_id": str(task["_id"]),
                "title": task["title"],
                "status": task["status"],
                "description": task.get("description", ""),
                "assigned_to": task.get("assignedTo", {}).get("username", "") if isinstance(task.get("assignedTo"), dict) else "",
            })

            ids.append(str(task["_id"]))

        # Batch encode all texts at once (much faster than one by one)
        vectors = self.encoder.encode(documents, show_progress_bar=False)
        embeddings = vectors.tolist()

        # upsert = insert or update (idempotent — safe to re-index)
        self.collection.upsert(
            documents=documents,
            embeddings=embeddings,
            metadatas=metadatas,
            ids=ids,
        )

        return len(tasks)

    def remove_task(self, task_id: str) -> None:
        """Remove a single task from the vector store."""
        self.collection.delete(ids=[task_id])

    # ── Querying ───────────────────────────────────────────────────────────

    def search(self, query: str, k: int = 5) -> list[dict]:
        """
        Semantic similarity search.

        Args:
            query: Natural language query, e.g. "payment gateway issues"
            k:     Number of results to return

        Returns:
            List of task metadata dicts, ordered by relevance.
        """
        query_vector = self.encoder.encode([query]).tolist()

        results = self.collection.query(
            query_embeddings=query_vector,
            n_results=min(k, self.collection.count() or 1),
            include=["metadatas", "distances"],
        )

        items = []
        if results["metadatas"]:
            for meta, distance in zip(results["metadatas"][0], results["distances"][0]):
                items.append({
                    **meta,
                    "relevance_score": round(1 - distance, 3),  # cosine: 1=identical
                })

        return items

    def count(self) -> int:
        return self.collection.count()
