import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UserProfile {
  email: string;
  userName: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: number;
}

export interface UpdateProfileRequest {
  firstName: string;
  middleName?: string;
  lastName: string;
  phoneNumber?: string;
  dateOfBirth?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.baseUrl}/me`);
  }

  updateProfile(request: UpdateProfileRequest): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/me/info`, request);
  }

  changePassword(request: ChangePasswordRequest): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/me/change-password`, request);
  }
}
