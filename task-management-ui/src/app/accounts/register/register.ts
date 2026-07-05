import { Component, EventEmitter, Injector, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AppComponentBase } from '../../shared/common-shared/app-component-base';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register extends AppComponentBase implements OnInit {

  @Output() onClose = new EventEmitter<void>();

  registerForm!: FormGroup;
  showPassword = false;
  showConfirmPassword = false;

  readonly roles = [
    { label: 'Manager', value: 'manager' },
    { label: 'Team Lead', value: 'teamlead' },
    { label: 'Employee', value: 'employee' },
  ];

  constructor(injector: Injector, private fb: FormBuilder, private _authService: AuthService) {
    super(injector);
    this.formInitialisation();
  }

  ngOnInit(): void {

  }

  formInitialisation() {
    this.registerForm = this.fb.group(
      {
        username: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        role: [{ value: 'employee', disabled: true }, [Validators.required]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  private passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const pw = group.get('password')?.value;
    const cpw = group.get('confirmPassword')?.value;
    return pw && cpw && pw !== cpw ? { passwordMismatch: true } : null;
  }

  get passwordMismatch(): boolean {
    return !!(
      this.registerForm.hasError('passwordMismatch') &&
      this.registerForm.get('confirmPassword')?.dirty
    );
  }

  onRegister(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const { confirmPassword, ...payload } = this.registerForm.getRawValue();
    this.isSubmitLoader = true;

    this._authService.register(payload).subscribe({
      next: () => {
        this._messageService.add({ severity: 'success', summary: 'Success', detail: 'Account created successfully.' });
        setTimeout(() => this.onClose.emit(), 800);
      },
      error: (err: any) => {
        this.isSubmitLoader = false;
        const msg = err?.error?.message || 'Registration failed. Please try again.';
        this._messageService.add({ severity: 'error', summary: 'Error', detail: msg });
      },
      complete: () => {
        this.isSubmitLoader = false;
      },
    });
  }

  cancel(): void {
    this.onClose.emit();
  }
}
