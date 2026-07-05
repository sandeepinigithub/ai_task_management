import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppComponentBase } from '../../shared/common-shared/app-component-base';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login extends AppComponentBase implements OnInit {
  loginForm!: FormGroup;
  showPassword = false;
  showRegisterModal = false;
  // isSubmitLoader = false;

  constructor(injector: Injector, private fb: FormBuilder, private _authService: AuthService) {
    super(injector)
  }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSignin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.isSubmitLoader = true;
    const payload = {
      email: this.loginForm.value?.email,
      password: this.loginForm.value?.password,
    }
    this._authService.login(payload).subscribe({
      next: (res: any) => {
        // TODO 1: Save data in sessionStorage for use
        sessionStorage.setItem('token', res?.data?.token);
        sessionStorage.setItem('userDetails', JSON.stringify(res?.data?.user));
        this._router.navigate(['/portal'], {
          replaceUrl: true
        });
      },
      error: (err: any) => {
        this.isSubmitLoader = false;
        const msg = err?.error?.message || 'Login failed. Please try again.';
        this._messageService.add({ severity: 'error', summary: 'Error', detail: msg });
      },
      complete: () => {
        this.isSubmitLoader = false;
      }
    })

  }
}
