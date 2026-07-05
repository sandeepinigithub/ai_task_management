import { ChangeDetectorRef, Component, Injector, OnInit } from '@angular/core';
import { AppComponentBase } from '../../../../shared/common-shared/app-component-base';
import { TaskService } from '../../../../services/task-service';

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
  loading = false;

  summaryCards: SummaryCard[] = [];
  recentTasks: RecentTask[] = [];

  today = new Date();

  constructor(private injector: Injector, private _taskService: TaskService, private _cdr: ChangeDetectorRef) {
    super(injector)

  }

  ngOnInit(): void {
    this.getDashboardSummary();
    this.getRecentTasks();
  }

  getDashboardSummary() {
    this.loading = true;
    this._taskService.getDashboardSummary().subscribe({
      next: (res: any) => {
        const s = res?.data?.summary;
        if (s) {
          this.summaryCards = [
            { label: 'Total Tasks', value: s.total, icon: 'pi-clipboard', colorClass: 'bg-primary' },
            { label: 'Completed', value: s.completed, icon: 'pi-check-circle', colorClass: 'bg-success' },
            { label: 'In Progress', value: s.inprogress, icon: 'pi-spinner', colorClass: 'bg-info' },
            { label: 'Pending', value: s.pending, icon: 'pi-exclamation-triangle', colorClass: 'bg-danger' },
          ];
        }
      },
      error: () => {
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
        this._cdr.detectChanges();
      }
    });
  }

  getStatusSeverity(status: string): TagSeverity {
    const map: Record<string, TagSeverity> = {
      completed: 'success',
      inprogress: 'info',
      pending: 'warn',
    };
    return map[status] ?? 'secondary';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      completed: 'Completed',
      inprogress: 'Inprogress',
      pending: 'Pending',
    };
    return map[status] ?? status;
  }

  getRecentTasks() {
    this.loading = true;
    this._taskService.getRecentTasks().subscribe({
      next: (res: any) => {
        const tasks = res?.data?.tasks ?? [];
        this.recentTasks = tasks
      },
      error: () => {
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
         this._cdr.detectChanges();
      }
    });
  }
}
