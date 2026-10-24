import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MedicalRecord, Prescription } from '../models/medical-record.model';

export interface CreateMedicalRecordRequest {
  appointmentId: number;
  diagnosis: string;
  symptoms?: string;
  treatment?: string;
  notes?: string;
  temperature?: number;
  bloodPressure?: string;
  heartRate?: number;
  weight?: number;
  height?: number;
  prescriptions?: {
    medicationName: string;
    dosage: string;
    frequency: string;
    duration: number;
    instructions?: string;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class MedicalRecordService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  createRecord(request: CreateMedicalRecordRequest): Observable<{ medicalRecordId: number; message: string }> {
    return this.http.post<{ medicalRecordId: number; message: string }>(`${this.baseUrl}/api/MedicalRecords`, request);
  }

  updateRecord(id: number, request: any): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.baseUrl}/api/MedicalRecords/${id}`, request);
  }

  getRecordById(id: number): Observable<MedicalRecord> {
    return this.http.get<MedicalRecord>(`${this.baseUrl}/api/MedicalRecords/${id}`);
  }

  getByAppointmentId(appointmentId: number): Observable<MedicalRecord> {
    return this.http.get<MedicalRecord>(`${this.baseUrl}/api/MedicalRecords/by-appointment/${appointmentId}`);
  }

  getPatientHistory(patientId: number): Observable<MedicalRecord[]> {
    return this.http.get<MedicalRecord[]>(`${this.baseUrl}/api/MedicalRecords/patient/${patientId}`);
  }

  private saveBlobAsFile(blob: Blob, filename: string): void {
    if (!blob || blob.size === 0) return;
    setTimeout(() => {
      try {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          try {
            if (a.parentNode) {
              document.body.removeChild(a);
            }
            window.URL.revokeObjectURL(url);
          } catch {}
        }, 1500);
      } catch (err) {
        console.error('Download error:', err);
      }
    }, 100);
  }

  downloadPrescriptionPdf(recordId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/api/MedicalRecords/${recordId}/prescription/pdf`, {
      responseType: 'blob'
    }).pipe(
      tap(blob => this.saveBlobAsFile(blob, `Prescription-${recordId}.pdf`))
    );
  }

  downloadPrescriptionByAppointmentPdf(appointmentId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/api/MedicalRecords/by-appointment/${appointmentId}/prescription/pdf`, {
      responseType: 'blob'
    }).pipe(
      tap(blob => this.saveBlobAsFile(blob, `Prescription-Appointment-${appointmentId}.pdf`))
    );
  }

  downloadSamplePrescriptionPdf(patientName?: string): Observable<Blob> {
    const params = patientName ? `?patientName=${encodeURIComponent(patientName)}` : '';
    return this.http.get(`${this.baseUrl}/api/MedicalRecords/sample-prescription/pdf${params}`, {
      responseType: 'blob'
    }).pipe(
      tap(blob => this.saveBlobAsFile(blob, `Sample-Prescription-EliteClinic.pdf`))
    );
  }
}
