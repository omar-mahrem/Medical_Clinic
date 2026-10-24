import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../../../core/services/appointment.service';
import { MedicalRecordService, CreateMedicalRecordRequest } from '../../../core/services/medical-record.service';
import { DoctorService } from '../../../core/services/doctor.service';
import { AuthService } from '../../../core/services/auth.service';
import { Appointment, AppointmentStatus } from '../../../core/models/appointment.model';

interface PrescriptionItem {
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: number;
  instructions: string;
}

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto space-y-8">
        
        <!-- Header & Profile Card -->
        <div class="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-2xl bg-emerald-700 text-white font-bold text-2xl flex items-center justify-center shadow-md">
              {{ doctorInitials() }}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h1 class="text-2xl font-bold text-slate-900">
                  د. {{ authService.currentUser()?.firstName }} {{ authService.currentUser()?.lastName }}
                </h1>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                  لوحة الطبيب
                </span>
              </div>
              <p class="text-sm text-slate-500 mt-1">مرحباً بك، يمكنك إدارة حجوزات المرضى وتدوين التشخيصات وإصدار الروشتات الإلكترونية</p>
            </div>
          </div>

          <!-- Availability & Quick Filter -->
          <div class="flex flex-wrap items-center gap-3">
            <div class="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200">
              <span class="text-sm font-medium text-slate-700">حالة الاستقبال:</span>
              <span 
                class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                [ngClass]="isDoctorAvailable() ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'"
              >
                <span class="w-2 h-2 rounded-full" [ngClass]="isDoctorAvailable() ? 'bg-emerald-600 animate-pulse' : 'bg-rose-600'"></span>
                {{ isDoctorAvailable() ? 'متاح للكشف' : 'غير متاح حالياً' }}
              </span>
              <button 
                (click)="toggleDoctorAvailability()"
                [disabled]="isTogglingAvailability()"
                class="text-xs bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-3 py-1.5 rounded-xl font-medium transition cursor-pointer disabled:opacity-50"
              >
                {{ isTogglingAvailability() ? 'جاري التعديل...' : 'تبديل الحالة' }}
              </button>
            </div>
          </div>
        </div>

        <!-- KPI Cards -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xl">
              {{ appointments().length }}
            </div>
            <div>
              <p class="text-xs text-slate-500 font-medium">إجمالي المواعيد</p>
              <p class="text-lg font-bold text-slate-900">{{ appointments().length }} كشف</p>
            </div>
          </div>

          <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xl">
              {{ pendingCount() }}
            </div>
            <div>
              <p class="text-xs text-slate-500 font-medium">في الانتظار</p>
              <p class="text-lg font-bold text-amber-600">{{ pendingCount() }} كشف</p>
            </div>
          </div>

          <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xl">
              {{ confirmedCount() }}
            </div>
            <div>
              <p class="text-xs text-slate-500 font-medium">مؤكدة وجاهزة</p>
              <p class="text-lg font-bold text-blue-600">{{ confirmedCount() }} كشف</p>
            </div>
          </div>

          <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-xl">
              {{ completedCount() }}
            </div>
            <div>
              <p class="text-xs text-slate-500 font-medium">تم الانتهاء والروشتة</p>
              <p class="text-lg font-bold text-emerald-700">{{ completedCount() }} مكتمل</p>
            </div>
          </div>
        </div>

        <!-- Filter & Search Bar -->
        <div class="bg-white p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <!-- Live Patient Search -->
          <div class="relative flex-1 min-w-[260px] max-w-md">
            <input 
              type="text" 
              [ngModel]="searchQuery()" 
              (ngModelChange)="searchQuery.set($event)"
              placeholder="ابحث باسم المريض، رقم الهاتف، رقم الكشف، أو الشكوى..." 
              class="w-full pl-9 pr-9 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
            />
            <span class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <button 
              *ngIf="searchQuery()" 
              (click)="searchQuery.set('')" 
              class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 font-bold text-xs"
              title="مسح البحث"
            >✕</button>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <div class="flex items-center gap-2">
              <span class="text-xs font-semibold text-slate-600">التاريخ:</span>
              <input 
                type="date" 
                [(ngModel)]="filterDate" 
                (change)="loadDoctorAppointments()" 
                class="border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button 
                *ngIf="filterDate" 
                (click)="clearDateFilter()" 
                class="text-xs text-emerald-700 hover:text-emerald-800 underline font-medium cursor-pointer"
              >
                عرض الكل
              </button>
            </div>

            <div class="flex items-center gap-1.5">
              <span class="text-xs text-slate-500">الحالة:</span>
              <button 
                (click)="selectedStatusFilter.set('ALL')" 
                [class.bg-emerald-700]="selectedStatusFilter() === 'ALL'"
                [class.text-white]="selectedStatusFilter() === 'ALL'"
                [class.bg-slate-100]="selectedStatusFilter() !== 'ALL'"
                class="px-3 py-1 text-xs font-semibold rounded-lg transition cursor-pointer"
              >
                الكل
              </button>
            <button 
              (click)="selectedStatusFilter.set('Pending')" 
              [class.bg-amber-600]="selectedStatusFilter() === 'Pending'"
              [class.text-white]="selectedStatusFilter() === 'Pending'"
              [class.bg-slate-100]="selectedStatusFilter() !== 'Pending'"
              class="px-3 py-1 text-xs font-semibold rounded-lg transition cursor-pointer"
            >
              معلق
            </button>
            <button 
              (click)="selectedStatusFilter.set('Confirmed')" 
              [class.bg-blue-600]="selectedStatusFilter() === 'Confirmed'"
              [class.text-white]="selectedStatusFilter() === 'Confirmed'"
              [class.bg-slate-100]="selectedStatusFilter() !== 'Confirmed'"
              class="px-3 py-1 text-xs font-semibold rounded-lg transition cursor-pointer"
            >
              مؤكد
            </button>
            <button 
              (click)="selectedStatusFilter.set('Completed')" 
              [class.bg-emerald-600]="selectedStatusFilter() === 'Completed'"
              [class.text-white]="selectedStatusFilter() === 'Completed'"
              [class.bg-slate-100]="selectedStatusFilter() !== 'Completed'"
              class="px-3 py-1 text-xs font-semibold rounded-lg transition cursor-pointer"
            >
              مكتمل
            </button>
          </div>
        </div>

        <!-- Appointments List -->
        <div class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div class="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 class="text-lg font-bold text-slate-900">جدول كشوفات المرضى</h2>
            <button 
              (click)="loadDoctorAppointments()" 
              class="text-xs font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              تحديث الجدول
            </button>
          </div>

          <!-- Loading state -->
          <div *ngIf="isLoading()" class="py-16 text-center text-slate-500">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-emerald-600 border-t-transparent mb-3"></div>
            <p class="text-sm">جاري جلب قائمة الكشوفات الطبية...</p>
          </div>

          <!-- Empty state -->
          <div *ngIf="!isLoading() && filteredAppointments().length === 0" class="py-16 text-center text-slate-500">
            <div class="w-16 h-16 mx-auto mb-4 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p class="font-bold text-slate-800 text-base">لا توجد مواعيد مسجلة ضمن هذه المعايير</p>
            <p class="text-xs text-slate-400 mt-1">أي حجوزات جديدة من المرضى ستظهر هنا تلقائياً</p>
          </div>

          <!-- Appointments Table / Cards -->
          <div *ngIf="!isLoading() && filteredAppointments().length > 0" class="divide-y divide-slate-100">
            <div 
              *ngFor="let apt of filteredAppointments()" 
              class="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-slate-50/70 transition"
            >
              <!-- Patient & Time Info -->
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-lg shrink-0">
                  {{ apt.patientName.charAt(0) || 'م' }}
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <h3 class="font-bold text-slate-900 text-base">{{ apt.patientName }}</h3>
                    <span 
                      class="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                      [ngClass]="getStatusBadgeClass(apt.status)"
                    >
                      {{ getStatusArabic(apt.status) }}
                    </span>
                    <span 
                      *ngIf="apt.isOnline"
                      class="px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 border border-teal-200"
                    >
                      💻 أونلاين
                    </span>
                  </div>
                  <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1.5">
                    <span class="flex items-center gap-1 font-medium">
                      📅 {{ apt.appointmentDate }}
                    </span>
                    <span class="flex items-center gap-1 font-medium">
                      ⏰ {{ formatTime(apt.appointmentTime) }}
                    </span>
                    <span *ngIf="apt.reason" class="text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-lg max-w-xs sm:max-w-sm md:max-w-md truncate break-all inline-block" [title]="apt.reason">
                      الشكوى: {{ apt.reason }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex flex-wrap items-center gap-2.5 self-end lg:self-center">
                <!-- If Online: Join Video Call Button -->
                <a 
                  *ngIf="apt.isOnline && apt.meetingUrl && !isCancelled(apt.status)"
                  [href]="apt.meetingUrl"
                  target="_blank"
                  class="bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                >
                  <span>🎥</span>
                  <span>بدء الاستشارة المرئية</span>
                </a>

                <!-- If Pending: Confirm Button -->
                <button 
                  *ngIf="isPending(apt.status)"
                  (click)="changeAppointmentStatus(apt.id, AppointmentStatus.Confirmed)"
                  class="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer"
                >
                  تأكيد الحجز
                </button>

                <!-- If Confirmed or in Progress or Completed: Consultation & Prescription button -->
                <button 
                  *ngIf="!isCancelled(apt.status)"
                  (click)="openConsultationModal(apt)"
                  class="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>{{ isCompleted(apt.status) ? 'إعادة فحص / تعديل الروشتة' : 'بدء الكشف وكتابة الروشتة' }}</span>
                </button>

                <!-- If Completed: Direct Download Prescription PDF Button -->
                <button 
                  *ngIf="isCompleted(apt.status)"
                  (click)="downloadAppointmentPrescription(apt)"
                  [disabled]="downloadingPrescriptionId() === apt.id"
                  class="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                  title="تحميل الروشتة الطبية"
                >
                  <span *ngIf="downloadingPrescriptionId() !== apt.id">📄 الروشتة</span>
                  <span *ngIf="downloadingPrescriptionId() === apt.id" class="flex items-center gap-1">
                    <svg class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
                    جاري التحميل...
                  </span>
                </button>

                <!-- Cancel Button -->
                <button 
                  *ngIf="!isCancelled(apt.status) && !isCompleted(apt.status)"
                  (click)="changeAppointmentStatus(apt.id, AppointmentStatus.Cancelled)"
                  class="border border-rose-300 hover:bg-rose-50 text-rose-700 text-xs font-semibold px-3 py-2 rounded-xl transition cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Consultation & Prescription Modal -->
    <div 
      *ngIf="showConsultationModal()" 
      class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overscroll-contain"
    >
      <div 
        class="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-4 max-h-[90vh] flex flex-col overscroll-contain animate-fade-in">
        
        <!-- Modal Header -->
        <div class="bg-gradient-to-r from-emerald-800 to-emerald-700 text-white p-6 flex items-center justify-between shrink-0">
          <div>
            <div class="flex items-center gap-2">
              <span class="bg-emerald-600/60 text-xs px-2.5 py-1 rounded-full font-medium">
                {{ existingRecordId() ? 'إعادة فحص وتعديل الروشتة' : 'جلسة استشارة طبية' }}
              </span>
              <span class="text-xs text-emerald-200">رقم الكشف #{{ selectedAppointment()?.id }}</span>
              <span *ngIf="isLoadingRecord()" class="text-xs text-amber-200 animate-pulse flex items-center gap-1">
                جاري جلب بيانات الكشف السابقة...
              </span>
            </div>
            <h2 class="text-xl font-bold mt-1">كشف المريض: {{ selectedAppointment()?.patientName }}</h2>
            <p class="text-xs text-emerald-100 mt-0.5">تاريخ الحجز: {{ selectedAppointment()?.appointmentDate }} | الساعة: {{ formatTime(selectedAppointment()?.appointmentTime || '') }}</p>
          </div>
          <button 
            type="button"
            (click)="closeConsultationModal()"
            class="text-white/80 hover:text-white p-2 rounded-xl hover:bg-white/10 transition cursor-pointer"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Modal Body -->
        <form (ngSubmit)="submitMedicalRecord()" class="p-6 sm:p-8 space-y-6 overflow-y-auto custom-scrollbar overscroll-contain flex-1">

          <!-- Section 1: Clinical Diagnosis & Symptoms -->
          <div class="space-y-4">
            <h3 class="text-base font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              التشخيص السريري والأعراض
            </h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">
                  التشخيص الطبي النهائي <span class="text-rose-500">*</span>
                </label>
                <input 
                  type="text" 
                  [(ngModel)]="consultationForm.diagnosis" 
                  name="diagnosis" 
                  required
                  placeholder="مثال: التهاب حاد في الجيوب الأنفية"
                  class="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">
                  الأعراض والشكوى السريرية (اختياري)
                </label>
                <input 
                  type="text" 
                  [(ngModel)]="consultationForm.symptoms" 
                  name="symptoms" 
                  placeholder="مثال: صداع نصفي، احتقان، ارتفاع طفيف بدرجة الحرارة"
                  class="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">
                الخطة العلاجية والتوجيهات (اختياري)
              </label>
              <textarea 
                [(ngModel)]="consultationForm.treatment" 
                name="treatment" 
                rows="2" 
                placeholder="مثال: الراحة التامة لمدة 3 أيام، الإكثار من السوائل الدافئة، ومراجعة العيادة في حال استمرار الأعراض"
                class="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              ></textarea>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">
                ملاحظات سريرية خاصة (اختياري)
              </label>
              <input 
                type="text" 
                [(ngModel)]="consultationForm.notes" 
                name="notes" 
                placeholder="أي تنبيهات تخص الحساسية الدوائية أو الفحوصات الإضافية"
                class="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <!-- Section 2: Vital Signs (Collapsible / Optional) -->
          <div class="border border-slate-200 rounded-2xl p-4 bg-slate-50/60">
            <button 
              type="button" 
              (click)="showVitalSigns.set(!showVitalSigns())"
              class="w-full flex items-center justify-between text-left text-sm font-bold text-slate-800 hover:text-emerald-700 transition cursor-pointer"
            >
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                <span>العلامات الحيوية (Vital Signs) - اختياري</span>
              </div>
              <span class="text-xs text-slate-600 bg-white border border-slate-200 px-3 py-1 rounded-lg">
                {{ showVitalSigns() ? 'إخفاء العلامات الحيوية ▲' : 'إضافة علامات حيوية (ضغط، حرارة، نبض...) ▼' }}
              </span>
            </button>

            <div *ngIf="showVitalSigns()" class="mt-4 pt-3 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div>
                <label class="block text-xs text-slate-600 mb-1">حرارة (°C)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  [(ngModel)]="consultationForm.temperature" 
                  name="temperature" 
                  placeholder="37.0"
                  class="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                />
              </div>

              <div>
                <label class="block text-xs text-slate-600 mb-1">ضغط الدم</label>
                <input 
                  type="text" 
                  [(ngModel)]="consultationForm.bloodPressure" 
                  name="bloodPressure" 
                  placeholder="120/80"
                  class="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                />
              </div>

              <div>
                <label class="block text-xs text-slate-600 mb-1">النبض (bpm)</label>
                <input 
                  type="number" 
                  [(ngModel)]="consultationForm.heartRate" 
                  name="heartRate" 
                  placeholder="75"
                  class="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                />
              </div>

              <div>
                <label class="block text-xs text-slate-600 mb-1">الوزن (kg)</label>
                <input 
                  type="number" 
                  step="0.5" 
                  [(ngModel)]="consultationForm.weight" 
                  name="weight" 
                  placeholder="70"
                  class="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                />
              </div>

              <div>
                <label class="block text-xs text-slate-600 mb-1">الطول (cm)</label>
                <input 
                  type="number" 
                  [(ngModel)]="consultationForm.height" 
                  name="height" 
                  placeholder="175"
                  class="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                />
              </div>
            </div>
          </div>

          <!-- Section 3: Prescriptions (الروشتة الدوائية) -->
          <div class="space-y-4">
            <div class="flex items-center justify-between border-b pb-2">
              <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                الروشتة الدوائية الإلكترونية (Prescription)
              </h3>
              <button 
                type="button" 
                (click)="addPrescriptionRow()"
                class="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold px-3 py-1.5 rounded-xl border border-emerald-200 transition flex items-center gap-1 cursor-pointer"
              >
                + إضافة دواء آخر
              </button>
            </div>

            <div class="space-y-3">
              <div 
                *ngFor="let item of prescriptions; let i = index" 
                class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3"
              >
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-emerald-800">دواء رقم #{{ i + 1 }}</span>
                  <button 
                    *ngIf="prescriptions.length > 1"
                    type="button" 
                    (click)="removePrescriptionRow(i)"
                    class="text-xs text-rose-600 hover:text-rose-800 font-medium cursor-pointer"
                  >
                    حذف هذا الدواء ✕
                  </button>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div class="sm:col-span-2">
                    <label class="block text-xs text-slate-600 mb-1">اسم الدواء</label>
                    <input 
                      type="text" 
                      [(ngModel)]="item.medicationName" 
                      [name]="'medName_' + i"
                      required
                      placeholder="مثال: Augmentin 1g"
                      class="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label class="block text-xs text-slate-600 mb-1">الجرعة</label>
                    <input 
                      type="text" 
                      [(ngModel)]="item.dosage" 
                      [name]="'dosage_' + i"
                      required
                      placeholder="قرص واحد"
                      class="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label class="block text-xs text-slate-600 mb-1">التكرار</label>
                    <input 
                      type="text" 
                      [(ngModel)]="item.frequency" 
                      [name]="'freq_' + i"
                      required
                      placeholder="كل 12 ساعة بعد الأكل"
                      class="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label class="block text-xs text-slate-600 mb-1">المدة بالأيام</label>
                    <input 
                      type="number" 
                      [(ngModel)]="item.duration" 
                      [name]="'dur_' + i"
                      required
                      min="1"
                      placeholder="7"
                      class="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div class="sm:col-span-2">
                    <label class="block text-xs text-slate-600 mb-1">تعليمات إضافية للمريض</label>
                    <input 
                      type="text" 
                      [(ngModel)]="item.instructions" 
                      [name]="'inst_' + i"
                      placeholder="يؤخذ بعد الوجبة مع كوب ماء وفير"
                      class="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Alert feedback (Shown right above the submit button) -->
          <div *ngIf="modalError()" class="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium flex items-center gap-2">
            <span>⚠️</span>
            <span>{{ modalError() }}</span>
          </div>
          <div *ngIf="modalSuccess()" class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center gap-2">
            <span>✅</span>
            <span>{{ modalSuccess() }}</span>
          </div>

          <!-- Modal Footer Buttons -->
          <div class="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <label class="flex items-center gap-2 text-xs text-slate-600 hover:text-slate-900 cursor-pointer select-none">
              <input 
                type="checkbox" 
                [checked]="autoDownloadPdf()" 
                (change)="autoDownloadPdf.set(!autoDownloadPdf())" 
                class="rounded border-slate-300 text-emerald-700 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
              >
              <span>تحميل نسخة الروشتة (PDF) تلقائياً بعد الحفظ</span>
            </label>
            <div class="flex items-center gap-3">
              <button 
                type="button" 
                (click)="closeConsultationModal()"
                class="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-semibold transition cursor-pointer"
              >
                إلغاء وتراجع
              </button>
              <button 
                type="submit" 
                [disabled]="isSubmittingRecord()"
                class="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                <svg *ngIf="isSubmittingRecord()" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                <span>{{ isSubmittingRecord() ? 'جاري حفظ الكشف...' : (existingRecordId() ? 'حفظ التعديلات' : 'حفظ الكشف الطبي') }}</span>
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  `
})
export class DoctorDashboardComponent implements OnInit, OnDestroy {
  readonly authService = inject(AuthService);
  private readonly appointmentService = inject(AppointmentService);
  private readonly medicalRecordService = inject(MedicalRecordService);
  private readonly doctorService = inject(DoctorService);

  readonly AppointmentStatus = AppointmentStatus;

  readonly appointments = signal<Appointment[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly selectedStatusFilter = signal<string>('ALL');
  readonly searchQuery = signal<string>('');
  filterDate: string = '';

  readonly isDoctorAvailable = signal<boolean>(true);
  readonly isTogglingAvailability = signal<boolean>(false);

  // Consultation Modal State
  readonly showConsultationModal = signal<boolean>(false);
  readonly showVitalSigns = signal<boolean>(false);
  readonly selectedAppointment = signal<Appointment | null>(null);
  readonly isSubmittingRecord = signal<boolean>(false);
  readonly modalError = signal<string | null>(null);
  readonly modalSuccess = signal<string | null>(null);
  readonly existingRecordId = signal<number | null>(null);
  readonly isLoadingRecord = signal<boolean>(false);
  readonly autoDownloadPdf = signal<boolean>(false);
  readonly downloadingPrescriptionId = signal<number | null>(null);

  consultationForm = {
    diagnosis: '',
    symptoms: '',
    treatment: '',
    notes: '',
    temperature: undefined as number | undefined,
    bloodPressure: '',
    heartRate: undefined as number | undefined,
    weight: undefined as number | undefined,
    height: undefined as number | undefined,
  };

  prescriptions: PrescriptionItem[] = [
    { medicationName: '', dosage: '', frequency: '', duration: 7, instructions: '' }
  ];

  readonly doctorInitials = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return 'د';
    return (user.firstName.charAt(0) + (user.lastName ? '.' + user.lastName.charAt(0) : '')).toUpperCase();
  });

  isPending(status: any): boolean {
    const s = String(status).toLowerCase();
    return s === 'pending' || s === '1' || s === '0';
  }

  isConfirmed(status: any): boolean {
    const s = String(status).toLowerCase();
    return s === 'confirmed' || s === '2' || s === 'inprogress' || s === '3';
  }

  isCompleted(status: any): boolean {
    const s = String(status).toLowerCase();
    return s === 'completed' || s === '4';
  }

  isCancelled(status: any): boolean {
    const s = String(status).toLowerCase();
    return s === 'cancelled' || s === '5';
  }

  readonly pendingCount = computed(() => 
    this.appointments().filter(a => this.isPending(a.status)).length
  );

  readonly confirmedCount = computed(() => 
    this.appointments().filter(a => this.isConfirmed(a.status)).length
  );

  readonly completedCount = computed(() => 
    this.appointments().filter(a => this.isCompleted(a.status)).length
  );

  readonly filteredAppointments = computed(() => {
    const list = this.appointments();
    const filter = this.selectedStatusFilter();
    const query = this.searchQuery().trim().toLowerCase();

    return list.filter(a => {
      // 1. Status Filter
      if (filter === 'Pending' && !this.isPending(a.status)) return false;
      if (filter === 'Confirmed' && !this.isConfirmed(a.status)) return false;
      if (filter === 'Completed' && !this.isCompleted(a.status)) return false;

      // 2. Search Query (Patient Name, Phone, Appointment ID, Reason)
      if (query) {
        const nameMatch = a.patientName?.toLowerCase().includes(query);
        const phoneMatch = a.patientPhone?.toLowerCase().includes(query);
        const idMatch = a.id?.toString().includes(query);
        const reasonMatch = a.reason?.toLowerCase().includes(query);
        if (!nameMatch && !phoneMatch && !idMatch && !reasonMatch) {
          return false;
        }
      }

      return true;
    });
  });

  ngOnInit(): void {
    this.loadDoctorAppointments();
    this.doctorService.getMyProfile().subscribe({
      next: (profile) => {
        this.isDoctorAvailable.set(profile.isAvailable);
      },
      error: () => {}
    });
  }

  loadDoctorAppointments(): void {
    this.isLoading.set(true);
    this.appointmentService.getDoctorAppointments(this.filterDate || undefined).subscribe({
      next: (data) => {
        this.appointments.set(data || []);
        this.isLoading.set(false);
      },
      error: () => {
        this.appointments.set([]);
        this.isLoading.set(false);
      }
    });
  }

  clearDateFilter(): void {
    this.filterDate = '';
    this.loadDoctorAppointments();
  }

  toggleDoctorAvailability(): void {
    this.isTogglingAvailability.set(true);
    this.doctorService.toggleMyAvailability().subscribe({
      next: (res) => {
        this.isDoctorAvailable.set(res.isAvailable);
        this.isTogglingAvailability.set(false);
      },
      error: () => {
        this.isTogglingAvailability.set(false);
      }
    });
  }

  changeAppointmentStatus(id: number, status: AppointmentStatus): void {
    this.appointmentService.changeStatus(id, status).subscribe({
      next: () => {
        this.loadDoctorAppointments();
      },
      error: (err) => {
        alert(err.error?.detail || 'حدث خطأ أثناء تعديل حالة الحجز');
      }
    });
  }

  openConsultationModal(apt: Appointment): void {
    document.body.style.overflow = 'hidden';
    this.selectedAppointment.set(apt);
    this.modalError.set(null);
    this.modalSuccess.set(null);
    this.showVitalSigns.set(false);
    this.existingRecordId.set(null);
    this.isLoadingRecord.set(true);

    this.consultationForm = {
      diagnosis: '',
      symptoms: apt.reason || '',
      treatment: '',
      notes: '',
      temperature: undefined,
      bloodPressure: '',
      heartRate: undefined,
      weight: undefined,
      height: undefined
    };
    this.prescriptions = [
      { medicationName: '', dosage: '', frequency: '', duration: 7, instructions: '' }
    ];
    this.showConsultationModal.set(true);

    // Fetch existing medical record and prescriptions for this appointment
    this.medicalRecordService.getByAppointmentId(apt.id).subscribe({
      next: (rec) => {
        this.isLoadingRecord.set(false);
        if (rec) {
          this.existingRecordId.set(rec.id);
          this.consultationForm = {
            diagnosis: rec.diagnosis || '',
            symptoms: rec.symptoms || '',
            treatment: rec.treatment || '',
            notes: rec.notes || '',
            temperature: rec.temperature !== undefined && rec.temperature !== null ? Number(rec.temperature) : undefined,
            bloodPressure: rec.bloodPressure || '',
            heartRate: rec.heartRate !== undefined && rec.heartRate !== null ? Number(rec.heartRate) : undefined,
            weight: rec.weight !== undefined && rec.weight !== null ? Number(rec.weight) : undefined,
            height: rec.height !== undefined && rec.height !== null ? Number(rec.height) : undefined
          };

          if (rec.temperature || rec.bloodPressure || rec.heartRate || rec.weight || rec.height) {
            this.showVitalSigns.set(true);
          }

          if (rec.prescriptions && rec.prescriptions.length > 0) {
            this.prescriptions = rec.prescriptions.map(p => ({
              medicationName: p.medicationName || '',
              dosage: p.dosage || '',
              frequency: p.frequency || '',
              duration: Number(p.duration) || 7,
              instructions: p.instructions || ''
            }));
          }
        }
      },
      error: () => {
        this.isLoadingRecord.set(false);
      }
    });
  }

  closeConsultationModal(): void {
    document.body.style.overflow = '';
    this.showConsultationModal.set(false);
    this.selectedAppointment.set(null);
    this.existingRecordId.set(null);
    this.isLoadingRecord.set(false);
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }

  addPrescriptionRow(): void {
    this.prescriptions.push({
      medicationName: '',
      dosage: '',
      frequency: '',
      duration: 5,
      instructions: ''
    });
  }

  removePrescriptionRow(index: number): void {
    if (this.prescriptions.length > 1) {
      this.prescriptions.splice(index, 1);
    }
  }

  submitMedicalRecord(): void {
    const apt = this.selectedAppointment();
    if (!apt) return;

    if (!this.consultationForm.diagnosis || !this.consultationForm.diagnosis.trim()) {
      this.modalError.set('يرجى كتابة التشخيص الطبي الرئيسي للحالة');
      return;
    }

    const validPrescriptions = this.prescriptions
      .filter(p => p.medicationName && p.medicationName.trim() !== '')
      .map(p => ({
        medicationName: p.medicationName.trim(),
        dosage: p.dosage.trim(),
        frequency: p.frequency.trim(),
        duration: Number(p.duration) || 7,
        instructions: p.instructions?.trim() || undefined
      }));

    const payload: CreateMedicalRecordRequest = {
      appointmentId: apt.id,
      diagnosis: this.consultationForm.diagnosis.trim(),
      symptoms: this.consultationForm.symptoms?.trim() || undefined,
      treatment: this.consultationForm.treatment?.trim() || undefined,
      notes: this.consultationForm.notes?.trim() || undefined,
      temperature: this.consultationForm.temperature ? Number(this.consultationForm.temperature) : undefined,
      bloodPressure: this.consultationForm.bloodPressure?.trim() || undefined,
      heartRate: this.consultationForm.heartRate ? Number(this.consultationForm.heartRate) : undefined,
      weight: this.consultationForm.weight ? Number(this.consultationForm.weight) : undefined,
      height: this.consultationForm.height ? Number(this.consultationForm.height) : undefined,
      prescriptions: validPrescriptions
    };

    this.isSubmittingRecord.set(true);
    this.modalError.set(null);

    if (this.existingRecordId()) {
      const recId = this.existingRecordId()!;
      this.medicalRecordService.updateRecord(recId, payload).subscribe({
        next: () => {
          this.isSubmittingRecord.set(false);
          this.modalSuccess.set(
            this.autoDownloadPdf() 
              ? 'تم تحديث الكشف الطبي بنجاح! جاري تحميل الروشتة المحدثة...' 
              : 'تم حفظ وتحديث الكشف الطبي والروشتة بنجاح!'
          );
          if (this.autoDownloadPdf()) {
            this.medicalRecordService.downloadPrescriptionPdf(recId).subscribe();
          }
          setTimeout(() => {
            this.closeConsultationModal();
            this.loadDoctorAppointments();
          }, 1200);
        },
        error: (err) => {
          this.isSubmittingRecord.set(false);
          this.modalError.set(err.error?.detail || err.error?.message || 'تعذر تعديل الكشف الطبي، يرجى المحاولة مرة أخرى');
        }
      });
    } else {
      this.executeCreateRecord(payload);
    }
  }

  private executeCreateRecord(payload: CreateMedicalRecordRequest): void {
    this.medicalRecordService.createRecord(payload).subscribe({
      next: (res) => {
        this.isSubmittingRecord.set(false);
        this.modalSuccess.set(
          this.autoDownloadPdf()
            ? 'تم حفظ الكشف الطبي بنجاح! جاري تحميل ملف الروشتة الطبية PDF...'
            : 'تم حفظ الكشف الطبي وإصدار الروشتة بنجاح!'
        );

        if (this.autoDownloadPdf() && res.medicalRecordId) {
          this.medicalRecordService.downloadPrescriptionPdf(res.medicalRecordId).subscribe();
        }

        setTimeout(() => {
          this.closeConsultationModal();
          this.loadDoctorAppointments();
        }, 1200);
      },
      error: (err) => {
        this.isSubmittingRecord.set(false);
        this.modalError.set(err.error?.detail || err.error?.message || 'تعذر حفظ الكشف الطبي، يرجى المحاولة مرة أخرى');
      }
    });
  }

  downloadAppointmentPrescription(apt: Appointment): void {
    this.downloadingPrescriptionId.set(apt.id);
    this.medicalRecordService.downloadPrescriptionByAppointmentPdf(apt.id).subscribe({
      next: () => {
        this.downloadingPrescriptionId.set(null);
      },
      error: (err) => {
        this.downloadingPrescriptionId.set(null);
        if (err.status === 0 || err.name === 'AbortError' || err.message?.includes('aborted')) {
          return;
        }
        if (err.status === 404) {
          alert('لم يتم إصدار روشتة لهذا الكشف بعد.');
        } else {
          alert('تعذر تحميل الروشتة حالياً، يرجى المحاولة لاحقاً');
        }
      }
    });
  }

  getStatusBadgeClass(status: AppointmentStatus): string {
    if (this.isPending(status)) return 'bg-amber-100 text-amber-800';
    if (this.isConfirmed(status)) return 'bg-blue-100 text-blue-800';
    if (this.isCompleted(status)) return 'bg-emerald-100 text-emerald-800';
    if (this.isCancelled(status)) return 'bg-rose-100 text-rose-800';
    return 'bg-slate-100 text-slate-800';
  }

  getStatusArabic(status: AppointmentStatus): string {
    if (this.isPending(status)) return 'في الانتظار';
    if (this.isConfirmed(status)) return 'مؤكد';
    if (this.isCompleted(status)) return 'مكتمل ومعتمد';
    if (this.isCancelled(status)) return 'ملغي';
    return 'غير محدد';
  }

  formatTime(time: string): string {
    if (!time) return '';
    const parts = time.split(':');
    if (parts.length < 2) return time;
    let hour = parseInt(parts[0], 10);
    const minute = parts[1] || '00';
    if (isNaN(hour)) return time;
    const isPm = hour >= 12;
    if (hour > 12) hour -= 12;
    if (hour === 0) hour = 12;
    const hourStr = hour < 10 ? '0' + hour : '' + hour;
    return `${hourStr}:${minute} ${isPm ? 'م' : 'ص'}`;
  }
}
