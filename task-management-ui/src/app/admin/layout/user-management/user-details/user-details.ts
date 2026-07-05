import { ChangeDetectorRef, Component, Injector, OnInit } from '@angular/core';
import { AppComponentBase } from '../../../../shared/common-shared/app-component-base';
import { UserService } from '../../../../services/user-service';

type TagSeverity = 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast';

@Component({
  selector: 'app-user-details',
  standalone: false,
  templateUrl: './user-details.html',
  styleUrl: './user-details.scss',
})
export class UserDetails extends AppComponentBase implements OnInit {

  user: any = null;
  deleting = false;
  loading = false

  constructor(injector: Injector, private userService: UserService, private _cdr: ChangeDetectorRef) {
    super(injector);
  }

  ngOnInit(): void {
    if (this.id) { this.loadUser(this.id); }
  }

  private loadUser(id: string): void {
    this.loading = true;
    this.userService.getUserById(id).subscribe({
      next: (res: any) => {
        this.user = res?.data?.user ?? res?.data ?? res;
        this.loading = false;
        this._cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this._cdr.detectChanges();
        this._messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not load user details.' });
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
