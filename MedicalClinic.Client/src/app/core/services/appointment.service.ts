import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Appointment, AppointmentStatus, CreateAppointmentRequest } from '../models/appointment.model';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getMyAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.baseUrl}/api/appointments/me`);
  }

  getAppointmentById(id: number): Observable<Appointment> {
    return this.http.get<Appointment>(`${this.baseUrl}/api/appointments/me/${id}`);
  }

  getDoctorAppointments(date?: string): Observable<Appointment[]> {
    let params = new HttpParams();
    if (date) {
      params = params.set('date', date);
    }
    return this.http.get<Appointment[]>(`${this.baseUrl}/api/appointments/doctor`, { params });
  }

  getAllAppointments(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/appointments`);
  }

  changeStatus(id: number, status: AppointmentStatus): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/api/appointments/${id}/status`, { status });
  }

  changePaymentStatus(id: number, paymentStatus: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/api/appointments/${id}/payment-status`, { paymentStatus });
  }

  bookAppointment(request: CreateAppointmentRequest): Observable<{ appointmentId: number; message: string }> {
    return this.http.post<{ appointmentId: number; message: string }>(`${this.baseUrl}/api/appointments`, request);
  }

  getDoctorAvailability(doctorId: number, date: string): Observable<{
    doctorId: number;
    doctorName: string;
    specialization: string;
    date: string;
    timeSlots: { time: string; isAvailable: boolean }[];
  }> {
    return this.http.get<any>(`${this.baseUrl}/api/Doctors/${doctorId}/availability?date=${date}`);
  }

  updateAppointment(id: number, request: { reason?: string; appointmentDate?: string; appointmentTime?: string; type?: number }): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/api/appointments/me/${id}`, request);
  }

  cancelAppointment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/appointments/${id}`);
  }
}
