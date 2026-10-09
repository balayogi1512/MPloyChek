import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

export interface UsersApiResponse {
  success: boolean;
  data: User[];
}

export interface UserMutationResponse {
  success: boolean;
  message: string;
  data?: User;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly API_URL = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  /**
   * Admin: Get all users from the database.
   * Supports simulated latency parameter to test asynchronous loading.
   */
  getUsers(delayMs: number = 0): Observable<UsersApiResponse> {
    let params = new HttpParams();
    if (delayMs > 0) {
      params = params.set('delay', delayMs.toString());
    }
    return this.http.get<UsersApiResponse>(`${this.API_URL}/users`, { params });
  }

  /**
   * Admin: Add a new user to the database
   */
  createUser(userPayload: {
    userId: string;
    password: string;
    name: string;
    role: string;
    department: string;
    email: string;
  }): Observable<UserMutationResponse> {
    return this.http.post<UserMutationResponse>(`${this.API_URL}/users`, userPayload);
  }

  /**
   * Admin: Edit an existing user's details
   */
  updateUser(
    id: string,
    updates: {
      name?: string;
      role?: string;
      department?: string;
      email?: string;
      password?: string;
    }
  ): Observable<UserMutationResponse> {
    return this.http.put<UserMutationResponse>(`${this.API_URL}/users/${id}`, updates);
  }

  /**
   * Admin: Delete a user from the database
   */
  deleteUser(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.API_URL}/users/${id}`);
  }
}
