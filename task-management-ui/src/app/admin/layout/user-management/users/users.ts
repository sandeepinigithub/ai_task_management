import { ChangeDetectorRef, Component, Injector, OnInit, signal } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { AppComponentBase } from '../../../../shared/common-shared/app-component-base';
import { UserService } from '../../../../services/user-service';

type TagSeverity = 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast';

@Component({
  selector: 'app-users',
  standalone: false,
  templateUrl: './users.html',
  styleUrl: './users.scss',
})
export class Users extends AppComponentBase implements OnInit {

  first = 0;
  searchText = '';
  selectedRole = '';
  loading = false

  private allUsers: any[] = [];

  readonly roleOptions = [
    { label: 'Manager', value: 'manager' },
    { label: 'Team Lead', value: 'teamlead' },
    { label: 'Employee', value: 'employee' },
  ];

  menuItems = signal<MenuItem[]>([
    { label: 'Refresh', icon: 'pi pi-refresh', command: () => this.loadUsers() },
  ]);

  constructor(injector: Injector, private userService: UserService, private _cdr: ChangeDetectorRef) {
    super(injector);
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getUsers().subscribe({
      next: (res: any) => {
        this.allUsers = res?.data?.users ?? res?.data ?? [];
        this.primengTableHelper.totalRecordsCount = res?.meta?.total ?? this.allUsers.length;
        this.applyFilters();
        this.loading = false;
        this._cdr.detectChanges();

      },
      error: () => {
        this._messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not load users.' });
        this.loading = false;
        this._cdr.detectChanges();
      },
      complete: () => {
        this.primengTableHelper.hideLoadingIndicator();
        this.loading = false;
        this._cdr.detectChanges();
      },
    });
  }

  onSearch(): void { this.applyFilters(); }

  applyFilters(): void {
    let result = [...this.allUsers];
    if (this.searchText.trim()) {
      const term = this.searchText.toLowerCase();
      result = result.filter(u =>
        u.username?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term)
      );
    }
    if (this.selectedRole) {
      result = result.filter(u => u.role === this.selectedRole);
    }
    this.primengTableHelper.records = result;
    this.primengTableHelper.totalRecordsCount = result.length;
    this.first = 0;
  }

  clearFilters(): void {
    this.searchText = '';
    this.selectedRole = '';
    this.applyFilters();
  }

  openNewUser(): void {
    this._router.navigate(['/portal/user-management/users/new']);
  }

  viewUser(user: any): void {
    this._router.navigate(['/portal/user-management/users', user._id]);
  }

  openEditUser(user: any): void {
    this._router.navigate(['/portal/user-management/users', user._id, 'edit']);
  }

  deleteUser(user: any): void {
    this.userService.deleteUser(user._id).subscribe({
      next: () => {
        this.allUsers = this.allUsers.filter(u => u._id !== user._id);
        this.applyFilters();
        this._messageService.add({ severity: 'success', summary: 'Deleted', detail: `"${user.username}" deleted.` });
      },
      error: (err: any) => {
        const msg = err?.error?.message || 'Failed to delete user.';
        this._messageService.add({ severity: 'error', summary: 'Error', detail: msg });
      },
    });
  }

  getRoleSeverity(role: string): TagSeverity {
    const map: Record<string, TagSeverity> = { manager: 'danger', teamlead: 'info', employee: 'secondary' };
    return map[String(role)] ?? 'secondary';
  }

  getRoleLabel(role: string): string {
    const map: Record<string, string> = { manager: 'Manager', teamlead: 'Team Lead', employee: 'Employee' };
    return map[String(role)] ?? String(role);
  }
}
