import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Doctor } from '../models/doctor.model';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getAvailableDoctors(): Observable<Doctor[]> {
    return this.http.get<Doctor[]>(`${this.baseUrl}/api/Doctors/available`).pipe(
      map(doctors => doctors.map(doc => this.enrichDoctor(doc)))
    );
  }

  getAllDoctors(): Observable<Doctor[]> {
    return this.http.get<Doctor[]>(`${this.baseUrl}/api/Doctors`).pipe(
      map(doctors => doctors.map(doc => this.enrichDoctor(doc)))
    );
  }

  getDoctorById(id: number): Observable<Doctor> {
    return this.http.get<Doctor>(`${this.baseUrl}/api/Doctors/${id}`).pipe(
      map(doc => this.enrichDoctor(doc))
    );
  }

  getMyProfile(): Observable<Doctor> {
    return this.http.get<Doctor>(`${this.baseUrl}/api/Doctors/me`).pipe(
      map(doc => this.enrichDoctor(doc))
    );
  }

  toggleMyAvailability(): Observable<{ isAvailable: boolean }> {
    return this.http.put<{ isAvailable: boolean }>(`${this.baseUrl}/api/Doctors/me/toggle-availability`, {});
  }

  toggleAvailability(id: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/api/Doctors/${id}/toggle-availability`, {});
  }

  addDoctor(request: any): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/api/Doctors`, request);
  }

  updateDoctor(id: number, request: any): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/api/Doctors/${id}`, request);
  }

  deleteDoctor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/Doctors/${id}`);
  }

  getDeletedDoctors(): Observable<Doctor[]> {
    return this.http.get<Doctor[]>(`${this.baseUrl}/api/Doctors/deleted`).pipe(
      map(doctors => doctors.map(doc => this.enrichDoctor(doc)))
    );
  }

  restoreDoctor(id: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/api/Doctors/${id}/restore`, {});
  }

  private enrichDoctor(doc: Doctor): Doctor {
    const initials = (doc.firstName.charAt(0) + (doc.lastName ? '.' + doc.lastName.charAt(0) : '')).toUpperCase();
    
    return {
      ...doc,
      avatarInitial: initials || 'د',
      consultationFee: doc.consultationFee || 250,
      rating: doc.rating || 4.9,
      reviewsCount: doc.reviewsCount || (80 + (doc.id * 17) % 70)
    };
  }
}
