import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Patient {
  id: number;
  userId?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  fullName?: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender: number;
  address?: string;
  isDeleted: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getAllPatients(): Observable<Patient[]> {
    return this.http.get<Patient[]>(`${this.baseUrl}/api/Patients`);
  }

  getPatientById(id: number): Observable<Patient> {
    return this.http.get<Patient>(`${this.baseUrl}/api/Patients/${id}`);
  }

  registerPatient(request: any): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/api/Patients/register`, request);
  }

  deletePatient(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/Patients/${id}`);
  }

  restorePatient(id: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/api/Patients/${id}/restore`, {});
  }
}

