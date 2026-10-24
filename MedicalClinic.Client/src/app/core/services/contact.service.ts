import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ContactMessagePayload {
  fullName: string;
  email: string;
  phoneNumber?: string;
  department: string;
  subject: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/contact`;

  sendMessage(payload: ContactMessagePayload): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(this.apiUrl, payload);
  }
}
