import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SetupValidationResponse {
  email: string;
  name: string;
}

export interface SetupPasswordRequest {
  userId: string;
  token: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AccountSetupService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  validateSetupLink(userId: string, token: string): Observable<SetupValidationResponse> {
    const params = new HttpParams().set('userId', userId).set('token', token);
    return this.http.get<SetupValidationResponse>(`${this.baseUrl}/api/account-setup/validate`, { params });
  }

  completeAccountSetup(request: SetupPasswordRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/api/account-setup/complete`, request);
  }
}
