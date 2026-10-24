import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MedicalRecordService } from '../../../core/services/medical-record.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { AuthService } from '../../../core/services/auth.service';
import { MedicalRecord } from '../../../core/models/medical-record.model';

@Component({
  selector: 'app-my-records',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div class="max-w-6xl mx-auto space-y-8">
        
        <!-- Header -->
        <div class="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                الملف الصحي الموحد
              </span>
            </div>
            <h1 class="text-2xl font-bold text-slate-900 mt-1">سجلاتي الطبية والروشتات الإلكترونية</h1>
            <p class="text-sm text-slate-500 mt-1">استعرض تاريخ زياراتك وتشخيصات الأطباء، مع إمكانية تحميل الروشتة المعتمدة بصيغة PDF فورياً</p>
          </div>

          <a 
            routerLink="/patient/appointments"
            class="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold transition cursor-pointer shadow-sm"
          >
            <span>حجوزاتي ومواعيدي</span>
            <span>←</span>
          </a>
        </div>

        <!-- Loading State -->
        <div *ngIf="isLoading()" class="py-20 text-center">
          <div class="inline-block animate-spin rounded-full h-10 w-10 border-4 border-emerald-600 border-t-transparent mb-4"></div>
          <p class="text-sm text-slate-600 font-medium">جاري استرجاع سجلاتك الطبية وفحوصاتك السابقة...</p>
        </div>

        <!-- Empty State -->
        <div *ngIf="!isLoading() && records().length === 0" class="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
          <div class="w-20 h-20 mx-auto mb-4 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center">
            <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 class="text-xl font-bold text-slate-800 mb-2">لا توجد سجلات طبية مسجلة حتى الآن</h2>
          <p class="text-sm text-slate-500 max-w-md mx-auto mb-6">
            عند إتمام موعدك مع الطبيب وقيامه بكتابة التقرير الطبي والروشتة، ستظهر جميع تفاصيل الزيارة هنا تلقائياً.
          </p>
          <a 
            routerLink="/"
            class="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm transition"
          >
            حجز كشف جديد الآن
          </a>
        </div>

        <!-- Medical Records List -->
        <div *ngIf="!isLoading() && records().length > 0" class="space-y-6">
          <div 
            *ngFor="let record of records()"
            class="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden hover:shadow-md transition"
          >
            <!-- Record Header -->
            <div class="p-6 bg-slate-50/70 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 rounded-2xl bg-emerald-700 text-white font-bold text-lg flex items-center justify-center shrink-0 shadow-sm">
                  د
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <h2 class="text-lg font-bold text-slate-900">{{ record.doctorName }}</h2>
                    <span class="text-xs bg-emerald-100 text-emerald-800 font-medium px-2.5 py-0.5 rounded-full">
                      {{ record.doctorSpecialization }}
                    </span>
                  </div>
                  <p class="text-xs text-slate-500 mt-1 flex items-center gap-2">
                    <span>📅 تاريخ الكشف: {{ record.appointmentDate }}</span>
                    <span>•</span>
                    <span>سجل رقم #{{ record.id }}</span>
                  </p>
                </div>
              </div>

              <!-- Download PDF button -->
              <button 
                (click)="downloadPdf(record.id)"
                [disabled]="downloadingId() === record.id"
                class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-50 text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
              >
                <svg *ngIf="downloadingId() !== record.id" class="w-4 h-4 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <svg *ngIf="downloadingId() === record.id" class="w-4 h-4 animate-spin text-emerald-700" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                <span>{{ downloadingId() === record.id ? 'جاري التحميل...' : 'تحميل الروشتة PDF' }}</span>
              </button>
            </div>

            <!-- Record Content -->
            <div class="p-6 sm:p-8 space-y-6">
              
              <!-- Diagnosis & Symptoms & Treatment -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                  <span class="text-xs font-semibold text-emerald-800 block mb-1">التشخيص الطبي النهائي:</span>
                  <p class="text-sm font-bold text-slate-800">{{ record.diagnosis }}</p>
                </div>

                <div class="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <span class="text-xs font-semibold text-slate-600 block mb-1">الأعراض والشكوى:</span>
                  <p class="text-sm font-medium text-slate-700">{{ record.symptoms }}</p>
                </div>

                <div class="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <span class="text-xs font-semibold text-slate-600 block mb-1">الخطة العلاجية:</span>
                  <p class="text-sm font-medium text-slate-700">{{ record.treatment }}</p>
                </div>
              </div>

              <!-- Vital signs row if present -->
              <div *ngIf="hasVitals(record)" class="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80">
                <span class="text-xs font-bold text-slate-700 block mb-3">العلامات الحيوية المسجلة أثناء الفحص:</span>
                <div class="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
                  <div *ngIf="record.temperature" class="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                    <p class="text-xs text-slate-500">الحرارة</p>
                    <p class="text-sm font-bold text-slate-900 mt-0.5">{{ record.temperature }} °C</p>
                  </div>
                  <div *ngIf="record.bloodPressure" class="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                    <p class="text-xs text-slate-500">ضغط الدم</p>
                    <p class="text-sm font-bold text-slate-900 mt-0.5">{{ record.bloodPressure }}</p>
                  </div>
                  <div *ngIf="record.heartRate" class="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                    <p class="text-xs text-slate-500">النبض</p>
                    <p class="text-sm font-bold text-slate-900 mt-0.5">{{ record.heartRate }} bpm</p>
                  </div>
                  <div *ngIf="record.weight" class="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                    <p class="text-xs text-slate-500">الوزن</p>
                    <p class="text-sm font-bold text-slate-900 mt-0.5">{{ record.weight }} kg</p>
                  </div>
                  <div *ngIf="record.height" class="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                    <p class="text-xs text-slate-500">الطول</p>
                    <p class="text-sm font-bold text-slate-900 mt-0.5">{{ record.height }} cm</p>
                  </div>
                </div>
              </div>

              <!-- Notes if present -->
              <div *ngIf="record.notes" class="text-xs text-slate-600 bg-amber-50/60 border border-amber-200/60 p-3 rounded-xl">
                <span class="font-bold text-amber-800">ملاحظات الطبيب: </span>{{ record.notes }}
              </div>

              <!-- Prescribed Medications List -->
              <div *ngIf="record.prescriptions && record.prescriptions.length > 0" class="space-y-3">
                <h3 class="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-emerald-600"></span>
                  الأدوية الموصوفة بالروشتة ({{ record.prescriptions.length }} أدوية):
                </h3>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div 
                    *ngFor="let pres of record.prescriptions"
                    class="p-4 rounded-2xl border border-emerald-100 bg-emerald-50/20 hover:bg-emerald-50/40 transition space-y-1.5"
                  >
                    <div class="flex items-center justify-between">
                      <h4 class="font-bold text-slate-900 text-sm">{{ pres.medicationName }}</h4>
                      <span class="text-xs font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        لمدة {{ pres.duration }} يوم
                      </span>
                    </div>
                    <div class="text-xs text-slate-600 flex flex-wrap gap-x-3 gap-y-1">
                      <span>الجرعة: <strong>{{ pres.dosage }}</strong></span>
                      <span>•</span>
                      <span>التكرار: <strong>{{ pres.frequency }}</strong></span>
                    </div>
                    <p *ngIf="pres.instructions" class="text-xs text-slate-500 italic">
                      تعليمات: {{ pres.instructions }}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  `
})
export class MyRecordsComponent implements OnInit {
  private readonly medicalRecordService = inject(MedicalRecordService);
  private readonly appointmentService = inject(AppointmentService);
  readonly authService = inject(AuthService);

  readonly records = signal<MedicalRecord[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly downloadingId = signal<number | null>(null);

  ngOnInit(): void {
    this.loadPatientRecords();
  }

  loadPatientRecords(): void {
    this.isLoading.set(true);
    // Fetch patient appointments to extract patientId
    this.appointmentService.getMyAppointments().subscribe({
      next: (appointments) => {
        if (!appointments || appointments.length === 0) {
          this.records.set([]);
          this.isLoading.set(false);
          return;
        }

        const patientId = appointments[0]?.patientId;
        if (!patientId) {
          this.records.set([]);
          this.isLoading.set(false);
          return;
        }

        this.medicalRecordService.getPatientHistory(patientId).subscribe({
          next: (history) => {
            this.records.set(history || []);
            this.isLoading.set(false);
          },
          error: () => {
            this.records.set([]);
            this.isLoading.set(false);
          }
        });
      },
      error: () => {
        this.records.set([]);
        this.isLoading.set(false);
      }
    });
  }

  downloadPdf(recordId: number): void {
    this.downloadingId.set(recordId);
    this.medicalRecordService.downloadPrescriptionPdf(recordId).subscribe({
      next: () => {
        this.downloadingId.set(null);
      },
      error: (err) => {
        this.downloadingId.set(null);
        if (err.status === 0 || err.name === 'AbortError' || err.message?.includes('aborted')) {
          return;
        }
        alert(err.error?.detail || 'تعذر تحميل ملف الروشتة حالياً، يرجى المحاولة لاحقاً');
      }
    });
  }

  hasVitals(record: MedicalRecord): boolean {
    return !!(record.temperature || record.bloodPressure || record.heartRate || record.weight || record.height);
  }
}
