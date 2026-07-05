import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-validation-message',
  standalone: false,
  templateUrl: './validation-message.html',
  styleUrl: './validation-message.scss',
})
export class ValidationMessage {
  @Input() formCtrl: any;
  @Input() type: string = '';

  get errorMessage(): string {
    if (!this.formCtrl || !this.formCtrl.errors) return '';

    const errors = this.formCtrl.errors;

    if (errors['required']) {
      return `${this.type} is required`;
    }
    if (errors['minlength']) {
      return `${this.type} must be at least ${errors['minlength'].requiredLength} characters`;
    }
    if (errors['maxlength']) {
      return `${this.type} must be at most ${errors['maxlength'].requiredLength} characters`;
    }
    if (errors['email']) {
      return `Enter a valid email address`;
    }
    if (errors['pattern']) {
      return `Invalid ${this.type} format`;
    }
    if (errors['invalidMobileNumber']) {
      return `Invalid ${this.type} format`;
    }
    return '';
  }
}
