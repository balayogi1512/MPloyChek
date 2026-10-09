import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginCredentials, LoginResponse, User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL = 'http://localhost:3000/api';
  private readonly STORAGE_KEY = 'mploychek_current_user';
  private readonly TOKEN_KEY = 'mploychek_token';

  // Angular Signal holding the reactive state of the currently logged-in user
  public currentUser = signal<User | null>(this.getStoredUser());

  constructor(private http: HttpClient) {}

  /**
   * Calls the backend POST /api/login endpoint.
   * If successful, saves the user profile in localStorage and updates the currentUser signal.
   */
  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.API_URL}/login`, credentials)
      .pipe(
        tap((response) => {
          if (response.success && response.user && response.token) {
            this.setSession(response.user, response.token);
          }
        })
      );
  }

  /**
   * Clears session and logs out the current user
   */
  logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
    this.currentUser.set(null);
  }

  /**
   * Helper to check if a user is currently logged in
   */
  isLoggedIn(): boolean {
    return this.currentUser() !== null;
  }

  /**
   * Helper to check if the active user has the Admin role
   */
  isAdmin(): boolean {
    return this.currentUser()?.role === 'Admin';
  }

  /**
   * Private helper to persist user session in browser localStorage
   */
  private setSession(user: User, token: string): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    localStorage.setItem(this.TOKEN_KEY, token);
    this.currentUser.set(user);
  }

  /**
   * Private helper to retrieve cached user session upon page refresh
   */
  private getStoredUser(): User | null {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }
}
