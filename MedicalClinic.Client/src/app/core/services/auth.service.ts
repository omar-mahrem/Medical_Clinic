import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthResponse, CurrentUser, LoginRequest, RegisterRequest } from '../models/auth.model';

const TOKEN_KEY = 'mc_token';
const REFRESH_TOKEN_KEY = 'mc_refresh_token';
const USER_KEY = 'mc_user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly baseUrl = environment.apiUrl;

  readonly currentUser = signal<CurrentUser | null>(this.getStoredUser());
  readonly isAuthenticated = computed(() => !!this.currentUser());
  readonly isDoctor = computed(() => this.currentUser()?.roles.includes('Doctor') ?? false);
  readonly isPatient = computed(() => this.currentUser()?.roles.includes('Patient') ?? false);
  readonly isAdmin = computed(() => this.currentUser()?.roles.includes('Admin') ?? false);
  readonly isReceptionist = computed(() => this.currentUser()?.roles.includes('Receptionist') ?? false);

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth`, credentials).pipe(
      tap(res => this.handleAuthSuccess(res))
    );
  }

  register(data: RegisterRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/register`, data);
  }

  forgotPassword(email: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/auth/forget-password`, { email });
  }

  resetPassword(payload: { email: string; code: string; newPassword: string }): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/auth/reset-password`, payload);
  }

  refreshToken(): Observable<AuthResponse> {
    const token = this.getToken() || '';
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY) || '';
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/refresh`, { token, refreshToken }).pipe(
      tap(res => this.handleAuthSuccess(res))
    );
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;
    try {
      const payloadBase64 = token.split('.')[1];
      const payloadJson = decodeURIComponent(escape(atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'))));
      const payload = JSON.parse(payloadJson);
      if (!payload.exp) return false;
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private handleAuthSuccess(res: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(REFRESH_TOKEN_KEY, res.refreshToken);

    const payloadEmail = this.extractEmailFromJwt(res.token);

    const user: CurrentUser = {
      id: res.id,
      email: res.email || payloadEmail || '',
      firstName: res.firstName,
      lastName: res.lastName,
      roles: this.extractRolesFromJwt(res.token)
    };

    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.currentUser.set(user);
  }

  private getStoredUser(): CurrentUser | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  private extractEmailFromJwt(token: string): string {
    try {
      const payloadBase64 = token.split('.')[1];
      const payloadJson = decodeURIComponent(escape(atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'))));
      const payload = JSON.parse(payloadJson);
      return payload['email'] || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || '';
    } catch {
      return '';
    }
  }

  private extractRolesFromJwt(token: string): string[] {
    try {
      const payloadBase64 = token.split('.')[1];
      const payloadJson = decodeURIComponent(escape(atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'))));
      const payload = JSON.parse(payloadJson);
      
      const roleClaim = payload['roles'] 
        || payload['role'] 
        || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

      if (!roleClaim) return [];

      if (Array.isArray(roleClaim)) {
        return roleClaim;
      }
      if (typeof roleClaim === 'string') {
        try {
          const parsed = JSON.parse(roleClaim);
          if (Array.isArray(parsed)) return parsed;
        } catch {
          // simple string
        }
        return [roleClaim];
      }
      return [];
    } catch {
      return [];
    }
  }
}
