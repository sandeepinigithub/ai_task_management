// ─────────────────────────────────────────────────────────────────────────────
// Phase 1 — LLM Chat
// ─────────────────────────────────────────────────────────────────────────────

export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  reply: string;
  task_count: number;
}

export interface SummarizeRequest {
  status?: 'pending' | 'inprogress' | 'completed' | '';
}

export interface SummarizeResponse {
  summary: string;
  task_count: number;
}

export interface AdviceResponse {
  advice: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Phase 2 — RAG Search
// ─────────────────────────────────────────────────────────────────────────────

export interface SearchRequest {
  query: string;
  top_k?: number;
  with_answer?: boolean;
}

export interface TaskSearchResult {
  task_id: string;
  title: string;
  status: 'pending' | 'inprogress' | 'completed';
  description: string;
  assigned_to: string;
  relevance_score: number;
}

export interface SearchResponse {
  answer: string;
  sources: TaskSearchResult[];
  source_count: number;
}

export interface IndexResponse {
  message: string;
  indexed: number;
  total_in_store: number;
}

export interface VectorStoreStats {
  indexed_tasks: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Phase 3 — LangChain Agent
// ─────────────────────────────────────────────────────────────────────────────

export interface AgentMessage {
  role: 'human' | 'ai';
  content: string;
}

export interface AgentRequest {
  message: string;
  history?: AgentMessage[];
}

export interface AgentResponse {
  reply: string;
  history: AgentMessage[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Phase 4 — LangGraph
// ─────────────────────────────────────────────────────────────────────────────

export interface SprintAssignment {
  task_id: string;
  assign_to_id: string;
  reason: string;
}

export interface SprintPlanResponse {
  success: boolean;
  plan: string;
  proposed_assignments: SprintAssignment[];
  pending_task_count: number;
  team_member_count: number;
  error?: string;
}

export interface SprintExecuteRequest {
  tasks_to_create: SprintAssignment[];
}

export interface SprintExecuteResponse {
  success: boolean;
  applied_count: number;
  task_ids: string[];
}

export interface EscalationRequest {
  stale_days?: number;
}

export interface EscalationReport {
  stale_task_count: number;
  stale_task_ids: string[];
  escalation_message: string;
  generated_at: string;
}

export interface EscalationResponse {
  success: boolean;
  message?: string;
  report: EscalationReport | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Health
// ─────────────────────────────────────────────────────────────────────────────

export interface AiHealthResponse {
  status: string;
  service: string;
  llm_provider: string;
  node_api_url: string;
}
