import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UserItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isDeleted: boolean;
  isLocked?: boolean;
  roles: string[];
}

export interface CreateStaffRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  roles: string[];
  phoneNumber?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getUsers(): Observable<UserItem[]> {
    return this.http.get<UserItem[]>(`${this.baseUrl}/api/Users`);
  }

  createUser(request: CreateStaffRequest): Observable<UserItem> {
    return this.http.post<UserItem>(`${this.baseUrl}/api/Users`, request);
  }

  toggleStatus(id: string): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/api/Users/${id}/toggle-status`, {});
  }

  resetPassword(id: string, newPassword: string): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/api/Users/${id}/reset-password`, { newPassword });
  }

  unlockUser(id: string): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/api/Users/${id}/unlock`, {});
  }
}
