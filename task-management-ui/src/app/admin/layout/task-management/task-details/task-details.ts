import { ChangeDetectorRef, Component, Injector, OnInit } from '@angular/core';
import { AppComponentBase } from '../../../../shared/common-shared/app-component-base';
import { TaskService } from '../../../../services/task-service';

@Component({
  selector: 'app-task-details',
  standalone: false,
  templateUrl: './task-details.html',
  styleUrl: './task-details.scss',
})
export class TaskDetails extends AppComponentBase implements OnInit {

  task: any = null;
  loading = false;

  constructor(injector: Injector, private taskService: TaskService, private _cdr: ChangeDetectorRef) {
    super(injector);
  }

  ngOnInit(): void {
    if (this.id) {
      this.loadTask(this.id);
    }
  }

  private loadTask(id: string): void {
    this.loading = true;
    this.taskService.getTaskById(id).subscribe({
      next: (res: any) => {
        this.task = res?.data?.task ?? res?.data ?? res;

      },
      error: () => {

        this._messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not load task details.' });
      },
      complete: () => {
        this.loading = false;
        this._cdr.detectChanges();
      }
    });
  }


  formatDate(date: string): string {
    return date ? new Date(date).toLocaleString() : '—';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = { pending: 'Pending', inprogress: 'In Progress', completed: 'Completed' };
    return map[status] ?? status;
  }

  getStatusSeverity(status: string): 'warn' | 'info' | 'success' | 'secondary' {
    const map: Record<string, 'warn' | 'info' | 'success' | 'secondary'> = {
      pending: 'warn', inprogress: 'info', completed: 'success',
    };
    return map[status] ?? 'secondary';
  }
}
