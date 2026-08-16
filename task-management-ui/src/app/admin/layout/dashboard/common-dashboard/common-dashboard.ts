import { ChangeDetectorRef, Component, ElementRef, Injector, OnInit, ViewChild } from '@angular/core';
import { AppComponentBase } from '../../../../shared/common-shared/app-component-base';
import { TaskService } from '../../../../services/task-service';
import { AiService } from '../../../../services/ai-service';
import { AgentMessage } from '../../../../shared/models/ai.models';

type TagSeverity = 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast';

interface SummaryCard {
  label: string;
  value: number;
  icon: string;
  colorClass: string;
}

interface RecentTask {
  id: string;
  title: string;
  assignee: string;
  createdBy: string;
  status: 'completed' | 'inprogress' | 'pending';
}

@Component({
  selector: 'app-common-dashboard',
  standalone: false,
  templateUrl: './common-dashboard.html',
  styleUrl: './common-dashboard.scss',
})
export class CommonDashboard extends AppComponentBase implements OnInit {
  @ViewChild('chatBody') chatBody!: ElementRef;

  // ── Existing dashboard state ───────────────────────────────────────────

  loading = false;
  summaryCards: SummaryCard[] = [];
  recentTasks: RecentTask[] = [];
  today = new Date();

  // ── AI Assistant state ─────────────────────────────────────────────────

  aiAdvice = '';
  aiAdviceLoading = false;

  chatMessages: AgentMessage[] = [];
  chatInput = '';
  chatLoading = false;
  streamingText = '';       // accumulates tokens during streaming
  isStreaming = false;

  constructor(
    private injector: Injector,
    private _taskService: TaskService,
    private _aiService: AiService,
    private _cdr: ChangeDetectorRef
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.getDashboardSummary();
    this.getRecentTasks();
    this.loadPriorityAdvice();
  }

  // ── Existing methods ───────────────────────────────────────────────────

  getDashboardSummary() {
    this.loading = true;
    this._taskService.getDashboardSummary().subscribe({
      next: (res: any) => {
        const s = res?.data?.summary;
        if (s) {
          this.summaryCards = [
            { label: 'Total Tasks',  value: s.total,     icon: 'pi-clipboard',         colorClass: 'bg-primary' },
            { label: 'Completed',    value: s.completed, icon: 'pi-check-circle',       colorClass: 'bg-success' },
            { label: 'In Progress',  value: s.inprogress,icon: 'pi-spinner',            colorClass: 'bg-info'    },
            { label: 'Pending',      value: s.pending,   icon: 'pi-exclamation-triangle',colorClass: 'bg-danger' },
          ];
        }
      },
      error: () => { this.loading = false; },
      complete: () => { this.loading = false; this._cdr.detectChanges(); }
    });
  }

  getRecentTasks() {
    this.loading = true;
    this._taskService.getRecentTasks().subscribe({
      next: (res: any) => { this.recentTasks = res?.data?.tasks ?? []; },
      error: () => { this.loading = false; },
      complete: () => { this.loading = false; this._cdr.detectChanges(); }
    });
  }

  getStatusSeverity(status: string): TagSeverity {
    const map: Record<string, TagSeverity> = { completed: 'success', inprogress: 'info', pending: 'warn' };
    return map[status] ?? 'secondary';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = { completed: 'Completed', inprogress: 'Inprogress', pending: 'Pending' };
    return map[status] ?? status;
  }

  // ── AI: Priority Advice ────────────────────────────────────────────────

  loadPriorityAdvice(): void {
    this.aiAdviceLoading = true;
    this._aiService.getPriorityAdvice().subscribe({
      next: (res) => { this.aiAdvice = res.advice; },
      error: () => { this.aiAdvice = 'Could not load AI advice. Make sure the AI service is running.'; },
      complete: () => { this.aiAdviceLoading = false; this._cdr.detectChanges(); }
    });
  }

  // ── AI: Chat ───────────────────────────────────────────────────────────

  sendMessage(): void {
    const message = this.chatInput.trim();
    if (!message || this.isStreaming) return;

    // Add user message to chat
    this.chatMessages.push({ role: 'human', content: message });
    this.chatInput = '';
    this.isStreaming = true;
    this.streamingText = '';
    this._cdr.detectChanges();
    this.scrollChatToBottom();

    // Stream response token by token — creates the typewriter effect
    this._aiService.chatStream(
      message,
      (chunk) => {
        this.streamingText += chunk;
        this._cdr.detectChanges();
        this.scrollChatToBottom();
      },
      () => {
        // Streaming done — commit to message history
        this.chatMessages.push({ role: 'ai', content: this.streamingText });
        this.streamingText = '';
        this.isStreaming = false;
        this._cdr.detectChanges();
        this.scrollChatToBottom();
      }
    );
  }

  onChatKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  clearChat(): void {
    this.chatMessages = [];
    this.streamingText = '';
    this.isStreaming = false;
  }

  private scrollChatToBottom(): void {
    setTimeout(() => {
      if (this.chatBody?.nativeElement) {
        this.chatBody.nativeElement.scrollTop = this.chatBody.nativeElement.scrollHeight;
      }
    }, 0);
  }
}
