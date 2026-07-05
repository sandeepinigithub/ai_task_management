import { ChangeDetectorRef, Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppComponentBase } from '../../../../shared/common-shared/app-component-base';
import { UserService } from '../../../../services/user-service';

@Component({
  selector: 'app-user-form',
  standalone: false,
  templateUrl: './user-form.html',
  styleUrl: './user-form.scss',
})
export class UserForm extends AppComponentBase implements OnInit {

  form!: FormGroup;
  loading = false;
  submitting = false;
  isEditMode = false;
  showPassword = false;

  managerOptions: { label: string; value: string }[] = [];
  teamLeadOptions: { label: string; value: string }[] = [];
  allUsers: any[] = [];

  private readonly allRoleOptions = [
    { label: 'Manager', value: 'manager' },
    { label: 'Team Lead', value: 'teamlead' },
    { label: 'Employee', value: 'employee' },
  ];

  get roleOptions() {
    const role = this.userDetails?.role;
    if (role === 'manager') return this.allRoleOptions.filter(r => r.value !== 'manager');
    if (role === 'teamlead') return this.allRoleOptions.filter(r => r.value === 'employee');
    return this.allRoleOptions;
  }

  get selectedRole(): string { return this.form?.get('role')?.value ?? ''; }

  constructor(injector: Injector, private fb: FormBuilder, private userService: UserService, private _cdr: ChangeDetectorRef) {
    super(injector);
  }

  ngOnInit(): void {
    this.isEditMode = !!this.id;

    this.form = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required],
      password: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(6)]],
      managerId: [null],
      teamLeadId: [null],
      isActive: [true],
    });

    this.loadAllUsers();

    if (this.isEditMode && this.id) {
      this.loadUser(this.id);
    }
  }

  private loadAllUsers(): void {
    this.userService.getUsers().subscribe({
      next: (res: any) => {
        this.allUsers = res?.data?.users ?? res?.data ?? [];
        this.managerOptions = this.allUsers.filter(u => u.role === 'manager').map(u => ({ label: u.username, value: u._id }));
        this.teamLeadOptions = this.allUsers.filter(u => u.role === 'teamlead').map(u => ({ label: u.username, value: u._id }));
        this._cdr.detectChanges();
      },
      error: () => { },
    });
  }

  private loadUser(id: string): void {
    this.loading = true;
    this.userService.getUserById(id).subscribe({
      next: (res: any) => {
        const user = res?.data?.user ?? res?.data ?? res;
        this.form.patchValue({
          username: user.username,
          email: user.email,
          role: user.role,
          managerId: user.managerId?._id ?? user.managerId,
          teamLeadId: user.teamLeadId?._id ?? user.teamLeadId,
          isActive: user.isActive ?? true,
        });
        this.loading = false;
        this._cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this._messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not load user.' });
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting = true;

    const payload: any = { ...this.form.value };
    if (this.isEditMode && !payload.password) delete payload.password;
    if (this.selectedRole !== 'employee') delete payload.teamLeadId;
    if (this.selectedRole !== 'teamlead') delete payload.managerId;

    const request$ = this.isEditMode && this.id
      ? this.userService.updateUser(this.id, payload)
      : this.userService.createUser(payload);

    request$.subscribe({
      next: () => {
        this._messageService.add({
          severity: 'success', summary: 'Success',
          detail: this.isEditMode ? 'User updated successfully.' : 'User created successfully.',
        });
        setTimeout(() => this.routerNavigate('portal/user-management/users'), 800);
      },
      error: (err: any) => {
        this.submitting = false;
        const msg = err?.error?.message || 'Something went wrong.';
        this._messageService.add({ severity: 'error', summary: 'Error', detail: msg });
      },
      complete: () => { this.submitting = false; },
    });
  }
}
