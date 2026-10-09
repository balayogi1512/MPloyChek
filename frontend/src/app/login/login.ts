import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../core/services/auth.service';
import { UserRole } from '../core/models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  loginForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  showPassword = signal(false);

  // Available roles per challenge specification
  readonly roles: UserRole[] = ['General User', 'Admin'];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    // Initialize Reactive Form with default role and required validators
    this.loginForm = this.fb.group({
      userId: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required]],
      role: ['General User', [Validators.required]],
    });
    // Auto-dismiss previous error message as soon as user types or changes input
    this.loginForm.valueChanges.subscribe(() => {
      if (this.errorMessage()) {
        this.errorMessage.set(null);
      }
    });
  }

  // Convenience getter for form controls in template
  get f() {
    return this.loginForm.controls;
  }

  /**
   * Quick fill test credentials for reviewer convenience
   */
  fillDemoCredentials(type: 'admin' | 'user'): void {
    if (type === 'admin') {
      this.loginForm.patchValue({
        userId: 'admin',
        password: 'password123',
        role: 'Admin',
      });
    } else {
      this.loginForm.patchValue({
        userId: 'user',
        password: 'password123',
        role: 'General User',
      });
    }
    this.errorMessage.set(null);
    this.loginForm.markAsUntouched();
  }

  /**
   * Select role via custom UI pill.
   * Clears old error messages and untouched states.
   */
  setRole(selectedRole: UserRole): void {
    this.loginForm.patchValue({ role: selectedRole });
    this.errorMessage.set(null);
    this.loginForm.markAsUntouched();
  }

  /**
   * Toggle password visibility
   */
  toggleShowPassword(): void {
    this.showPassword.update((val) => !val);
  }

  /**
   * Submit the login form
   */
  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { userId, password, role } = this.loginForm.value;

    this.authService.login({ userId, password, role }).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.success) {
          // Navigate to logged-in dashboard
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage.set(response.message || 'Login failed. Please verify your credentials.');
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        // Extract server error message or fallback to network error
        const serverMsg = err.error?.message;
        if (serverMsg) {
          this.errorMessage.set(serverMsg);
        } else if (err.status === 0) {
          this.errorMessage.set('Cannot reach backend server. Make sure the Node.js API is running on port 3000.');
        } else {
          this.errorMessage.set(`Authentication failed (Code ${err.status}). Please try again.`);
        }
      },
    });
  }
}
