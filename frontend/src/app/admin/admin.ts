import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { UserService } from '../core/services/user.service';
import { User, UserRole } from '../core/models/user.model';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin implements OnInit {
  public authService = inject(AuthService);
  private userService = inject(UserService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  // Reactive state using Angular Signals
  users = signal<User[]>([]);
  isLoading = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  feedbackMessage = signal<{ type: 'success' | 'error'; text: string } | null>(null);

  // Latency simulation control
  selectedDelayMs = signal<number>(500);
  elapsedLoadTime = signal<number>(0);
  private timerInterval: any = null;

  // Modal dialog state (Add/Edit)
  isModalOpen = signal<boolean>(false);
  isEditing = signal<boolean>(false);
  editingUserId = signal<string | null>(null);

  // Delete confirmation modal state
  isDeleteModalOpen = signal<boolean>(false);
  userToDelete = signal<User | null>(null);
  isDeleting = signal<boolean>(false);

  // Form for Add/Edit
  userForm: FormGroup;

  readonly roles: UserRole[] = ['General User', 'Admin'];

  constructor() {
    this.userForm = this.fb.group({
      userId: ['', [Validators.required, Validators.minLength(3)]],
      name: ['', [Validators.required]],
      role: ['General User', [Validators.required]],
      department: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading.set(true);
    this.elapsedLoadTime.set(0);

    const startTime = Date.now();
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.elapsedLoadTime.set(Math.round(Date.now() - startTime));
    }, 50);

    this.userService.getUsers(this.selectedDelayMs()).subscribe({
      next: (res) => {
        clearInterval(this.timerInterval);
        this.elapsedLoadTime.set(Date.now() - startTime);
        this.isLoading.set(false);
        if (res.success) {
          this.users.set(res.data);
        }
      },
      error: (err) => {
        clearInterval(this.timerInterval);
        this.isLoading.set(false);
        this.showFeedback('error', err.error?.message || 'Failed to load user accounts.');
      },
    });
  }

  onDelayChange(newDelay: number): void {
    this.selectedDelayMs.set(newDelay);
    this.loadUsers();
  }

  openAddModal(): void {
    this.isEditing.set(false);
    this.editingUserId.set(null);
    this.userForm.reset({
      userId: '',
      name: '',
      role: 'General User',
      department: 'Compliance',
      email: '',
      password: 'password123',
    });
    this.userForm.get('userId')?.enable();
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.get('password')?.updateValueAndValidity();
    this.isModalOpen.set(true);
  }

  openEditModal(user: User): void {
    this.isEditing.set(true);
    this.editingUserId.set(user.id);
    this.userForm.patchValue({
      userId: user.userId,
      name: user.name,
      role: user.role,
      department: user.department,
      email: user.email,
      password: '',
    });
    this.userForm.get('userId')?.disable();
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.userForm.reset();
  }

  onSaveUser(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const formVals = this.userForm.getRawValue();

    if (this.isEditing()) {
      const id = this.editingUserId()!;
      const payload: any = {
        name: formVals.name,
        role: formVals.role,
        department: formVals.department,
        email: formVals.email,
      };
      if (formVals.password) {
        payload.password = formVals.password;
      }

      this.userService.updateUser(id, payload).subscribe({
        next: (res) => {
          this.isSubmitting.set(false);
          this.closeModal();
          this.showFeedback('success', res.message || 'User updated successfully.');
          this.loadUsers();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.showFeedback('error', err.error?.message || 'Update failed.');
        },
      });
    } else {
      this.userService.createUser(formVals).subscribe({
        next: (res) => {
          this.isSubmitting.set(false);
          this.closeModal();
          this.showFeedback('success', res.message || 'User created successfully.');
          this.loadUsers();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.showFeedback('error', err.error?.message || 'Failed to create user.');
        },
      });
    }
  }

  openDeleteModal(user: User): void {
    this.userToDelete.set(user);
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen.set(false);
    this.userToDelete.set(null);
    this.isDeleting.set(false);
  }

  confirmDelete(): void {
    const user = this.userToDelete();
    if (!user) return;

    if (user.userId === this.authService.currentUser()?.userId) {
      this.showFeedback('error', 'You cannot delete your own active administrator account.');
      this.closeDeleteModal();
      return;
    }

    this.isDeleting.set(true);

    this.userService.deleteUser(user.id).subscribe({
      next: (res) => {
        this.isDeleting.set(false);
        this.closeDeleteModal();
        this.showFeedback('success', res.message);
        this.loadUsers();
      },
      error: (err) => {
        this.isDeleting.set(false);
        this.closeDeleteModal();
        this.showFeedback('error', err.error?.message || 'Deletion failed.');
      },
    });
  }

  private showFeedback(type: 'success' | 'error', text: string): void {
    this.feedbackMessage.set({ type, text });
    setTimeout(() => {
      this.feedbackMessage.set(null);
    }, 4000);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
