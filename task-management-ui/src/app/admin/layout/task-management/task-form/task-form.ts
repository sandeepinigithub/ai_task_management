import { ChangeDetectorRef, Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AppComponentBase } from '../../../../shared/common-shared/app-component-base';
import { TaskService } from '../../../../services/task-service';
import { UserService } from '../../../../services/user-service';

@Component({
  selector: 'app-task-form',
  standalone: false,
  templateUrl: './task-form.html',
  styleUrl: './task-form.scss',
})
export class TaskForm extends AppComponentBase implements OnInit {

  form!: FormGroup;
  loading = false;
  submitting = false;

  isEditMode = false;
  taskId: string | null = null;

  userOptions: { label: string; value: string }[] = [];

  readonly statusOptions = [
    { label: 'Pending', value: 'pending' },
    { label: 'In Progress', value: 'inprogress' },
    { label: 'Completed', value: 'completed' },
  ];

  // Current logged-in user role
  get currentRole(): string {
    return this.userDetails?.role ?? '';
  }

  get canAssign(): boolean {
    return this.currentRole === 'manager' || this.currentRole === 'teamlead';
  }

  constructor(
    injector: Injector,
    private fb: FormBuilder,
    private taskService: TaskService,
    private userService: UserService,
    private _cdr: ChangeDetectorRef
  ) {
    super(injector);
    this.formInitialisation();
  }

  ngOnInit(): void {
    this.taskId = this.id;
    this.isEditMode = !!this.taskId;

    if (this.isEditMode && this.taskId) {
      this.loadTask(this.taskId);
    } else if (this.canAssign) {
      this.loadMasterUsers();
    }
  }

  formInitialisation() {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      status: ['pending', Validators.required],
      assignedTo: [String(this.userDetails?._id), Validators.required],
    });
  }

  private loadMasterUsers(): void {
    this.userService.getUsersMasterList().subscribe({
      next: (res: any) => {
        const users: any[] = res?.data?.users ?? res?.data ?? [];
        this.userOptions = users.map((u: any) => ({
          label: `${u._id == this.userDetails?._id ? 'Me' : u.username + ' (' + u.role.toUpperCase() + ')' }`,
          value: String(u._id),
        }));
        this._cdr.detectChanges();
      },
      error: () => {
        this._messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Could not load users.' });
      },
    });
  }

  private loadTask(id: string): void {
    this.loading = true;

    const users$ = this.canAssign ? this.userService.getUsersMasterList() : null;
    const task$ = this.taskService.getTaskById(id);

    if (users$) {
      forkJoin({ users: users$, task: task$ }).subscribe({
        next: ({ users, task: res }: any) => {
          this.userOptions = (users?.data?.users ?? users?.data ?? []).map((u: any) => ({
            label: `${u.username} (${u.role})`,
            value: String(u._id),
          }));
          const task = res?.data?.task;
          this.form.patchValue({
            title: task.title,
            description: task.description,
            status: task.status,
            assignedTo: String(task.assignedTo?._id),
          });
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this._messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not load task.' });
        },
      });
    } else {
      task$.subscribe({
        next: (res: any) => {
          const task = res?.data?.task ?? res?.data ?? res;
          this.form.patchValue({
            title: task.title,
            description: task.description,
            status: task.status,
          });
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this._messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not load task.' });
        },
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const payload = { ...this.form.value };

    // Employees cannot assign/reassign
    if (!this.canAssign) {
      delete payload.assignedTo;
    }

    const request$ = this.isEditMode && this.taskId
      ? this.taskService.updateTask(this.taskId, payload)
      : this.taskService.createTask(payload);

    request$.subscribe({
      next: () => {
        this._messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: this.isEditMode ? 'Task updated successfully.' : 'Task created successfully.',
        });
        setTimeout(() => this.routerNavigate('portal/task-management/tasks'), 800);
      },
      error: (err: any) => {
        this.submitting = false;
        const msg = err?.error?.message || 'Something went wrong. Please try again.';
        this._messageService.add({ severity: 'error', summary: 'Error', detail: msg });
      },
      complete: () => {
        this.submitting = false;
      },
    });
  }
}
