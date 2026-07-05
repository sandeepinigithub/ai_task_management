import { ChangeDetectorRef, Component, Injector, OnInit, signal } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { AppComponentBase } from '../../../../shared/common-shared/app-component-base';
import { TaskService } from '../../../../services/task-service';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { UserService } from '../../../../services/user-service';


@Component({
  selector: 'app-tasks',
  standalone: false,
  templateUrl: './tasks.html',
  styleUrl: './tasks.scss',
})
export class Tasks extends AppComponentBase implements OnInit {

  first = 0;
  page = 1;
  limit = 10;

  searchText = '';
  selectedStatus = '';
  assignedTo = '';
  createdBy = '';

  searchSubject: any = new Subject();

  private pageRecords: any[] = [];

  readonly statusOptions = [
    { label: 'Pending', value: 'pending' },
    { label: 'In Progress', value: 'inprogress' },
    { label: 'Completed', value: 'completed' },
  ];

  menuItems = signal<MenuItem[]>([
    { label: 'Refresh', icon: 'pi pi-refresh', command: () => this.loadTasks() },
  ]);

  userOptions: any = []

  constructor(injector: Injector, private taskService: TaskService, private _userService: UserService, private _cdr: ChangeDetectorRef) {
    super(injector);
  }

  ngOnInit(): void {
    this.loadMasterUsers()
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.loadTasks();
    })
  }

  onLazyLoad(event: any): void {
    this.limit = event.rows ?? this.limit;
    this.page = Math.floor((event.first ?? 0) / this.limit) + 1;
    this.first = event.first ?? 0;
    this.loadTasks();
  }

  loadTasks(): void {
    this.primengTableHelper.showLoadingIndicator();
    const params: any = {
      page: this.page,
      limit: this.limit,
    };
    if (this.selectedStatus) {
      params['status'] = this.selectedStatus;
    }
    if (this.assignedTo) {
      params['assignedTo'] = this.assignedTo;
    }
    if (this.createdBy) {
      params['createdBy'] = this.createdBy;
    }
    if (this.searchText.trim().length > 0) {
      params['search'] = this.searchText;
    }

    this.taskService.getTasks(params).subscribe({
      next: (res: any) => {
        this.pageRecords = res?.data?.tasks ?? [];
        this.primengTableHelper.records = [...this.pageRecords];
        this.primengTableHelper.totalRecordsCount = res?.meta?.total ?? 0;
      },
      error: () => {
        this._messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not load tasks.' });
      },
      complete: () => {
        this.primengTableHelper.hideLoadingIndicator();
        this._cdr.detectChanges();
      },
    });
  }

  onSearch(): void {
    this.page = 1;
    this.first = 0;
    this.searchSubject.next(this.searchText);
  }
  filterChange() {
    this.page = 1;
    this.first = 0;
    this.loadTasks();

  }

  clearFilters(): void {
    this.searchText = '';
    this.selectedStatus = '';
    this.createdBy = '';
    this.assignedTo = '';
    this.page = 1;
    this.first = 0;
    this.loadTasks();
  }

  openNewTask(): void {
    this._router.navigate(['/portal/task-management/tasks/new']);
  }

  viewTask(task: any): void {
    this._router.navigate(['/portal/task-management/tasks', task._id]);
  }

  openEditTask(task: any): void {
    this._router.navigate(['/portal/task-management/tasks', task._id, 'edit']);
  }

  deleteTask(task: any): void {
    this.taskService.deleteTask(task._id).subscribe({
      next: () => {
        this.pageRecords = this.pageRecords.filter(t => t._id !== task._id);
        this.primengTableHelper.totalRecordsCount = Math.max(0, this.primengTableHelper.totalRecordsCount - 1);
        this._messageService.add({ severity: 'success', summary: 'Deleted', detail: `"${task.title}" deleted.` });
      },
      error: (err: any) => {
        const msg = err?.error?.message || 'Failed to delete task.';
        this._messageService.add({ severity: 'error', summary: 'Error', detail: msg });
      },
    });
  }

  getStatusSeverity(status: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' {
    const map: Record<string, 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast'> = { completed: 'success', inprogress: 'info', pending: 'warn' };
    return map[status] ?? 'secondary';
  }

  getStatusLabel(status: string): string {
    const map: any = { completed: 'Completed', inprogress: 'In Progress', pending: 'Pending' };
    return map[status] ?? status;
  }

  loadMasterUsers(): void {
    this._userService.getUsersMasterList().subscribe({
      next: (res: any) => {
        const users: any[] = res?.data?.users ?? res?.data ?? [];
        this.userOptions = users.map((u: any) => ({
          label: `${u._id == this.userDetails?._id ? 'Me' : u.username + ' (' + u.role.toUpperCase() + ')'}`,
          value: String(u._id),
        }));
        this._cdr.detectChanges();
      },
      error: () => {
        this._messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Could not load users.' });
      },
    });
  }
}
