import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  AdviceResponse,
  AgentRequest,
  AgentResponse,
  AiHealthResponse,
  ChatRequest,
  ChatResponse,
  EscalationRequest,
  EscalationResponse,
  IndexResponse,
  SearchRequest,
  SearchResponse,
  SprintExecuteRequest,
  SprintExecuteResponse,
  SprintPlanResponse,
  SummarizeRequest,
  SummarizeResponse,
  VectorStoreStats,
} from '../shared/models/ai.models';

@Injectable({ providedIn: 'root' })
export class AiService {
  private readonly base = environment.aiBaseUrl;

  constructor(private http: HttpClient) {}

  // ── Health ────────────────────────────────────────────────────────────────

  health(): Observable<AiHealthResponse> {
    return this.http.get<AiHealthResponse>(`${this.base}/health`);
  }

  // ── Phase 1: LLM Chat ─────────────────────────────────────────────────────

  /**
   * Contextual chat — LLM is aware of the user's tasks.
   * Example: "What should I focus on today?"
   */
  chat(payload: ChatRequest): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(`${this.base}/ai/chat/`, payload);
  }

  /**
   * AI-generated summary of task list, grouped by status.
   * Pass status to filter (leave empty for all tasks).
   */
  summarize(payload: SummarizeRequest = {}): Observable<SummarizeResponse> {
    return this.http.post<SummarizeResponse>(`${this.base}/ai/chat/summarize`, payload);
  }

  /**
   * Priority recommendations for the day based on pending/in-progress tasks.
   */
  getPriorityAdvice(): Observable<AdviceResponse> {
    return this.http.post<AdviceResponse>(`${this.base}/ai/chat/advice`, {});
  }

  /**
   * Streaming chat — returns tokens one by one via the Fetch API.
   * Use this for a ChatGPT-like typewriter effect in the UI.
   *
   * @param message  User's message
   * @param onChunk  Called for each streamed text chunk
   * @param onDone   Called when the stream is complete
   */
  chatStream(
    message: string,
    onChunk: (chunk: string) => void,
    onDone: () => void
  ): void {
    const token = sessionStorage.getItem('token');

    fetch(`${this.base}/ai/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message }),
    }).then(async (response) => {
      if (!response.body) return;
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) { onDone(); break; }
        onChunk(decoder.decode(value, { stream: true }));
      }
    });
  }

  // ── Phase 2: RAG Search ───────────────────────────────────────────────────

  /**
   * Embed all tasks into the Chroma vector store.
   * Call once on setup, then re-index after bulk changes.
   */
  indexTasks(): Observable<IndexResponse> {
    return this.http.post<IndexResponse>(`${this.base}/ai/search/index`, {});
  }

  /**
   * Semantic search over tasks using vector similarity + LLM answer.
   * Example: "Find tasks related to the payment module"
   */
  semanticSearch(payload: SearchRequest): Observable<SearchResponse> {
    return this.http.post<SearchResponse>(`${this.base}/ai/search/`, payload);
  }

  /**
   * How many tasks are currently indexed in the vector store.
   */
  getVectorStoreStats(): Observable<VectorStoreStats> {
    return this.http.get<VectorStoreStats>(`${this.base}/ai/search/stats`);
  }

  // ── Phase 3: LangChain Agent ──────────────────────────────────────────────

  /**
   * Conversational agent that can view, create, and update tasks.
   * Pass previous history for multi-turn conversations.
   * Example: "Create a task for John to review the login flow"
   */
  runAgent(payload: AgentRequest): Observable<AgentResponse> {
    return this.http.post<AgentResponse>(`${this.base}/ai/agent/`, payload);
  }

  // ── Phase 4: LangGraph ────────────────────────────────────────────────────

  /**
   * Generate a sprint plan (Phase 1 of 2 — returns plan for review).
   * Fetches pending tasks + team, LLM proposes assignments.
   * Manager reviews before calling sprintExecute().
   */
  sprintPlan(): Observable<SprintPlanResponse> {
    return this.http.post<SprintPlanResponse>(`${this.base}/ai/graphs/sprint/plan`, {});
  }

  /**
   * Apply an approved sprint plan (Phase 2 of 2).
   * Pass the proposed_assignments array from sprintPlan() after review.
   */
  sprintExecute(payload: SprintExecuteRequest): Observable<SprintExecuteResponse> {
    return this.http.post<SprintExecuteResponse>(`${this.base}/ai/graphs/sprint/execute`, payload);
  }

  /**
   * Automated escalation: finds stale pending tasks and drafts a manager notice.
   * @param staleDays  Flag tasks pending longer than this many days (default: 3)
   */
  runEscalation(payload: EscalationRequest = {}): Observable<EscalationResponse> {
    return this.http.post<EscalationResponse>(`${this.base}/ai/graphs/escalate`, payload);
  }
}
