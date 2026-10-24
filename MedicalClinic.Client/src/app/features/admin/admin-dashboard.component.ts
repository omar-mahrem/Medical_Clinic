import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DoctorService } from '../../core/services/doctor.service';
import { PatientService, Patient } from '../../core/services/patient.service';
import { AppointmentService } from '../../core/services/appointment.service';
import { AuthService } from '../../core/services/auth.service';
import { UserService, UserItem, CreateStaffRequest } from '../../core/services/user.service';
import { Doctor } from '../../core/models/doctor.model';
import { Appointment, AppointmentStatus, CreateAppointmentRequest } from '../../core/models/appointment.model';
import { MedicalRecordService } from '../../core/services/medical-record.service';

type AdminTab = 'doctors' | 'admins' | 'reception' | 'patients' | 'appointments' | 'finances';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto space-y-8">
        
        <!-- Header -->
        <div class="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div class="flex items-center gap-2">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                [ngClass]="authService.isAdmin() ? 'bg-emerald-100 text-emerald-800' : 'bg-teal-100 text-teal-800'">
                {{ authService.isAdmin() ? 'لوحة الإدارة المركزية' : 'مكتب الاستقبال والحجوزات' }}
              </span>
            </div>
            <h1 class="text-2xl font-bold text-slate-900 mt-1">
              {{ authService.isAdmin() ? 'إدارة العيادات والكوادر الطبية' : 'متابعة المراجعين ومكتب الاستقبال' }}
            </h1>
            <p class="text-sm text-slate-500 mt-1">
              {{ authService.isAdmin() 
                ? 'التحكم في بيانات الأطباء، المديرين، موظفي الاستقبال، المرضى، ومتابعة تدفق الحجوزات الطبية' 
                : 'متابعة مواعيد كشوفات اليوم، تأكيد الحضور، وتحديث حالات الحجوزات الطبية' }}
            </p>
          </div>

          <div class="flex items-center gap-2.5 flex-wrap" *ngIf="authService.isAdmin()">
            <button 
              (click)="openAddDoctorModal()"
              class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition shadow-xs cursor-pointer"
            >
              <span>+ إضافة طبيب</span>
            </button>
            <button 
              (click)="openAddStaffModal('Receptionist')"
              class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs transition shadow-xs cursor-pointer"
            >
              <span>+ إضافة موظف استقبال</span>
            </button>
            <div class="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>
            <button 
              (click)="openAddStaffModal('Admin')"
              class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs transition shadow-xs cursor-pointer"
            >
              <span>🛡️ + إضافة مدير</span>
            </button>
          </div>
        </div>

        <!-- Metric Cards -->
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div *ngIf="authService.isAdmin() || authService.isReceptionist()" class="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
            <div class="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-lg shrink-0">
              🩺
            </div>
            <div>
              <p class="text-xs text-slate-500 font-medium">إجمالي الأطباء</p>
              <p class="text-xl font-bold text-slate-900 mt-0.5">{{ doctors().length }}</p>
            </div>
          </div>

          <div *ngIf="authService.isAdmin()" class="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
            <div class="w-11 h-11 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-lg shrink-0">
              📋
            </div>
            <div>
              <p class="text-xs text-slate-500 font-medium">طاقم الاستقبال</p>
              <p class="text-xl font-bold text-slate-900 mt-0.5">{{ receptionistsCount() }}</p>
            </div>
          </div>

          <div class="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
            <div class="w-11 h-11 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-lg shrink-0">
              👥
            </div>
            <div>
              <p class="text-xs text-slate-500 font-medium">المرضى المسجلين</p>
              <p class="text-xl font-bold text-slate-900 mt-0.5">{{ patients().length }}</p>
            </div>
          </div>

          <div class="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
            <div class="w-11 h-11 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-lg shrink-0">
              📅
            </div>
            <div>
              <p class="text-xs text-slate-500 font-medium">سجل الحجوزات</p>
              <p class="text-xl font-bold text-slate-900 mt-0.5">{{ allAppointments().length }}</p>
            </div>
          </div>

          <div *ngIf="authService.isAdmin()" class="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
            <div class="w-11 h-11 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold text-lg shrink-0">
              🛡️
            </div>
            <div>
              <p class="text-xs text-slate-500 font-medium">المديرون والمسؤولون</p>
              <p class="text-xl font-bold text-slate-900 mt-0.5">{{ adminsCount() }}</p>
            </div>
          </div>

          <div *ngIf="authService.isReceptionist() && !authService.isAdmin()" class="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
            <div class="w-11 h-11 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-lg shrink-0">
              ⏰
            </div>
            <div>
              <p class="text-xs text-slate-500 font-medium">حجوزات اليوم</p>
              <p class="text-xl font-bold text-teal-700 mt-0.5">{{ todayAppointmentsCount() }}</p>
            </div>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
          <!-- 1. الأطباء -->
          <button 
            *ngIf="authService.isAdmin() || authService.isReceptionist()"
            (click)="activeTab.set('doctors')"
            [class.bg-emerald-700]="activeTab() === 'doctors'"
            [class.text-white]="activeTab() === 'doctors'"
            [class.bg-white]="activeTab() !== 'doctors'"
            [class.text-slate-700]="activeTab() !== 'doctors'"
            class="px-5 py-2.5 rounded-2xl text-sm font-bold shadow-2xs transition cursor-pointer border border-slate-200 shrink-0"
          >
            🩺 الأطباء ({{ doctors().length }})
          </button>

          <!-- 2. المرضى -->
          <button 
            (click)="activeTab.set('patients')"
            [class.bg-emerald-700]="activeTab() === 'patients'"
            [class.text-white]="activeTab() === 'patients'"
            [class.bg-white]="activeTab() !== 'patients'"
            [class.text-slate-700]="activeTab() !== 'patients'"
            class="px-5 py-2.5 rounded-2xl text-sm font-bold shadow-2xs transition cursor-pointer border border-slate-200 shrink-0"
          >
            👥 المرضى ({{ patients().length }})
          </button>

          <!-- 3. كافة المواعيد والحجوزات -->
          <button 
            (click)="activeTab.set('appointments')"
            [class.bg-emerald-700]="activeTab() === 'appointments'"
            [class.text-white]="activeTab() === 'appointments'"
            [class.bg-white]="activeTab() !== 'appointments'"
            [class.text-slate-700]="activeTab() !== 'appointments'"
            class="px-5 py-2.5 rounded-2xl text-sm font-bold shadow-2xs transition cursor-pointer border border-slate-200 shrink-0"
          >
            📅 كافة المواعيد والحجوزات ({{ allAppointments().length }})
          </button>

          <!-- 4. المعاملات والمدفوعات المالية -->
          <button 
            (click)="activeTab.set('finances')"
            [class.bg-emerald-700]="activeTab() === 'finances'"
            [class.text-white]="activeTab() === 'finances'"
            [class.bg-white]="activeTab() !== 'finances'"
            [class.text-slate-700]="activeTab() !== 'finances'"
            class="px-5 py-2.5 rounded-2xl text-sm font-bold shadow-2xs transition cursor-pointer border border-slate-200 shrink-0"
          >
            💰 المعاملات والمدفوعات المالية ({{ allAppointments().length }})
          </button>

          <!-- 5. موظفو الاستقبال (Admin only) -->
          <button 
            *ngIf="authService.isAdmin()"
            (click)="activeTab.set('reception')"
            [class.bg-teal-700]="activeTab() === 'reception'"
            [class.text-white]="activeTab() === 'reception'"
            [class.bg-white]="activeTab() !== 'reception'"
            [class.text-slate-700]="activeTab() !== 'reception'"
            class="px-5 py-2.5 rounded-2xl text-sm font-bold shadow-2xs transition cursor-pointer border border-slate-200 shrink-0"
          >
            📋 موظفو الاستقبال ({{ receptionistsCount() }})
          </button>

          <!-- 6. المديرون ومسؤولو النظام (Admin only, on left side) -->
          <button 
            *ngIf="authService.isAdmin()"
            (click)="activeTab.set('admins')"
            [class.bg-slate-800]="activeTab() === 'admins'"
            [class.text-white]="activeTab() === 'admins'"
            [class.bg-white]="activeTab() !== 'admins'"
            [class.text-slate-700]="activeTab() !== 'admins'"
            class="ms-auto px-5 py-2.5 rounded-2xl text-sm font-bold shadow-2xs transition cursor-pointer border border-slate-200 shrink-0"
          >
            🛡️ المديرون ومسؤولو النظام ({{ adminsCount() }})
          </button>
        </div>

        <!-- Tab 1: Doctors Management -->
        <div *ngIf="activeTab() === 'doctors' && (authService.isAdmin() || authService.isReceptionist())" class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div class="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 class="text-lg font-bold text-slate-900">إدارة الأطباء والكوادر الطبية</h2>
              <p class="text-xs text-slate-500 mt-0.5">متابعة الأطباء النشطين، أرشيف المحذوفين، تعديل التخصصات وسعر الكشف ومواعيد العمل</p>
            </div>
            <div class="flex items-center gap-3 w-full sm:w-auto flex-wrap">
              <input 
                type="text" 
                [ngModel]="doctorSearch()" 
                (ngModelChange)="doctorSearch.set($event)"
                placeholder="البحث باسم الطبيب، التخصص، أو الترخيص..." 
                class="border border-slate-300 rounded-xl px-4 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none w-full sm:w-60"
              />

              <select 
                [ngModel]="doctorShiftFilter()" 
                (ngModelChange)="doctorShiftFilter.set($event)"
                class="border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 bg-white cursor-pointer">
                <option value="all">كافة الأطباء ({{ doctors().length }})</option>
                <option value="available">🟢 المتاحون بالعيادة حالياً</option>
                <option value="morning">☀️ الفترة الصباحية</option>
                <option value="evening">🌙 الفترة المسائية</option>
              </select>

              <button 
                *ngIf="authService.isAdmin()"
                (click)="openAddDoctorModal()"
                class="shrink-0 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <span>+</span>
                <span>إضافة طبيب جديد</span>
              </button>
            </div>
          </div>

          <!-- Doctor Sub Tabs -->
          <div class="flex items-center gap-2 border-b border-slate-100 px-6 pt-3 bg-slate-50/60">
            <button 
              (click)="doctorSubTab.set('active')"
              [class.border-emerald-600]="doctorSubTab() === 'active'"
              [class.text-emerald-700]="doctorSubTab() === 'active'"
              [class.bg-white]="doctorSubTab() === 'active'"
              [class.border-transparent]="doctorSubTab() !== 'active'"
              [class.text-slate-500]="doctorSubTab() !== 'active'"
              class="py-2.5 px-4 text-xs font-bold border-b-2 rounded-t-xl transition cursor-pointer flex items-center gap-2">
              <span>🩺 الأطباء المعتمدون</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold">{{ doctors().length }}</span>
            </button>
            <button 
              *ngIf="authService.isAdmin()"
              (click)="doctorSubTab.set('deleted')"
              [class.border-rose-600]="doctorSubTab() === 'deleted'"
              [class.text-rose-700]="doctorSubTab() === 'deleted'"
              [class.bg-white]="doctorSubTab() === 'deleted'"
              [class.border-transparent]="doctorSubTab() !== 'deleted'"
              [class.text-slate-500]="doctorSubTab() !== 'deleted'"
              class="py-2.5 px-4 text-xs font-bold border-b-2 rounded-t-xl transition cursor-pointer flex items-center gap-2">
              <span>🗑️ أرشيف الأطباء المحذوفين</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] bg-rose-100 text-rose-800 font-bold">{{ deletedDoctors().length }}</span>
            </button>
          </div>

          <!-- Active Doctors Table -->
          <div *ngIf="doctorSubTab() === 'active'" class="overflow-x-auto">
            <table class="w-full text-right text-sm">
              <thead class="bg-slate-50 text-slate-600 text-xs uppercase font-semibold">
                <tr>
                  <th class="p-4">الطبيب</th>
                  <th class="p-4">التخصص</th>
                  <th class="p-4">رقم الترخيص</th>
                  <th class="p-4">الخبرة</th>
                  <th class="p-4">سعر الكشف</th>
                  <th class="p-4">الحالة</th>
                  <th class="p-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-slate-700">
                <tr *ngFor="let doc of filteredDoctors()" class="hover:bg-slate-50/70 transition">
                  <td class="p-4 flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0">
                      {{ doc.avatarInitial }}
                    </div>
                    <div>
                      <p class="font-bold text-slate-900">{{ doc.fullName }}</p>
                      <p class="text-xs text-slate-400">{{ doc.email }}</p>
                      <div class="flex flex-wrap gap-1 mt-1">
                        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold border border-emerald-100 text-[10px]">
                          <span>☀️ صباحاً:</span>
                          <span>{{ formatTime(doc.workStartTime || '09:00') }} - {{ formatTime(doc.workEndTime || '14:00') }}</span>
                        </span>
                        <span *ngIf="doc.eveningStartTime && doc.eveningEndTime" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 font-semibold border border-teal-100 text-[10px]">
                          <span>🌙 مساءً:</span>
                          <span>{{ formatTime(doc.eveningStartTime) }} - {{ formatTime(doc.eveningEndTime) }}</span>
                        </span>
                      </div>
                    </div>
                  </td>
                  <td class="p-4">
                    <span class="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-100">
                      {{ doc.specialization }}
                    </span>
                    <span class="text-[10px] text-emerald-800 font-bold block mt-1">جلسات كل {{ doc.slotDurationMinutes || 20 }} دقيقة</span>
                  </td>
                  <td class="p-4 text-xs font-mono text-slate-600">{{ doc.licenseNumber || '—' }}</td>
                  <td class="p-4 text-xs font-medium">{{ doc.yearsOfExperience }} سنوات</td>
                  <td class="p-4 text-xs font-bold text-emerald-800">{{ doc.consultationFee }} ج.م</td>
                  <td class="p-4">
                    <span 
                      class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                      [ngClass]="doc.isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'"
                    >
                      <span class="w-1.5 h-1.5 rounded-full" [ngClass]="doc.isAvailable ? 'bg-emerald-600' : 'bg-rose-600'"></span>
                      {{ doc.isAvailable ? 'متاح' : 'غير متاح' }}
                    </span>
                  </td>
                  <td class="p-4 text-center">
                    <div class="flex items-center justify-center gap-1.5 flex-wrap">
                      <button 
                        *ngIf="authService.isAdmin()"
                        (click)="openResetPasswordModalForDoctor(doc)"
                        class="text-xs bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-1.5 rounded-lg font-medium transition cursor-pointer"
                        title="تعيين / إعادة تعيين كلمة المرور للطبيب"
                      >
                        🔑 كلمة المرور
                      </button>
                      <button 
                        *ngIf="authService.isAdmin()"
                        (click)="openEditDoctorModal(doc)"
                        class="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-1.5 rounded-lg font-medium transition cursor-pointer"
                      >
                        تعديل
                      </button>
                      <button 
                        (click)="toggleDoctorAvailability(doc.id)"
                        class="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-lg font-medium transition cursor-pointer"
                      >
                        تبديل الإتاحة
                      </button>
                      <button 
                        *ngIf="authService.isAdmin()"
                        (click)="deleteDoctor(doc)"
                        class="text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-2.5 py-1.5 rounded-lg font-medium transition cursor-pointer"
                      >
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
                <tr *ngIf="filteredDoctors().length === 0">
                  <td colspan="7" class="p-8 text-center text-slate-400 text-xs">لا يوجد أطباء معتمدون يطابقون كلمة البحث</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Deleted / Archived Doctors Table -->
          <div *ngIf="doctorSubTab() === 'deleted'" class="overflow-x-auto">
            <table class="w-full text-right text-sm">
              <thead class="bg-rose-50/50 text-slate-600 text-xs uppercase font-semibold">
                <tr>
                  <th class="p-4">الطبيب المحذوف</th>
                  <th class="p-4">التخصص</th>
                  <th class="p-4">رقم الترخيص</th>
                  <th class="p-4">الخبرة</th>
                  <th class="p-4">الحالة</th>
                  <th class="p-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-slate-700">
                <tr *ngFor="let doc of filteredDeletedDoctors()" class="hover:bg-slate-50/70 transition opacity-80 hover:opacity-100">
                  <td class="p-4 flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-slate-200 text-slate-600 font-bold flex items-center justify-center shrink-0">
                      {{ doc.avatarInitial }}
                    </div>
                    <div>
                      <p class="font-bold text-slate-800 line-through">{{ doc.fullName }}</p>
                      <p class="text-xs text-slate-400">{{ doc.email }}</p>
                    </div>
                  </td>
                  <td class="p-4">
                    <span class="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      {{ doc.specialization }}
                    </span>
                  </td>
                  <td class="p-4 text-xs font-mono text-slate-600">{{ doc.licenseNumber || '—' }}</td>
                  <td class="p-4 text-xs font-medium">{{ doc.yearsOfExperience }} سنوات</td>
                  <td class="p-4">
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
                      <span class="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                      محذوف من المنظومة
                    </span>
                  </td>
                  <td class="p-4 text-center">
                    <button 
                      (click)="restoreDoctor(doc)"
                      class="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-1.5 rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1 mx-auto"
                    >
                      <span>استعادة الطبيب</span>
                      <span>🔄</span>
                    </button>
                  </td>
                </tr>
                <tr *ngIf="filteredDeletedDoctors().length === 0">
                  <td colspan="6" class="p-8 text-center text-slate-400 text-xs">أرشيف الأطباء المحذوفين فارغ حالياً.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tab: Admins Management -->
        <div *ngIf="activeTab() === 'admins' && authService.isAdmin()" class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div class="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 class="text-lg font-bold text-slate-900">المديرون ومسؤولو النظام</h2>
              <p class="text-xs text-slate-500 mt-0.5">إدارة حسابات إدارة المنظومة وصلاحيات التحكم الكاملة بالأطباء والمستخدمين</p>
            </div>
            <div class="flex items-center gap-3">
              <input 
                type="text" 
                [ngModel]="adminSearch()" 
                (ngModelChange)="adminSearch.set($event)"
                placeholder="البحث باسم المدير أو البريد..." 
                class="border border-slate-300 rounded-xl px-4 py-2 text-xs focus:ring-2 focus:ring-slate-500 focus:outline-none w-full sm:w-56"
              />
              <button 
                (click)="openAddStaffModal('Admin')"
                class="shrink-0 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition cursor-pointer"
              >
                + إضافة مدير نظام جديد
              </button>
            </div>
          </div>

          <!-- Admin Sub Tabs -->
          <div class="flex items-center gap-2 border-b border-slate-100 px-6 pt-3 bg-slate-50/60">
            <button 
              (click)="adminSubTab.set('active')"
              [class.border-slate-800]="adminSubTab() === 'active'"
              [class.text-slate-900]="adminSubTab() === 'active'"
              [class.bg-white]="adminSubTab() === 'active'"
              [class.border-transparent]="adminSubTab() !== 'active'"
              [class.text-slate-500]="adminSubTab() !== 'active'"
              class="py-2.5 px-4 text-xs font-bold border-b-2 rounded-t-xl transition cursor-pointer flex items-center gap-2">
              <span>⚡ المديرون المعتمدون</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] bg-slate-200 text-slate-800 font-bold">{{ activeAdmins().length }}</span>
            </button>
            <button 
              (click)="adminSubTab.set('archived')"
              [class.border-rose-600]="adminSubTab() === 'archived'"
              [class.text-rose-700]="adminSubTab() === 'archived'"
              [class.bg-white]="adminSubTab() === 'archived'"
              [class.border-transparent]="adminSubTab() !== 'archived'"
              [class.text-slate-500]="adminSubTab() !== 'archived'"
              class="py-2.5 px-4 text-xs font-bold border-b-2 rounded-t-xl transition cursor-pointer flex items-center gap-2">
              <span>📁 أرشيف المديرين المعطلين</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] bg-rose-100 text-rose-800 font-bold">{{ archivedAdmins().length }}</span>
            </button>
          </div>

          <!-- Active Admins Table -->
          <div *ngIf="adminSubTab() === 'active'" class="overflow-x-auto">
            <table class="w-full text-right text-sm">
              <thead class="bg-slate-50 text-slate-600 text-xs uppercase font-semibold">
                <tr>
                  <th class="p-4">المدير المسؤول</th>
                  <th class="p-4">البريد الإلكتروني</th>
                  <th class="p-4">الدور / الصلاحية</th>
                  <th class="p-4">الحالة</th>
                  <th class="p-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-slate-700">
                <tr *ngFor="let admin of filteredActiveAdmins()" class="hover:bg-slate-50/70 transition">
                  <td class="p-4 flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 font-bold flex items-center justify-center shrink-0">
                      {{ admin.firstName ? admin.firstName.charAt(0) : 'م' }}
                    </div>
                    <div>
                      <p class="font-bold text-slate-900">{{ admin.firstName }} {{ admin.lastName }}</p>
                    </div>
                  </td>
                  <td class="p-4 text-xs font-mono">{{ admin.email }}</td>
                  <td class="p-4">
                    <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
                      مدير نظام (Admin)
                    </span>
                  </td>
                  <td class="p-4">
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                      <span class="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                      نشط
                    </span>
                  </td>
                  <td class="p-4 text-center">
                    <div class="flex items-center justify-center gap-1.5 flex-wrap">
                      <button 
                        (click)="openResetPasswordModal(admin)"
                        class="text-xs bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-1.5 rounded-lg font-medium transition cursor-pointer"
                        title="إعادة تعيين كلمة المرور للمدير"
                      >
                        🔑 كلمة المرور
                      </button>
                      <button 
                        *ngIf="admin.isLocked"
                        (click)="unlockStaffAccount(admin)"
                        class="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-2.5 py-1.5 rounded-lg font-medium transition cursor-pointer"
                        title="فك قفل الحساب"
                      >
                        🔓 فك القفل
                      </button>
                      <button 
                        (click)="toggleStaffStatus(admin)"
                        class="text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-2.5 py-1.5 rounded-lg font-medium transition cursor-pointer"
                      >
                        تعطيل الحساب
                      </button>
                    </div>
                  </td>
                </tr>
                <tr *ngIf="filteredActiveAdmins().length === 0">
                  <td colspan="5" class="p-8 text-center text-slate-400 text-xs">لا يوجد مديرو نظام نشطون حالياً</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Archived / Disabled Admins Table -->
          <div *ngIf="adminSubTab() === 'archived'" class="overflow-x-auto">
            <table class="w-full text-right text-sm">
              <thead class="bg-slate-50 text-slate-600 text-xs uppercase font-semibold">
                <tr>
                  <th class="p-4">المدير المسؤول</th>
                  <th class="p-4">البريد الإلكتروني</th>
                  <th class="p-4">الدور / الصلاحية</th>
                  <th class="p-4">الحالة</th>
                  <th class="p-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-slate-700">
                <tr *ngFor="let admin of filteredArchivedAdmins()" class="hover:bg-slate-50/70 transition bg-slate-50/30">
                  <td class="p-4 flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 border border-rose-200 font-bold flex items-center justify-center shrink-0">
                      {{ admin.firstName ? admin.firstName.charAt(0) : 'م' }}
                    </div>
                    <div>
                      <p class="font-bold text-slate-900">{{ admin.firstName }} {{ admin.lastName }}</p>
                    </div>
                  </td>
                  <td class="p-4 text-xs font-mono text-slate-500">{{ admin.email }}</td>
                  <td class="p-4">
                    <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      مدير نظام (Admin)
                    </span>
                  </td>
                  <td class="p-4">
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
                      <span class="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                      معطل / في الأرشيف
                    </span>
                  </td>
                  <td class="p-4 text-center">
                    <button 
                      (click)="toggleStaffStatus(admin)"
                      class="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-1.5 rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1 mx-auto"
                    >
                      <span>🔄 تفعيل واستعادة الحساب</span>
                    </button>
                  </td>
                </tr>
                <tr *ngIf="filteredArchivedAdmins().length === 0">
                  <td colspan="5" class="p-8 text-center text-slate-400 text-xs">أرشيف مديري النظام المعطلين فارغ حالياً</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tab: Receptionists Management -->
        <div *ngIf="activeTab() === 'reception' && authService.isAdmin()" class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div class="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 class="text-lg font-bold text-slate-900">طاقم موظفي الاستقبال</h2>
              <p class="text-xs text-slate-500 mt-0.5">إدارة حسابات الاستقبال وصلاحيات حجز وتأكيد المواعيد بالعيادة</p>
            </div>
            <div class="flex items-center gap-3">
              <input 
                type="text" 
                [ngModel]="receptionSearch()" 
                (ngModelChange)="receptionSearch.set($event)"
                placeholder="البحث باسم الموظف أو البريد..." 
                class="border border-slate-300 rounded-xl px-4 py-2 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none w-full sm:w-56"
              />
              <button 
                (click)="openAddStaffModal('Receptionist')"
                class="shrink-0 px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs transition cursor-pointer"
              >
                + إضافة موظف استقبال جديد
              </button>
            </div>
          </div>

          <!-- Reception Sub Tabs -->
          <div class="flex items-center gap-2 border-b border-slate-100 px-6 pt-3 bg-slate-50/60">
            <button 
              (click)="receptionSubTab.set('active')"
              [class.border-teal-700]="receptionSubTab() === 'active'"
              [class.text-teal-800]="receptionSubTab() === 'active'"
              [class.bg-white]="receptionSubTab() === 'active'"
              [class.border-transparent]="receptionSubTab() !== 'active'"
              [class.text-slate-500]="receptionSubTab() !== 'active'"
              class="py-2.5 px-4 text-xs font-bold border-b-2 rounded-t-xl transition cursor-pointer flex items-center gap-2">
              <span>📋 موظفو الاستقبال (النشطون)</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] bg-teal-100 text-teal-800 font-bold">{{ activeReceptionists().length }}</span>
            </button>
            <button 
              (click)="receptionSubTab.set('archived')"
              [class.border-rose-600]="receptionSubTab() === 'archived'"
              [class.text-rose-700]="receptionSubTab() === 'archived'"
              [class.bg-white]="receptionSubTab() === 'archived'"
              [class.border-transparent]="receptionSubTab() !== 'archived'"
              [class.text-slate-500]="receptionSubTab() !== 'archived'"
              class="py-2.5 px-4 text-xs font-bold border-b-2 rounded-t-xl transition cursor-pointer flex items-center gap-2">
              <span>📁 أرشيف موظفي الاستقبال المعطلين</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] bg-rose-100 text-rose-800 font-bold">{{ archivedReceptionists().length }}</span>
            </button>
          </div>

          <!-- Active Receptionists Table -->
          <div *ngIf="receptionSubTab() === 'active'" class="overflow-x-auto">
            <table class="w-full text-right text-sm">
              <thead class="bg-slate-50 text-slate-600 text-xs uppercase font-semibold">
                <tr>
                  <th class="p-4">موظف الاستقبال</th>
                  <th class="p-4">البريد الإلكتروني</th>
                  <th class="p-4">الدور / الصلاحية</th>
                  <th class="p-4">الحالة</th>
                  <th class="p-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-slate-700">
                <tr *ngFor="let staff of filteredActiveReceptionists()" class="hover:bg-slate-50/70 transition">
                  <td class="p-4 flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 font-bold flex items-center justify-center shrink-0">
                      {{ staff.firstName ? staff.firstName.charAt(0) : 'م' }}
                    </div>
                    <div>
                      <p class="font-bold text-slate-900">{{ staff.firstName }} {{ staff.lastName }}</p>
                    </div>
                  </td>
                  <td class="p-4 text-xs font-mono">{{ staff.email }}</td>
                  <td class="p-4">
                    <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800">
                      موظف استقبال (Receptionist)
                    </span>
                  </td>
                  <td class="p-4">
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                      <span class="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                      نشط
                    </span>
                  </td>
                  <td class="p-4 text-center">
                    <div class="flex items-center justify-center gap-1.5 flex-wrap">
                      <button 
                        (click)="openResetPasswordModal(staff)"
                        class="text-xs bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-1.5 rounded-lg font-medium transition cursor-pointer"
                        title="إعادة تعيين كلمة المرور لموظف الاستقبال"
                      >
                        🔑 كلمة المرور
                      </button>
                      <button 
                        *ngIf="staff.isLocked"
                        (click)="unlockStaffAccount(staff)"
                        class="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-2.5 py-1.5 rounded-lg font-medium transition cursor-pointer"
                        title="فك قفل الحساب"
                      >
                        🔓 فك القفل
                      </button>
                      <button 
                        (click)="toggleStaffStatus(staff)"
                        class="text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-2.5 py-1.5 rounded-lg font-medium transition cursor-pointer"
                      >
                        تعطيل الحساب
                      </button>
                    </div>
                  </td>
                </tr>
                <tr *ngIf="filteredActiveReceptionists().length === 0">
                  <td colspan="5" class="p-8 text-center text-slate-400 text-xs">لا يوجد موظفو استقبال نشطون حالياً</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Archived / Disabled Receptionists Table -->
          <div *ngIf="receptionSubTab() === 'archived'" class="overflow-x-auto">
            <table class="w-full text-right text-sm">
              <thead class="bg-slate-50 text-slate-600 text-xs uppercase font-semibold">
                <tr>
                  <th class="p-4">موظف الاستقبال</th>
                  <th class="p-4">البريد الإلكتروني</th>
                  <th class="p-4">الدور / الصلاحية</th>
                  <th class="p-4">الحالة</th>
                  <th class="p-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-slate-700">
                <tr *ngFor="let staff of filteredArchivedReceptionists()" class="hover:bg-slate-50/70 transition bg-slate-50/30">
                  <td class="p-4 flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 border border-rose-200 font-bold flex items-center justify-center shrink-0">
                      {{ staff.firstName ? staff.firstName.charAt(0) : 'م' }}
                    </div>
                    <div>
                      <p class="font-bold text-slate-900">{{ staff.firstName }} {{ staff.lastName }}</p>
                    </div>
                  </td>
                  <td class="p-4 text-xs font-mono text-slate-500">{{ staff.email }}</td>
                  <td class="p-4">
                    <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800">
                      موظف استقبال (Receptionist)
                    </span>
                  </td>
                  <td class="p-4">
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
                      <span class="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                      معطل / في الأرشيف
                    </span>
                  </td>
                  <td class="p-4 text-center">
                    <button 
                      (click)="toggleStaffStatus(staff)"
                      class="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-1.5 rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1 mx-auto"
                    >
                      <span>🔄 تفعيل واستعادة الحساب</span>
                    </button>
                  </td>
                </tr>
                <tr *ngIf="filteredArchivedReceptionists().length === 0">
                  <td colspan="5" class="p-8 text-center text-slate-400 text-xs">أرشيف موظفي الاستقبال المعطلين فارغ حالياً</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tab 2: Patients Management -->
        <div *ngIf="activeTab() === 'patients'" class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div class="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 class="text-lg font-bold text-slate-900">سجل المرضى المسجلين</h2>
              <p class="text-xs text-slate-500 mt-0.5">البحث في بيانات المرضى، متابعة الملفات الشخصية وإدارة صلاحيات الدخول</p>
            </div>
            <input 
              type="text" 
              [ngModel]="patientSearch()" 
              (ngModelChange)="patientSearch.set($event)"
              placeholder="البحث باسم المريض أو البريد..." 
              class="border border-slate-300 rounded-xl px-4 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none w-full sm:w-64"
            />
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-right text-sm">
              <thead class="bg-slate-50 text-slate-600 text-xs uppercase font-semibold">
                <tr>
                  <th class="p-4">المريض</th>
                  <th class="p-4">البريد الإلكتروني</th>
                  <th class="p-4">رقم الهاتف</th>
                  <th class="p-4">الجنس</th>
                  <th class="p-4">تاريخ الميلاد</th>
                  <th class="p-4">حالة الحساب</th>
                  <th class="p-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-slate-700">
                <tr *ngFor="let pat of filteredPatients()" class="hover:bg-slate-50/70 transition">
                  <td class="p-4 font-bold text-slate-900">
                    {{ pat.fullName || (pat.firstName + ' ' + pat.lastName) }}
                  </td>
                  <td class="p-4 text-xs text-slate-500">{{ pat.email }}</td>
                  <td class="p-4 text-xs font-mono" dir="ltr">{{ pat.phoneNumber || '—' }}</td>
                  <td class="p-4 text-xs font-medium">{{ getGenderLabel(pat.gender) }}</td>
                  <td class="p-4 text-xs text-slate-500">{{ pat.dateOfBirth || '—' }}</td>
                  <td class="p-4">
                    <span 
                      class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                      [ngClass]="!pat.isDeleted ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'"
                    >
                      <span class="w-1.5 h-1.5 rounded-full" [ngClass]="!pat.isDeleted ? 'bg-emerald-600' : 'bg-rose-600'"></span>
                      {{ !pat.isDeleted ? 'نشط' : 'معطل' }}
                    </span>
                  </td>
                  <td class="p-4 text-center">
                    <div class="flex items-center justify-center gap-1.5 flex-wrap">
                      <button 
                        (click)="openPatientHistoryModal(pat)"
                        class="text-xs bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 px-2.5 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1"
                        title="عرض الملف الطبي وسجل الزيارات السابقة للمريض"
                      >
                        <span>📋</span>
                        <span>سجل الزيارات</span>
                      </button>
                      <button 
                        *ngIf="authService.isAdmin()"
                        (click)="togglePatientStatus(pat)"
                        [class.bg-rose-50]="!pat.isDeleted"
                        [class.hover:bg-rose-100]="!pat.isDeleted"
                        [class.text-rose-700]="!pat.isDeleted"
                        [class.border-rose-200]="!pat.isDeleted"
                        [class.bg-emerald-50]="pat.isDeleted"
                        [class.hover:bg-emerald-100]="pat.isDeleted"
                        [class.text-emerald-700]="pat.isDeleted"
                        [class.border-emerald-200]="pat.isDeleted"
                        class="text-xs px-2.5 py-1.5 rounded-lg font-bold border transition cursor-pointer"
                      >
                        {{ !pat.isDeleted ? 'تعطيل الحساب' : 'تفعيل الحساب' }}
                      </button>
                    </div>
                  </td>
                </tr>
                <tr *ngIf="filteredPatients().length === 0">
                  <td colspan="7" class="p-8 text-center text-xs text-slate-400 font-medium">
                    لا يوجد مرضى يطابقون كلمة البحث.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tab 3: Appointments Overview with Filters & Reception Actions -->
        <div *ngIf="activeTab() === 'appointments'" class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          
          <!-- Operational Stats Banner -->
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-slate-50/80 border-b border-slate-100">
            <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div class="flex items-center justify-between">
                <span class="text-xs text-slate-500 font-medium">📅 إجمالي الحجوزات</span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">الكل</span>
              </div>
              <p class="text-xl font-bold text-slate-800 mt-1">{{ allAppointments().length }}</p>
              <p class="text-[10px] text-slate-400 mt-0.5">كافة المواعيد المسجلة</p>
            </div>

            <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div class="flex items-center justify-between">
                <span class="text-xs text-slate-500 font-medium">⏰ حجوزات اليوم</span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">اليوم</span>
              </div>
              <p class="text-xl font-bold text-teal-700 mt-1">{{ todayAppointmentsCount() }}</p>
              <p class="text-[10px] text-slate-400 mt-0.5">مواعيد تاريخ اليوم الحالي</p>
            </div>

            <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div class="flex items-center justify-between">
                <span class="text-xs text-slate-500 font-medium">🏥 كشوفات العيادة</span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">حضوري</span>
              </div>
              <p class="text-xl font-bold text-slate-800 mt-1">{{ inClinicAppointmentsCount() }}</p>
              <p class="text-[10px] text-slate-400 mt-0.5">حضور مباشر لمقر العيادة</p>
            </div>

            <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div class="flex items-center justify-between">
                <span class="text-xs text-slate-500 font-medium">💻 استشارات أونلاين</span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">عن بُعد</span>
              </div>
              <p class="text-xl font-bold text-blue-700 mt-1">{{ onlineAppointmentsCount() }}</p>
              <p class="text-[10px] text-slate-400 mt-0.5">جلسات استشارة بالفيديو</p>
            </div>
          </div>

          <!-- Appointments List Header & Filters -->
          <div>
            <div class="p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h2 class="text-lg font-bold text-slate-900">سجل وإدارة حجوزات العيادة</h2>
                <p class="text-xs text-slate-500 mt-0.5">البحث برقم الحجز، الطبيب، المريض، وفلترة الحالات، وتحديث إجراء الاستقبال وتصدير الجداول</p>
              </div>
              
              <div class="flex items-center gap-2.5 flex-wrap">
                <input 
                  type="text" 
                  [ngModel]="appointmentSearch()" 
                  (ngModelChange)="appointmentSearch.set($event)"
                  placeholder="بحث برقم الحجز أو الاسم..." 
                  class="border border-slate-300 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none w-full sm:w-44"
                />

                <select 
                  [ngModel]="appointmentStatusFilter()" 
                  (ngModelChange)="appointmentStatusFilter.set($event)"
                  class="border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 bg-white cursor-pointer">
                  <option value="all">كافة الحالات</option>
                  <option value="1">قيد الانتظار</option>
                  <option value="2">مؤكد ومجدول</option>
                  <option value="3">حضر المريض / جاري الكشف</option>
                  <option value="4">تم الكشف</option>
                  <option value="5">ملغي</option>
                  <option value="6">لم يحضر (No-Show)</option>
                </select>

                <select 
                  [ngModel]="appointmentDateFilter()" 
                  (ngModelChange)="appointmentDateFilter.set($event)"
                  class="border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 bg-white cursor-pointer">
                  <option value="all">كافة التواريخ</option>
                  <option value="today">حجوزات اليوم 📅</option>
                  <option value="upcoming">المواعيد القادمة ⏳</option>
                  <option value="past">المواعيد السابقة / الأرشيف 📜</option>
                </select>

                <div class="flex items-center gap-2 flex-wrap">
                  <button 
                    (click)="openWalkinBookingModal()"
                    class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs transition cursor-pointer shadow-xs"
                    title="حجز موعد لمراجع حضوري بمقر العيادة"
                  >
                    <span>+</span>
                    <span>حجز كشف عيادة</span>
                  </button>

                  <button 
                    (click)="exportAppointmentsToCsv()"
                    class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs transition cursor-pointer"
                    title="تصدير الحجوزات الحالية لملف Excel / CSV"
                  >
                    <span>📥</span>
                    <span>تصدير Excel</span>
                  </button>

                  <button 
                    (click)="printTodaySchedule()"
                    class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold text-xs transition cursor-pointer"
                    title="طباعة جدول مواعيد اليوم"
                  >
                    <span>🖨️</span>
                    <span>طباعة جدول اليوم</span>
                  </button>
                </div>
              </div>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-right text-sm">
                <thead class="bg-slate-50 text-slate-600 text-xs uppercase font-semibold">
                  <tr>
                    <th class="p-4">رقم الحجز</th>
                    <th class="p-4">المريض</th>
                    <th class="p-4">الطبيب</th>
                    <th class="p-4">نوع الكشف</th>
                    <th class="p-4">التاريخ والوقت</th>
                    <th class="p-4">سعر الكشف</th>
                    <th class="p-4">حالة السداد</th>
                    <th class="p-4">الحالة الحالية</th>
                    <th class="p-4 text-center">إجراء الاستقبال والدفع</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-slate-700">
                  <tr *ngFor="let apt of filteredAppointments()" class="hover:bg-slate-50/70 transition">
                    <td class="p-4 font-mono font-bold text-xs text-emerald-800">#{{ apt.id }}</td>
                    <td class="p-4 font-bold text-slate-900">{{ getDisplayPatientName(apt) }}</td>
                    <td class="p-4 text-slate-700">{{ apt.doctorName }}</td>
                    <td class="p-4 text-xs">
                      <span *ngIf="apt.isOnline" class="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">💻 أونلاين</span>
                      <span *ngIf="!apt.isOnline" class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">🏥 عيادة</span>
                    </td>
                    <td class="p-4 text-xs text-slate-600 font-mono">
                      {{ apt.appointmentDate }} | {{ formatTime(apt.appointmentTime) }}
                    </td>
                    <td class="p-4 text-xs font-bold text-slate-900 font-mono">
                      {{ getAppointmentFee(apt) }} ج.م
                    </td>
                    <td class="p-4">
                      <span 
                        class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold"
                        [ngClass]="getPaymentBadge(apt.paymentStatus)"
                      >
                        <span class="w-1.5 h-1.5 rounded-full" [ngClass]="getPaymentDot(apt.paymentStatus)"></span>
                        {{ getPaymentText(apt.paymentStatus) }}
                      </span>
                    </td>
                    <td class="p-4">
                      <span 
                        class="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                        [ngClass]="getStatusBadge(apt.status)"
                      >
                        {{ getStatusText(apt.status) }}
                      </span>
                    </td>
                    <td class="p-4 text-center">
                      <div class="flex items-center justify-center gap-1.5 flex-wrap">
                        <!-- 1-Click Fast Check-in Button -->
                        <button 
                          *ngIf="getStatusValue(apt.status) === 1 || getStatusValue(apt.status) === 2"
                          (click)="onUpdateAppointmentStatus(apt.id, 3)"
                          class="px-2.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] transition cursor-pointer shadow-xs flex items-center gap-1"
                          title="تسجيل حضور المريض بالعيادة فوراً بنقرة واحدة"
                        >
                          <span>🩺</span>
                          <span>حضور المريض</span>
                        </button>

                        <button 
                          *ngIf="getStatusValue(apt.status) === 3"
                          (click)="onUpdateAppointmentStatus(apt.id, 4)"
                          class="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition cursor-pointer shadow-xs flex items-center gap-1"
                          title="تأكيد انتهاء الكشف بنجاح"
                        >
                          <span>✅</span>
                          <span>تم الكشف</span>
                        </button>

                        <select 
                          [value]="getStatusValue(apt.status)" 
                          (change)="onUpdateAppointmentStatus(apt.id, $any($event.target).value)"
                          title="تحديث حالة حضور الموعد"
                          class="text-xs font-bold px-2 py-1.5 rounded-xl border border-slate-300 bg-white hover:border-emerald-500 focus:outline-emerald-600 cursor-pointer shadow-2xs">
                          <option [value]="1">⏳ قيد الانتظار</option>
                          <option [value]="2">📅 مؤكد ومجدول</option>
                          <option [value]="3">🩺 حضر / جاري الكشف</option>
                          <option [value]="4">✅ تم الكشف</option>
                          <option [value]="6">⚠️ لم يحضر (No-Show)</option>
                          <option [value]="5">❌ إلغاء الموعد</option>
                        </select>

                        <select 
                          [value]="getPaymentValue(apt.paymentStatus)" 
                          (change)="onUpdatePaymentStatus(apt.id, $any($event.target).value)"
                          title="تحديث حالة تحصيل الرسوم"
                          class="text-xs font-bold px-2 py-1.5 rounded-xl border border-slate-300 bg-white hover:border-emerald-500 focus:outline-emerald-600 cursor-pointer shadow-2xs">
                          <option [value]="1">❌ غير مدفوع</option>
                          <option [value]="2">💳 تم الدفع</option>
                          <option [value]="3">↩️ مسترد</option>
                        </select>

                        <button 
                          (click)="printPaymentReceipt(apt)"
                          class="px-2 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold text-[11px] transition cursor-pointer flex items-center gap-1"
                          title="طباعة إيصال السداد"
                        >
                          <span>🖨️</span>
                          <span>إيصال</span>
                        </button>

                        <button 
                          (click)="downloadAppointmentPrescription(apt)"
                          [disabled]="downloadingPrescriptionId() === apt.id"
                          class="px-2 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-[11px] transition cursor-pointer flex items-center gap-1 disabled:opacity-50"
                          title="تحميل وطباعة الروشتة الطبية"
                        >
                          <span *ngIf="downloadingPrescriptionId() !== apt.id">📄</span>
                          <span *ngIf="downloadingPrescriptionId() === apt.id" class="w-3 h-3 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin"></span>
                          <span>الروشتة</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr *ngIf="filteredAppointments().length === 0">
                    <td colspan="9" class="p-8 text-center text-xs text-slate-400 font-medium">
                      لا توجد حجوزات تطابق معايير البحث أو الفلترة المحددة.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Tab 4: Financial Transactions & Invoices (Standalone Tab) -->
        <div *ngIf="activeTab() === 'finances'" class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <!-- Financial Header & Search -->
          <div class="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 class="text-lg font-bold text-slate-900">المعاملات المالية والفواتير وسجل التحويلات</h2>
              <p class="text-xs text-slate-500 mt-0.5">متابعة إشعارات التحويل وحركات السداد، وتوثيق استلام رسوم الكشوفات بالعيادة وأونلاين وطباعة الإيصالات</p>
            </div>

            <div class="flex items-center gap-3 flex-wrap">
              <input 
                type="text" 
                [ngModel]="financeSearch()" 
                (ngModelChange)="financeSearch.set($event)"
                placeholder="بحث برقم الحركة، المريض، أو الطبيب..." 
                class="border border-slate-300 rounded-xl px-4 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none w-full sm:w-64"
              />

              <select 
                [ngModel]="financeStatusFilter()" 
                (ngModelChange)="financeStatusFilter.set($event)"
                class="border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 bg-white cursor-pointer">
                <option value="all">كافة المعاملات المالية</option>
                <option value="2">✅ تم الدفع فقط</option>
                <option value="1">⏳ غير مدفوع / معلق</option>
                <option value="3">↩️ مسترد (Refunded)</option>
              </select>
            </div>
          </div>

          <!-- Financial Summary Cards -->
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-slate-50/80 border-b border-slate-100">
            <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div class="flex items-center justify-between">
                <span class="text-xs text-slate-500 font-medium">💰 المحصل الفعلي</span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">تم الدفع</span>
              </div>
              <p class="text-xl font-extrabold text-emerald-700 mt-1">{{ totalPaidRevenue() | number }} ج.م</p>
              <p class="text-[10px] text-slate-400 mt-0.5">{{ paidAppointmentsCount() }} حركة مسددة بنجاح</p>
            </div>

            <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div class="flex items-center justify-between">
                <span class="text-xs text-slate-500 font-medium">💵 إيراد كشوفات اليوم</span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">اليوم</span>
              </div>
              <p class="text-xl font-extrabold text-teal-700 mt-1">{{ todayRevenue() | number }} ج.م</p>
              <p class="text-[10px] text-slate-400 mt-0.5">متحصلات مواعيد اليوم الحالي</p>
            </div>

            <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div class="flex items-center justify-between">
                <span class="text-xs text-slate-500 font-medium">⏳ مبالغ معلقة</span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">غير مدفوع</span>
              </div>
              <p class="text-xl font-extrabold text-rose-700 mt-1">{{ totalUnpaidAmount() | number }} ج.م</p>
              <p class="text-[10px] text-slate-400 mt-0.5">في انتظار السداد بالاستقبال</p>
            </div>

            <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div class="flex items-center justify-between">
                <span class="text-xs text-slate-500 font-medium">↩️ مبالغ مستردة</span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">استرداد</span>
              </div>
              <p class="text-xl font-extrabold text-amber-700 mt-1">{{ totalRefundedAmount() | number }} ج.م</p>
              <p class="text-[10px] text-slate-400 mt-0.5">للمواعيد الملغاة والمسترجعة</p>
            </div>
          </div>

          <!-- Transactions Log Table -->
          <div class="p-6">
            <div class="overflow-x-auto rounded-2xl border border-slate-200">
              <table class="w-full text-right text-xs">
                <thead class="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th class="p-3.5">رقم الحركة</th>
                    <th class="p-3.5">إشعار وبيان التحويل المالي</th>
                    <th class="p-3.5">تاريخ ووقت المعاملة</th>
                    <th class="p-3.5">طريقة التحصيل</th>
                    <th class="p-3.5">المبلغ</th>
                    <th class="p-3.5">حالة الدفع</th>
                    <th class="p-3.5 text-center">الإجراءات والطباعة</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-slate-700">
                  <tr *ngFor="let apt of filteredFinanceTransactions()" class="hover:bg-slate-50/60 transition">
                    <td class="p-3.5 font-mono font-bold text-emerald-800">
                      #TX-{{ apt.id }}
                    </td>
                    <td class="p-3.5">
                      <p class="font-bold text-slate-900">
                        {{ getPaymentValue(apt.paymentStatus) === 2 ? '✅ تم سداد وتحويل' : (getPaymentValue(apt.paymentStatus) === 3 ? '↩️ تم استرداد' : '⏳ مطالبة سداد') }} 
                        <span class="text-emerald-700 font-mono">{{ getAppointmentFee(apt) }} ج.م</span>
                      </p>
                      <p class="text-[11px] text-slate-500 mt-0.5">
                        حجز #{{ apt.id }} للمريض <strong class="text-slate-800">{{ getDisplayPatientName(apt) }}</strong> - د. {{ apt.doctorName }} ({{ apt.doctorSpecialization }})
                      </p>
                    </td>
                    <td class="p-3.5 font-mono text-slate-600">
                      {{ apt.appointmentDate }} | {{ formatTime(apt.appointmentTime) }}
                    </td>
                    <td class="p-3.5">
                      <span *ngIf="apt.isOnline" class="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">💳 بطاقة / أونلاين</span>
                      <span *ngIf="!apt.isOnline" class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">💵 نقدي / عيادة</span>
                    </td>
                    <td class="p-3.5 font-bold text-slate-900 font-mono">
                      {{ getAppointmentFee(apt) }} ج.م
                    </td>
                    <td class="p-3.5">
                      <span 
                        class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold"
                        [ngClass]="getPaymentBadge(apt.paymentStatus)"
                      >
                        <span class="w-1.5 h-1.5 rounded-full" [ngClass]="getPaymentDot(apt.paymentStatus)"></span>
                        {{ getPaymentText(apt.paymentStatus) }}
                      </span>
                    </td>
                    <td class="p-3.5 text-center">
                      <div class="flex items-center justify-center gap-1.5 flex-wrap">
                        <button 
                          *ngIf="getPaymentValue(apt.paymentStatus) !== 2"
                          (click)="onUpdatePaymentStatus(apt.id, 2)"
                          class="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] transition cursor-pointer"
                        >
                          تأكيد السداد
                        </button>
                        <button 
                          *ngIf="getPaymentValue(apt.paymentStatus) === 2"
                          (click)="onUpdatePaymentStatus(apt.id, 3)"
                          class="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold text-[11px] transition cursor-pointer"
                        >
                          استرداد
                        </button>
                        <button 
                          (click)="printPaymentReceipt(apt)"
                          class="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition cursor-pointer flex items-center gap-1"
                          title="طباعة إيصال السداد الرسمي"
                        >
                          <span>🖨️</span>
                          <span>إيصال</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr *ngIf="filteredFinanceTransactions().length === 0">
                    <td colspan="7" class="p-8 text-center text-xs text-slate-400 font-medium">
                      لا توجد معاملات أو تحويلات مالية تطابق البحث.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Add Doctor Modal -->
    <div 
      *ngIf="showAddDoctorModal()" 
      (click)="closeAddDoctorModal()"
      class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overscroll-contain"
    >
      <div 
        (click)="$event.stopPropagation()"
        class="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-4 max-h-[90vh] flex flex-col overscroll-contain animate-fade-in">
        <div class="bg-emerald-800 text-white p-6 flex items-center justify-between shrink-0">
          <div>
            <h2 class="text-lg font-bold">إضافة طبيب جديد للنظام</h2>
            <p class="text-xs text-emerald-200 mt-0.5">سيتم إرسال بريد تفعيل تلقائي للطبيب لإعداد كلمة المرور الخاصة به</p>
          </div>
          <button (click)="closeAddDoctorModal()" class="text-white/80 hover:text-white cursor-pointer">✕</button>
        </div>

        <form (ngSubmit)="submitNewDoctor()" class="p-6 sm:p-8 space-y-4 overflow-y-auto custom-scrollbar overscroll-contain flex-1">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">الاسم الأول *</label>
              <input type="text" [(ngModel)]="newDoctor.firstName" name="firstName" required class="w-full border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">اسم العائلة *</label>
              <input type="text" [(ngModel)]="newDoctor.lastName" name="lastName" required class="w-full border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">البريد الإلكتروني *</label>
              <input type="email" [(ngModel)]="newDoctor.email" name="email" required placeholder="doctor@clinic.com" class="w-full border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">رقم الهاتف *</label>
              <input type="tel" [(ngModel)]="newDoctor.phoneNumber" name="phoneNumber" required placeholder="01XXXXXXXXX" class="w-full border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            </div>
          </div>

          <!-- Initial Password Field (Instant Activation vs Activation Email) -->
          <div class="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/90 space-y-2">
            <div class="flex items-center justify-between">
              <label class="block text-xs font-bold text-amber-950 flex items-center gap-1.5">
                <span>🔑</span>
                <span>كلمة المرور الأولية للحساب (اختياري - دخول فوري)</span>
              </label>
              <span class="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-md font-semibold">تفعيل فوري</span>
            </div>
            <input 
              type="text" 
              [(ngModel)]="newDoctor.password" 
              name="doctorInitialPassword" 
              placeholder="اكتب كلمة مرور لتسجيل دخول الطبيب فوراً، أو اتركها فارغة لإرسال رابط تفعيل عبر الإيميل" 
              class="w-full border border-amber-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500 bg-white"
            />
            <p class="text-[10px] text-amber-800 leading-relaxed">
              💡 مفيدة عند استخدام بريد إلكتروني تجريبي أو وهمي لا يمكن الوصول إليه: ستتمكن من تسجيل الدخول بحساب الطبيب فوراً دون انتظار رسائل التفعيل.
            </p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">التخصص الطبي *</label>
              <input type="text" [(ngModel)]="newDoctor.specialization" name="specialization" required placeholder="مثال: باطنة، أطفال، عظام" class="w-full border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">سعر الكشف (ج.م) *</label>
              <input type="number" [(ngModel)]="newDoctor.consultationFee" name="consultationFee" required min="50" placeholder="250" class="w-full border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">سنوات الخبرة *</label>
              <input type="number" [(ngModel)]="newDoctor.yearsOfExperience" name="yearsOfExperience" required min="1" class="w-full border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">رقم ترخيص المهنة *</label>
              <input type="text" [(ngModel)]="newDoctor.licenseNumber" name="licenseNumber" required placeholder="MED-12345" class="w-full border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">النوع (الجنس) *</label>
              <select [(ngModel)]="newDoctor.gender" name="doctorGender" required class="w-full border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-medium">
                <option [ngValue]="1">ذكر</option>
                <option [ngValue]="2">أنثى</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">تاريخ الميلاد *</label>
              <input type="date" [(ngModel)]="newDoctor.dateOfBirth" name="dateOfBirth" required class="w-full border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">المؤهلات العلمية والشهادات *</label>
            <textarea [(ngModel)]="newDoctor.qualifications" name="qualifications" rows="2" required placeholder="بكالوريوس طب وجراحة، ماجستير..." class="w-full border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"></textarea>
          </div>

          <!-- Schedule & Shifts Settings (Morning & Evening Shifts) -->
          <div class="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <span>⏰</span>
                <span>فترات العمل اليومية (نظام الفترتين الصباحية والمسائية)</span>
              </span>
              <span class="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-semibold">تخصيص يدوي</span>
            </div>

            <!-- Morning Shift -->
            <div class="space-y-2">
              <p class="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                <span>☀️</span>
                <span>الفترة الصباحية (الأساسية)</span>
              </p>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-[10px] font-medium text-slate-600 mb-1">وقت بدء الفترة الصباحية</label>
                  <input 
                    type="time" 
                    [(ngModel)]="newDoctor.workStartTime" 
                    name="newWorkStartTime" 
                    class="w-full border rounded-xl px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-emerald-500 bg-white" 
                  />
                </div>

                <div>
                  <label class="block text-[10px] font-medium text-slate-600 mb-1">وقت نهاية الفترة الصباحية</label>
                  <input 
                    type="time" 
                    [(ngModel)]="newDoctor.workEndTime" 
                    name="newWorkEndTime" 
                    class="w-full border rounded-xl px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-emerald-500 bg-white" 
                  />
                </div>
              </div>
            </div>

            <!-- Evening Shift Toggle & Inputs -->
            <div class="pt-3 border-t border-emerald-200/60 space-y-2">
              <label class="inline-flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  [(ngModel)]="newDoctor.hasEveningShift" 
                  name="newHasEveningShift"
                  class="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                />
                <span class="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span>🌙</span>
                  <span>تفعيل فترة عمل مسائية ثانية (نظام الشيفتين)</span>
                </span>
              </label>

              <div *ngIf="newDoctor.hasEveningShift" class="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label class="block text-[10px] font-medium text-slate-600 mb-1">وقت بدء الفترة المسائية</label>
                  <input 
                    type="time" 
                    [(ngModel)]="newDoctor.eveningStartTime" 
                    name="newEveningStartTime" 
                    class="w-full border rounded-xl px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-emerald-500 bg-white" 
                  />
                </div>

                <div>
                  <label class="block text-[10px] font-medium text-slate-600 mb-1">وقت نهاية الفترة المسائية</label>
                  <input 
                    type="time" 
                    [(ngModel)]="newDoctor.eveningEndTime" 
                    name="newEveningEndTime" 
                    class="w-full border rounded-xl px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-emerald-500 bg-white" 
                  />
                </div>
              </div>
            </div>

            <!-- Slot Duration -->
            <div class="pt-3 border-t border-emerald-200/60">
              <label class="block text-[11px] font-bold text-slate-700 mb-1">مدة جلسة الكشف *</label>
              <select 
                [(ngModel)]="newDoctor.slotDurationMinutes" 
                name="newSlotDurationMinutes" 
                class="w-full border rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 bg-white font-medium cursor-pointer">
                <option [ngValue]="15">⏱️ 15 دقيقة (متابعات سريعة)</option>
                <option [ngValue]="20">⏱️ 20 دقيقة (فحص عام)</option>
                <option [ngValue]="30">⏱️ 30 دقيقة (أسنان / عظام / قلب)</option>
                <option [ngValue]="45">⏱️ 45 دقيقة (جلسات مطولة)</option>
                <option [ngValue]="60">⏱️ 60 دقيقة (استشارة شاملة)</option>
              </select>
            </div>
          </div>

          <!-- Error Alert at the bottom near submit button -->
          <div *ngIf="addDoctorError()" class="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold leading-relaxed">
            ⚠️ {{ addDoctorError() }}
          </div>

          <div class="pt-4 border-t flex items-center justify-end gap-3">
            <button type="button" (click)="closeAddDoctorModal()" class="px-4 py-2 rounded-xl border text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer">إلغاء</button>
            <button type="submit" [disabled]="isSubmittingDoctor()" class="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition cursor-pointer disabled:opacity-50">
              {{ isSubmittingDoctor() ? 'جاري الإضافة...' : 'حفظ وإضافة الطبيب' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit Doctor Modal -->
    <div 
      *ngIf="showEditDoctorModal() && editingDoctor" 
      (click)="closeEditDoctorModal()"
      class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overscroll-contain"
    >
      <div 
        (click)="$event.stopPropagation()"
        class="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-4 max-h-[90vh] flex flex-col overscroll-contain animate-fade-in">
        <div class="bg-emerald-800 text-white p-6 flex items-center justify-between shrink-0">
          <div>
            <h2 class="text-lg font-bold">تعديل بيانات الطبيب</h2>
            <p class="text-xs text-emerald-200 mt-0.5">تحديث التخصص، الخبرة، والمؤهلات الطبية</p>
          </div>
          <button (click)="closeEditDoctorModal()" class="text-white/80 hover:text-white cursor-pointer">✕</button>
        </div>

        <form (ngSubmit)="submitEditDoctor()" class="p-6 sm:p-8 space-y-4 overflow-y-auto custom-scrollbar overscroll-contain flex-1">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">الاسم الأول *</label>
              <input type="text" [(ngModel)]="editingDoctor.firstName" name="editFirstName" required class="w-full border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">اسم العائلة *</label>
              <input type="text" [(ngModel)]="editingDoctor.lastName" name="editLastName" required class="w-full border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">رقم الهاتف</label>
              <input type="tel" [(ngModel)]="editingDoctor.phoneNumber" name="editPhoneNumber" class="w-full border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">سعر الكشف (ج.م)</label>
              <input type="number" [(ngModel)]="editingDoctor.consultationFee" name="editConsultationFee" min="50" class="w-full border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">التخصص الطبي *</label>
              <input type="text" [(ngModel)]="editingDoctor.specialization" name="editSpecialization" required class="w-full border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">سنوات الخبرة *</label>
              <input type="number" [(ngModel)]="editingDoctor.yearsOfExperience" name="editYearsOfExperience" required min="1" class="w-full border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">المؤهلات العلمية والشهادات</label>
            <textarea [(ngModel)]="editingDoctor.qualifications" name="editQualifications" rows="2" class="w-full border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"></textarea>
          </div>

          <!-- Schedule & Shifts Settings (Morning & Evening Shifts) -->
          <div class="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <span>⏰</span>
                <span>فترات العمل اليومية (نظام الفترتين الصباحية والمسائية)</span>
              </span>
              <span class="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-semibold">تخصيص يدوي</span>
            </div>

            <!-- Morning Shift -->
            <div class="space-y-2">
              <p class="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                <span>☀️</span>
                <span>الفترة الصباحية (الأساسية)</span>
              </p>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-[10px] font-medium text-slate-600 mb-1">وقت بدء الفترة الصباحية</label>
                  <input 
                    type="time" 
                    [(ngModel)]="editingDoctor.workStartTime" 
                    name="editWorkStartTime" 
                    class="w-full border rounded-xl px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-emerald-500 bg-white" 
                  />
                </div>

                <div>
                  <label class="block text-[10px] font-medium text-slate-600 mb-1">وقت نهاية الفترة الصباحية</label>
                  <input 
                    type="time" 
                    [(ngModel)]="editingDoctor.workEndTime" 
                    name="editWorkEndTime" 
                    class="w-full border rounded-xl px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-emerald-500 bg-white" 
                  />
                </div>
              </div>
            </div>

            <!-- Evening Shift Toggle & Inputs -->
            <div class="pt-3 border-t border-emerald-200/60 space-y-2">
              <label class="inline-flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  [(ngModel)]="editingDoctor.hasEveningShift" 
                  name="editHasEveningShift"
                  class="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                />
                <span class="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span>🌙</span>
                  <span>تفعيل فترة عمل مسائية ثانية (نظام الشيفتين)</span>
                </span>
              </label>

              <div *ngIf="editingDoctor.hasEveningShift" class="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label class="block text-[10px] font-medium text-slate-600 mb-1">وقت بدء الفترة المسائية</label>
                  <input 
                    type="time" 
                    [(ngModel)]="editingDoctor.eveningStartTime" 
                    name="editEveningStartTime" 
                    class="w-full border rounded-xl px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-emerald-500 bg-white" 
                  />
                </div>

                <div>
                  <label class="block text-[10px] font-medium text-slate-600 mb-1">وقت نهاية الفترة المسائية</label>
                  <input 
                    type="time" 
                    [(ngModel)]="editingDoctor.eveningEndTime" 
                    name="editEveningEndTime" 
                    class="w-full border rounded-xl px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-emerald-500 bg-white" 
                  />
                </div>
              </div>
            </div>

            <!-- Slot Duration -->
            <div class="pt-3 border-t border-emerald-200/60">
              <label class="block text-[11px] font-bold text-slate-700 mb-1">مدة جلسة الكشف *</label>
              <select 
                [(ngModel)]="editingDoctor.slotDurationMinutes" 
                name="editSlotDurationMinutes" 
                class="w-full border rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 bg-white font-medium cursor-pointer">
                <option [ngValue]="15">⏱️ 15 دقيقة (متابعات سريعة)</option>
                <option [ngValue]="20">⏱️ 20 دقيقة (فحص عام)</option>
                <option [ngValue]="30">⏱️ 30 دقيقة (أسنان / عظام / قلب)</option>
                <option [ngValue]="45">⏱️ 45 دقيقة (جلسات مطولة)</option>
                <option [ngValue]="60">⏱️ 60 دقيقة (استشارة شاملة)</option>
              </select>
            </div>

            <p class="text-[10px] text-emerald-800 font-medium">
              💡 يؤدي تغيير فترات العمل أو مدة الكشف إلى إعادة توليد المواعيد بدقة في تقويم الحجز للمرضى لكلا الفترتين.
            </p>
          </div>

          <!-- Error Alert at bottom near submit button -->
          <div *ngIf="editDoctorError()" class="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold leading-relaxed">
            ⚠️ {{ editDoctorError() }}
          </div>

          <div class="pt-4 border-t flex items-center justify-end gap-3">
            <button type="button" (click)="closeEditDoctorModal()" class="px-4 py-2 rounded-xl border text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer">إلغاء</button>
            <button type="submit" [disabled]="isSubmittingEditDoctor()" class="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition cursor-pointer disabled:opacity-50">
              {{ isSubmittingEditDoctor() ? 'جاري الحفظ...' : 'حفظ التعديلات' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Add Staff / Admin / Receptionist Modal -->
    <div 
      *ngIf="showAddStaffModal()" 
      (click)="closeAddStaffModal()"
      class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overscroll-contain"
    >
      <div 
        (click)="$event.stopPropagation()"
        class="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-4 max-h-[90vh] flex flex-col overscroll-contain animate-fade-in">
        <div 
          [ngClass]="selectedStaffRole === 'Admin' ? 'bg-slate-900' : 'bg-teal-800'"
          class="text-white p-6 flex items-center justify-between shrink-0 transition-colors"
        >
          <div>
            <h2 class="text-lg font-bold">
              {{ selectedStaffRole === 'Admin' ? '🛡️ إضافة مدير نظام جديد' : '📋 إضافة موظف استقبال جديد' }}
            </h2>
            <p class="text-xs text-slate-200 mt-0.5">
              {{ selectedStaffRole === 'Admin' ? 'إنشاء حساب إدارة بصلاحيات تحكم كاملة في المنظومة' : 'إنشاء حساب لموظف الاستقبال لإدارة المواعيد وتأكيد الحجوزات' }}
            </p>
          </div>
          <button (click)="closeAddStaffModal()" class="text-white/80 hover:text-white cursor-pointer">✕</button>
        </div>

        <form (ngSubmit)="submitNewStaff()" class="p-6 sm:p-8 space-y-4 overflow-y-auto custom-scrollbar overscroll-contain flex-1">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">الاسم الأول (3 أحرف على الأقل) *</label>
              <input type="text" [(ngModel)]="newStaff.firstName" name="staffFirstName" required minlength="3" placeholder="أحمد" class="w-full border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">اسم العائلة (3 أحرف على الأقل) *</label>
              <input type="text" [(ngModel)]="newStaff.lastName" name="staffLastName" required minlength="3" placeholder="محمود" class="w-full border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none" />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">البريد الإلكتروني للعمل *</label>
              <input type="email" [(ngModel)]="newStaff.email" name="staffEmail" required [placeholder]="selectedStaffRole === 'Admin' ? 'admin@clinic.com' : 'reception@clinic.com'" class="w-full border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">رقم الهاتف *</label>
              <input type="tel" [(ngModel)]="newStaff.phoneNumber" name="staffPhoneNumber" required placeholder="01012345678" class="w-full border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">كلمة المرور الأولية للحساب *</label>
            <input type="password" [(ngModel)]="newStaff.password" name="staffPassword" required placeholder="مثال: Staff@2026!" class="w-full border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none font-mono" />
            <div class="mt-1.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
              <p class="font-semibold text-slate-800">متطلبات الأمان الإلزامية لكلمة المرور:</p>
              <ul class="list-disc list-inside text-slate-500 space-y-0.5">
                <li>8 خانات على الأقل</li>
                <li>حرف كبير (A-Z) وحرف صغير (a-z)</li>
                <li>رقم (0-9) ورمز خاص (مثل: @، #، $، !، %، *)</li>
              </ul>
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">النوع (الجنس) *</label>
            <div class="grid grid-cols-2 gap-3">
              <button 
                type="button" 
                (click)="newStaffGender = 1"
                [class.border-emerald-600]="newStaffGender === 1"
                [class.bg-emerald-50]="newStaffGender === 1"
                [class.text-emerald-900]="newStaffGender === 1"
                [class.border-slate-200]="newStaffGender !== 1"
                class="py-2.5 px-4 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>👨</span>
                <span>ذكر</span>
              </button>
              <button 
                type="button" 
                (click)="newStaffGender = 2"
                [class.border-emerald-600]="newStaffGender === 2"
                [class.bg-emerald-50]="newStaffGender === 2"
                [class.text-emerald-900]="newStaffGender === 2"
                [class.border-slate-200]="newStaffGender !== 2"
                class="py-2.5 px-4 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>👩</span>
                <span>أنثى</span>
              </button>
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">الدور والصلاحية الممنوحة للحساب</label>
            <div 
              [ngClass]="selectedStaffRole === 'Admin' ? 'bg-slate-100 text-slate-800 border-slate-200' : 'bg-teal-50 text-teal-800 border-teal-200'"
              class="p-3 rounded-xl border flex items-center gap-2.5 text-xs font-bold"
            >
              <span class="text-base">{{ selectedStaffRole === 'Admin' ? '🛡️' : '📋' }}</span>
              <div>
                <p class="font-bold text-slate-900">{{ selectedStaffRole === 'Admin' ? 'مدير ومسؤول نظام (Admin)' : 'موظف استقبال (Receptionist)' }}</p>
                <p class="text-[11px] font-normal text-slate-500 mt-0.5">
                  {{ selectedStaffRole === 'Admin' ? 'صلاحيات إدارة شاملة للأطباء والمستخدمين والمنظومة' : 'صلاحيات حجز المواعيد واستقبال وتأكيد حضور المراجعين' }}
                </p>
              </div>
            </div>
          </div>

          <!-- Error Alert at the bottom near submit button -->
          <div *ngIf="addStaffError()" class="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold leading-relaxed">
            ⚠️ {{ addStaffError() }}
          </div>

          <div class="pt-4 border-t flex items-center justify-end gap-3">
            <button type="button" (click)="closeAddStaffModal()" class="px-4 py-2 rounded-xl border text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer">إلغاء</button>
            <button 
              type="submit" 
              [disabled]="isSubmittingStaff()" 
              [ngClass]="selectedStaffRole === 'Admin' ? 'bg-slate-900 hover:bg-black' : 'bg-teal-700 hover:bg-teal-800'"
              class="px-5 py-2 rounded-xl text-white text-xs font-bold transition cursor-pointer disabled:opacity-50 shadow-sm"
            >
              {{ isSubmittingStaff() ? 'جاري إنشاء الحساب...' : (selectedStaffRole === 'Admin' ? 'إنشاء حساب مدير النظام' : 'إنشاء حساب موظف الاستقبال') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Patient History Modal -->
    <div 
      *ngIf="showPatientHistoryModal() && selectedPatientForHistory()" 
      (click)="closePatientHistoryModal()"
      class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overscroll-contain"
    >
      <div 
        (click)="$event.stopPropagation()"
        class="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-4 max-h-[90vh] flex flex-col overscroll-contain animate-fade-in"
      >
        <div class="bg-gradient-to-r from-teal-800 to-emerald-800 text-white p-6 flex items-center justify-between shrink-0">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xl">📋</span>
              <h2 class="text-lg font-bold">الملف الطبي وسجل الزيارات</h2>
            </div>
            <p class="text-xs text-emerald-100 mt-1">
              المريض: {{ selectedPatientForHistory()?.fullName || (selectedPatientForHistory()?.firstName + ' ' + selectedPatientForHistory()?.lastName) }} 
              | الهاتف: {{ selectedPatientForHistory()?.phoneNumber || '—' }} 
              | البريد: {{ selectedPatientForHistory()?.email }}
            </p>
          </div>
          <button (click)="closePatientHistoryModal()" class="text-white/80 hover:text-white cursor-pointer text-lg font-bold">✕</button>
        </div>

        <div class="p-6 space-y-6 overflow-y-auto flex-1">
          <!-- Patient Summary Stats -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div class="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-center">
              <p class="text-xs text-slate-500 font-medium">إجمالي المواعيد</p>
              <p class="text-lg font-bold text-slate-900 mt-0.5">{{ getPatientAppointments(selectedPatientForHistory()!).length }}</p>
            </div>
            <div class="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200 text-center">
              <p class="text-xs text-emerald-700 font-medium">كشوفات مكتملة</p>
              <p class="text-lg font-bold text-emerald-800 mt-0.5">{{ getPatientCompletedCount(selectedPatientForHistory()!) }}</p>
            </div>
            <div class="bg-blue-50 p-3.5 rounded-2xl border border-blue-200 text-center">
              <p class="text-xs text-blue-700 font-medium">المواعيد القادمة</p>
              <p class="text-lg font-bold text-blue-800 mt-0.5">{{ getPatientUpcomingCount(selectedPatientForHistory()!) }}</p>
            </div>
            <div class="bg-amber-50 p-3.5 rounded-2xl border border-amber-200 text-center">
              <p class="text-xs text-amber-700 font-medium">إجمالي الرسوم</p>
              <p class="text-lg font-bold text-amber-800 mt-0.5">{{ getPatientTotalSpent(selectedPatientForHistory()!) }} ج.م</p>
            </div>
          </div>

          <!-- Visits Table -->
          <div>
            <h3 class="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5">
              <span>📅</span>
              <span>سجل الحجوزات والزيارات</span>
            </h3>
            <div class="overflow-x-auto rounded-2xl border border-slate-200">
              <table class="w-full text-right text-xs">
                <thead class="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th class="p-3">رقم الحجز</th>
                    <th class="p-3">الطبيب والتخصص</th>
                    <th class="p-3">التاريخ والوقت</th>
                    <th class="p-3">النوع</th>
                    <th class="p-3">الحالة</th>
                    <th class="p-3">سعر الكشف</th>
                    <th class="p-3 text-center">الروشتة الطبية</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-slate-700">
                  <tr *ngFor="let apt of getPatientAppointments(selectedPatientForHistory()!)" class="hover:bg-slate-50/60">
                    <td class="p-3 font-mono font-bold text-emerald-700">#{{ apt.id }}</td>
                    <td class="p-3">
                      <p class="font-bold text-slate-900">{{ apt.doctorName }}</p>
                      <p class="text-[10px] text-slate-400">{{ apt.doctorSpecialization }}</p>
                    </td>
                    <td class="p-3 font-mono text-slate-600">
                      {{ apt.appointmentDate }} | {{ formatTime(apt.appointmentTime) }}
                    </td>
                    <td class="p-3">
                      <span *ngIf="apt.isOnline" class="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">💻 أونلاين</span>
                      <span *ngIf="!apt.isOnline" class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">🏥 عيادة</span>
                    </td>
                    <td class="p-3">
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold" [ngClass]="getStatusBadge(apt.status)">
                        {{ getStatusText(apt.status) }}
                      </span>
                    </td>
                    <td class="p-3 font-bold text-slate-900 font-mono">{{ getAppointmentFee(apt) }} ج.م</td>
                    <td class="p-3 text-center">
                      <button 
                        (click)="downloadAppointmentPrescription(apt)"
                        [disabled]="downloadingPrescriptionId() === apt.id"
                        class="px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-[10px] transition cursor-pointer inline-flex items-center gap-1 disabled:opacity-50"
                        title="تحميل وطباعة الروشتة الطبية"
                      >
                        <span *ngIf="downloadingPrescriptionId() !== apt.id">📄</span>
                        <span *ngIf="downloadingPrescriptionId() === apt.id" class="w-2.5 h-2.5 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin"></span>
                        <span>تحميل الروشتة</span>
                      </button>
                    </td>
                  </tr>
                  <tr *ngIf="getPatientAppointments(selectedPatientForHistory()!).length === 0">
                    <td colspan="7" class="p-6 text-center text-slate-400 font-medium">لا توجد سجلات مواعيد مسجلة لهذا المريض.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="pt-2 flex justify-end">
            <button type="button" (click)="closePatientHistoryModal()" class="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition cursor-pointer">
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Reset Password Modal -->
    <div 
      *ngIf="showResetPasswordModal() && selectedStaffForReset" 
      (click)="closeResetPasswordModal()"
      class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overscroll-contain"
    >
      <div 
        (click)="$event.stopPropagation()"
        class="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-4 max-h-[90vh] flex flex-col overscroll-contain animate-fade-in"
      >
        <div class="bg-amber-600 text-white p-6 flex items-center justify-between shrink-0">
          <div>
            <h2 class="text-lg font-bold">🔑 إعادة تعيين كلمة المرور</h2>
            <p class="text-xs text-amber-100 mt-0.5">
              للحساب: {{ selectedStaffForReset?.firstName }} {{ selectedStaffForReset?.lastName }} ({{ selectedStaffForReset?.email }})
            </p>
          </div>
          <button (click)="closeResetPasswordModal()" class="text-white/80 hover:text-white cursor-pointer text-lg font-bold">✕</button>
        </div>

        <form (ngSubmit)="submitResetPassword()" class="p-6 space-y-4 overflow-y-auto flex-1">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">كلمة المرور الجديدة *</label>
            <input 
              type="password" 
              [(ngModel)]="newResetPassword" 
              name="newResetPassword" 
              required 
              placeholder="••••••••" 
              class="w-full border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono" 
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">تأكيد كلمة المرور الجديدة *</label>
            <input 
              type="password" 
              [(ngModel)]="confirmResetPassword" 
              name="confirmResetPassword" 
              required 
              placeholder="••••••••" 
              class="w-full border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono" 
            />
          </div>

          <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
            <p class="font-semibold text-slate-800">اشتراطات الأمان:</p>
            <ul class="list-disc list-inside text-slate-500 space-y-0.5">
              <li>8 خانات على الأقل</li>
              <li>حرف كبير (A-Z) وحرف صغير (a-z)</li>
              <li>رقم (0-9) ورمز خاص (مثل: @، #، $، !)</li>
            </ul>
          </div>

          <!-- Success message -->
          <div *ngIf="resetPasswordSuccess()" class="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold leading-relaxed">
            ✅ {{ resetPasswordSuccess() }}
          </div>

          <!-- Error message at bottom -->
          <div *ngIf="resetPasswordError()" class="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold leading-relaxed">
            ⚠️ {{ resetPasswordError() }}
          </div>

          <div class="pt-3 border-t flex items-center justify-end gap-3">
            <button type="button" (click)="closeResetPasswordModal()" class="px-4 py-2 rounded-xl border text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer">
              إلغاء
            </button>
            <button 
              type="submit" 
              [disabled]="isSubmittingResetPassword()" 
              class="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition cursor-pointer disabled:opacity-50"
            >
              {{ isSubmittingResetPassword() ? 'جاري الحفظ...' : 'حفظ كلمة المرور الجديدة' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Walk-in Direct Booking Modal (Reception & Admin) -->
    <div 
      *ngIf="showWalkinBookingModal()" 
      class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overscroll-contain animate-fadeIn"
    >
      <div class="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 space-y-5 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between border-b pb-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center text-lg font-bold border border-teal-100">
              📋
            </div>
            <div>
              <h3 class="text-base font-bold text-slate-900">تسجيل وحجز كشف حضوري بالعيادة (Walk-in)</h3>
              <p class="text-[11px] text-slate-500">حجز فوري لمراجع الاستقبال وتوثيق الكشف وسداد الرسوم</p>
            </div>
          </div>
          <button (click)="closeWalkinBookingModal()" class="text-slate-400 hover:text-slate-600 text-lg cursor-pointer">✕</button>
        </div>

        <form (ngSubmit)="submitWalkinBooking()" class="space-y-4">
          <!-- Error Alert -->
          <div *ngIf="walkinBookingError()" class="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
            <span>⚠️</span>
            <span>{{ walkinBookingError() }}</span>
          </div>

          <!-- Section: Patient Selection -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label class="block text-xs font-bold text-slate-700">المريض *</label>
              <button 
                type="button" 
                (click)="toggleWalkinNewPatient()"
                class="text-[11px] font-bold text-teal-700 hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>{{ walkinBooking.isNewPatient ? '↩️ اختيار مريض مسجل مسبقاً' : '🏥 مراجع مباشر للعيادة (بدون تسجيل حساب)' }}</span>
              </button>
            </div>

            <!-- Existing Patient Select -->
            <div *ngIf="!walkinBooking.isNewPatient">
              <select 
                [(ngModel)]="walkinBooking.patientId" 
                name="walkinPatientId" 
                class="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-teal-500 bg-white"
                required
              >
                <option [ngValue]="null" disabled>— اختر المريض من القائمة —</option>
                <option *ngFor="let p of patients()" [ngValue]="p.id">
                  {{ p.fullName || (p.firstName + ' ' + p.lastName) }} ({{ p.phoneNumber || p.email }})
                </option>
              </select>
            </div>

            <!-- New Patient Quick Registration Inputs -->
            <div *ngIf="walkinBooking.isNewPatient" class="p-3.5 bg-teal-50/50 rounded-2xl border border-teal-100 space-y-3">
              <p class="text-[11px] font-bold text-teal-800">بيانات مراجع العيادة (يتم الحجز مباشرة على حساب زوار العيادة دون الحاجة لإنشاء إيميل):</p>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block text-[10px] text-slate-600 mb-1">الاسم الأول *</label>
                  <input type="text" [(ngModel)]="walkinBooking.newPatientFirstName" name="newPatFirst" class="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white" placeholder="مثال: محمد" required />
                </div>
                <div>
                  <label class="block text-[10px] text-slate-600 mb-1">اسم العائلة *</label>
                  <input type="text" [(ngModel)]="walkinBooking.newPatientLastName" name="newPatLast" class="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white" placeholder="مثال: أحمد" required />
                </div>
              </div>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block text-[10px] text-slate-600 mb-1">رقم الهاتف *</label>
                  <input type="tel" [(ngModel)]="walkinBooking.newPatientPhone" name="newPatPhone" class="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white" placeholder="010xxxxxxxx" required />
                </div>
                <div>
                  <label class="block text-[10px] text-slate-600 mb-1">النوع (الجنس) *</label>
                  <select [(ngModel)]="walkinBooking.newPatientGender" name="newPatGender" class="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white">
                    <option [ngValue]="1">👨 ذكر</option>
                    <option [ngValue]="2">👩 أنثى</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <!-- Section: Doctor Selection -->
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">الطبيب والعيادة المختصة *</label>
            <select 
              [ngModel]="walkinBooking.doctorId" 
              (ngModelChange)="onWalkinDoctorChange($event)"
              name="walkinDoctorId" 
              class="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-teal-500 bg-white"
              required
            >
              <option [ngValue]="null" disabled>— اختر الطبيب المختص —</option>
              <option *ngFor="let doc of doctors()" [ngValue]="doc.id">
                د. {{ doc.fullName }} — {{ doc.specialization }} ({{ doc.consultationFee || 250 }} ج.م) {{ !doc.isAvailable ? '⚠️ غير متاح حالياً' : '' }}
              </option>
            </select>
          </div>

          <!-- Section: Date & Time -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">تاريخ الكشف *</label>
              <input 
                type="date" 
                [ngModel]="walkinBooking.appointmentDate"
                (ngModelChange)="onWalkinDateChange($event)"
                name="walkinDate" 
                class="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-teal-500 bg-white"
                required 
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">فترة / وقت الكشف *</label>
              <div *ngIf="walkinDoctorSlots().length > 0; else manualTimeInput">
                <select 
                  [(ngModel)]="walkinBooking.appointmentTime" 
                  name="walkinTimeSelect"
                  class="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-teal-500 bg-white font-mono"
                  required
                >
                  <option *ngFor="let s of walkinDoctorSlots()" [value]="s">{{ s }}</option>
                </select>
              </div>
              <ng-template #manualTimeInput>
                <input 
                  type="time" 
                  [(ngModel)]="walkinBooking.appointmentTime" 
                  name="walkinTime" 
                  class="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-teal-500 bg-white"
                  required 
                />
              </ng-template>
            </div>
          </div>

          <!-- Section: Fee & Payment Status -->
          <div class="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <div>
              <label class="block text-[11px] font-bold text-slate-700 mb-1">رسوم الكشف (ج.م) *</label>
              <input 
                type="number" 
                [(ngModel)]="walkinBooking.consultationFee" 
                name="walkinFee" 
                class="w-full border border-slate-300 rounded-xl px-3 py-1.5 text-xs focus:ring-2 focus:ring-teal-500 bg-white font-bold text-slate-800"
                min="0"
                required 
              />
            </div>
            <div>
              <label class="block text-[11px] font-bold text-slate-700 mb-1">نوع الكشف</label>
              <select [(ngModel)]="walkinBooking.type" name="walkinType" class="w-full border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs bg-white">
                <option [ngValue]="1">🏥 كشف عام بعيادة المركز</option>
                <option [ngValue]="2">🔍 استشارة تخصصية</option>
                <option [ngValue]="3">🔄 إعادة كشف / متابعة</option>
              </select>
            </div>
          </div>

          <!-- Payment Method & Collection Section -->
          <div class="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
            <label class="block text-xs font-bold text-slate-800">طريقة وحالة السداد (Payment Method) *</label>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <label 
                [class.border-emerald-600]="walkinBooking.paymentMethod === 'cash'"
                [class.bg-emerald-50]="walkinBooking.paymentMethod === 'cash'"
                [class.text-emerald-900]="walkinBooking.paymentMethod === 'cash'"
                [class.ring-2]="walkinBooking.paymentMethod === 'cash'"
                [class.ring-emerald-500]="walkinBooking.paymentMethod === 'cash'"
                [class.border-slate-200]="walkinBooking.paymentMethod !== 'cash'"
                class="flex flex-col items-center justify-center p-2.5 rounded-xl border bg-white cursor-pointer transition text-center hover:bg-slate-50"
              >
                <input type="radio" [(ngModel)]="walkinBooking.paymentMethod" name="payMethod" value="cash" class="sr-only" />
                <span class="text-base mb-1">💵</span>
                <span class="text-xs font-bold">نقداً (Cash)</span>
                <span class="text-[10px] text-emerald-700 font-semibold mt-0.5">مسدد بالاستقبال</span>
              </label>

              <label 
                [class.border-emerald-600]="walkinBooking.paymentMethod === 'card'"
                [class.bg-emerald-50]="walkinBooking.paymentMethod === 'card'"
                [class.text-emerald-900]="walkinBooking.paymentMethod === 'card'"
                [class.ring-2]="walkinBooking.paymentMethod === 'card'"
                [class.ring-emerald-500]="walkinBooking.paymentMethod === 'card'"
                [class.border-slate-200]="walkinBooking.paymentMethod !== 'card'"
                class="flex flex-col items-center justify-center p-2.5 rounded-xl border bg-white cursor-pointer transition text-center hover:bg-slate-50"
              >
                <input type="radio" [(ngModel)]="walkinBooking.paymentMethod" name="payMethod" value="card" class="sr-only" />
                <span class="text-base mb-1">💳</span>
                <span class="text-xs font-bold">فيزا / بطاقة بنكية</span>
                <span class="text-[10px] text-emerald-700 font-semibold mt-0.5">ماستركارد / POS</span>
              </label>

              <label 
                [class.border-emerald-600]="walkinBooking.paymentMethod === 'wallet'"
                [class.bg-emerald-50]="walkinBooking.paymentMethod === 'wallet'"
                [class.text-emerald-900]="walkinBooking.paymentMethod === 'wallet'"
                [class.ring-2]="walkinBooking.paymentMethod === 'wallet'"
                [class.ring-emerald-500]="walkinBooking.paymentMethod === 'wallet'"
                [class.border-slate-200]="walkinBooking.paymentMethod !== 'wallet'"
                class="flex flex-col items-center justify-center p-2.5 rounded-xl border bg-white cursor-pointer transition text-center hover:bg-slate-50"
              >
                <input type="radio" [(ngModel)]="walkinBooking.paymentMethod" name="payMethod" value="wallet" class="sr-only" />
                <span class="text-base mb-1">📱</span>
                <span class="text-xs font-bold">محفظة إلكترونية</span>
                <span class="text-[10px] text-emerald-700 font-semibold mt-0.5">فودافون كاش / إنستاباي</span>
              </label>

              <label 
                [class.border-amber-600]="walkinBooking.paymentMethod === 'unpaid'"
                [class.bg-amber-50]="walkinBooking.paymentMethod === 'unpaid'"
                [class.text-amber-900]="walkinBooking.paymentMethod === 'unpaid'"
                [class.ring-2]="walkinBooking.paymentMethod === 'unpaid'"
                [class.ring-amber-500]="walkinBooking.paymentMethod === 'unpaid'"
                [class.border-slate-200]="walkinBooking.paymentMethod !== 'unpaid'"
                class="flex flex-col items-center justify-center p-2.5 rounded-xl border bg-white cursor-pointer transition text-center hover:bg-slate-50"
              >
                <input type="radio" [(ngModel)]="walkinBooking.paymentMethod" name="payMethod" value="unpaid" class="sr-only" />
                <span class="text-base mb-1">⏳</span>
                <span class="text-xs font-bold">غير مدفوع</span>
                <span class="text-[10px] text-amber-700 font-semibold mt-0.5">سداد لاحق</span>
              </label>
            </div>
          </div>

          <!-- Reason / Notes -->
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">ملاحظات أو سبب الزيارة (اختياري)</label>
            <input 
              type="text" 
              [(ngModel)]="walkinBooking.reason" 
              name="walkinReason" 
              placeholder="مثال: فحص دوري، كشف عظام طارئ..." 
              class="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-teal-500 bg-white"
            />
          </div>

          <!-- Buttons -->
          <div class="pt-3 border-t flex items-center justify-end gap-3">
            <button 
              type="button" 
              (click)="closeWalkinBookingModal()" 
              class="px-4 py-2 rounded-xl border text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
            >
              إلغاء
            </button>
            <button 
              type="submit" 
              [disabled]="isSubmittingWalkinBooking()" 
              class="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
            >
              <span>{{ isSubmittingWalkinBooking() ? 'جاري الحجز...' : 'تأكيد الحجز المباشر' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Unified Confirmation Modal -->
    @if (confirmModalState(); as modal) {
      <div 
        class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overscroll-contain animate-fadeIn"
      >
        <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 text-center">
          <div 
            class="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center text-2xl shadow-inner"
            [ngClass]="modal.isDanger ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'"
          >
            {{ modal.isDanger ? '⚠️' : 'ℹ️' }}
          </div>
          <div class="space-y-1">
            <h3 class="text-lg font-bold text-slate-900">{{ modal.title }}</h3>
            <p class="text-xs text-slate-500 leading-relaxed">{{ modal.message }}</p>
          </div>
          <div class="flex items-center gap-3 pt-2">
            <button 
              type="button" 
              (click)="onConfirmModalAction()" 
              [ngClass]="modal.isDanger ? 'bg-rose-600 hover:bg-rose-700 text-white' : 'bg-emerald-700 hover:bg-emerald-800 text-white'"
              class="flex-1 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer shadow-md"
            >
              {{ modal.confirmText }}
            </button>
            <button 
              type="button" 
              (click)="closeConfirmModal()" 
              class="flex-1 py-2.5 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  private readonly doctorService = inject(DoctorService);
  private readonly patientService = inject(PatientService);
  private readonly appointmentService = inject(AppointmentService);
  private readonly userService = inject(UserService);
  private readonly medicalRecordService = inject(MedicalRecordService);
  readonly authService = inject(AuthService);

  readonly downloadingPrescriptionId = signal<number | null>(null);

  readonly activeTab = signal<AdminTab>('doctors');
  readonly doctors = signal<Doctor[]>([]);
  readonly deletedDoctors = signal<Doctor[]>([]);
  readonly doctorSubTab = signal<'active' | 'deleted'>('active');
  readonly staffUsers = signal<UserItem[]>([]);
  readonly staffRoleFilter = signal<'all' | 'Receptionist' | 'Admin'>('all');
  readonly patients = signal<Patient[]>([]);
  readonly allAppointments = signal<Appointment[]>([]);

  readonly confirmModalState = signal<{
    title: string;
    message: string;
    confirmText: string;
    isDanger: boolean;
    action: () => void;
  } | null>(null);

  readonly receptionistsCount = computed(() => this.staffUsers().filter(s => s.roles && s.roles.includes('Receptionist')).length);
  readonly adminsCount = computed(() => this.staffUsers().filter(s => s.roles && s.roles.includes('Admin')).length);

  readonly totalRevenue = computed(() => {
    return this.allAppointments()
      .filter(a => [2, 3, 4, 'Confirmed', 'InProgress', 'Completed'].includes(a.status as any))
      .reduce((sum, a) => sum + this.getAppointmentFee(a), 0);
  });

  getLocalDateString(d: Date = new Date()): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  normalizeDateString(dateVal: any): string {
    if (!dateVal) return '';
    const str = String(dateVal).trim();
    if (str.includes('T')) {
      return str.split('T')[0];
    }
    if (str.includes('/')) {
      const parts = str.split('/');
      if (parts.length === 3) {
        if (parts[2].length === 4) {
          const y = parts[2];
          const m = parts[0].padStart(2, '0');
          const d = parts[1].padStart(2, '0');
          return `${y}-${m}-${d}`;
        }
      }
    }
    return str.substring(0, 10);
  }

  isAppointmentToday(dateStr: string): boolean {
    if (!dateStr) return false;
    const normalized = this.normalizeDateString(dateStr);
    const localToday = this.getLocalDateString();
    const utcToday = new Date().toISOString().split('T')[0];

    if (normalized === localToday || normalized === utcToday) {
      return true;
    }

    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const now = new Date();
      if (d.getFullYear() === now.getFullYear() &&
          d.getMonth() === now.getMonth() &&
          d.getDate() === now.getDate()) {
        return true;
      }
    }
    return false;
  }

  readonly todayRevenue = computed(() => {
    return this.allAppointments()
      .filter(a => this.isAppointmentToday(a.appointmentDate) && [2, 3, 4, 'Confirmed', 'InProgress', 'Completed'].includes(a.status as any))
      .reduce((sum, a) => sum + this.getAppointmentFee(a), 0);
  });

  readonly onlineAppointmentsCount = computed(() => {
    return this.allAppointments().filter(a => a.isOnline).length;
  });

  readonly inClinicAppointmentsCount = computed(() => {
    return this.allAppointments().filter(a => !a.isOnline).length;
  });

  readonly todayAppointmentsCount = computed(() => {
    return this.allAppointments().filter(a => this.isAppointmentToday(a.appointmentDate)).length;
  });

  readonly financeSearch = signal<string>('');
  readonly financeStatusFilter = signal<string>('all');

  readonly paidAppointmentsCount = computed(() => {
    return this.allAppointments().filter(a => this.getPaymentValue(a.paymentStatus) === 2).length;
  });

  readonly totalPaidRevenue = computed(() => {
    return this.allAppointments()
      .filter(a => this.getPaymentValue(a.paymentStatus) === 2)
      .reduce((sum, a) => sum + this.getAppointmentFee(a), 0);
  });

  readonly totalUnpaidAmount = computed(() => {
    return this.allAppointments()
      .filter(a => this.getPaymentValue(a.paymentStatus) === 1 || !a.paymentStatus)
      .reduce((sum, a) => sum + this.getAppointmentFee(a), 0);
  });

  readonly totalRefundedAmount = computed(() => {
    return this.allAppointments()
      .filter(a => this.getPaymentValue(a.paymentStatus) === 3)
      .reduce((sum, a) => sum + this.getAppointmentFee(a), 0);
  });

  readonly filteredFinanceTransactions = computed(() => {
    let list = this.allAppointments();
    const status = this.financeStatusFilter();
    const term = this.financeSearch().trim().toLowerCase();

    if (status !== 'all') {
      const sNum = Number(status);
      list = list.filter(a => this.getPaymentValue(a.paymentStatus) === sNum);
    }

    if (term) {
      list = list.filter(a =>
        String(a.id).includes(term) ||
        `tx-${a.id}`.toLowerCase().includes(term) ||
        (a.patientName || '').toLowerCase().includes(term) ||
        (a.doctorName || '').toLowerCase().includes(term) ||
        (a.doctorSpecialization || '').toLowerCase().includes(term)
      );
    }

    return list;
  });

  readonly showPatientHistoryModal = signal<boolean>(false);
  readonly selectedPatientForHistory = signal<Patient | null>(null);

  readonly showResetPasswordModal = signal<boolean>(false);
  readonly isSubmittingResetPassword = signal<boolean>(false);
  readonly resetPasswordError = signal<string | null>(null);
  readonly resetPasswordSuccess = signal<string | null>(null);
  selectedStaffForReset: UserItem | null = null;
  newResetPassword = '';
  confirmResetPassword = '';

  readonly doctorSearch = signal<string>('');
  readonly doctorShiftFilter = signal<'all' | 'available' | 'morning' | 'evening'>('all');
  readonly adminSearch = signal<string>('');
  readonly receptionSearch = signal<string>('');
  readonly patientSearch = signal<string>('');
  readonly appointmentSearch = signal<string>('');
  readonly appointmentStatusFilter = signal<string>('all');
  readonly appointmentDateFilter = signal<string>('all');

  readonly showAddDoctorModal = signal<boolean>(false);
  readonly isSubmittingDoctor = signal<boolean>(false);
  readonly addDoctorError = signal<string | null>(null);

  readonly showEditDoctorModal = signal<boolean>(false);
  readonly isSubmittingEditDoctor = signal<boolean>(false);
  readonly editDoctorError = signal<string | null>(null);
  editingDoctor: any = null;

  readonly showAddStaffModal = signal<boolean>(false);
  readonly isSubmittingStaff = signal<boolean>(false);
  readonly addStaffError = signal<string | null>(null);
  selectedStaffRole = 'Receptionist';
  newStaffGender = 1;
  newStaff: CreateStaffRequest = {
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    roles: ['Receptionist']
  };

  readonly showWalkinBookingModal = signal<boolean>(false);
  readonly isSubmittingWalkinBooking = signal<boolean>(false);
  readonly walkinBookingError = signal<string | null>(null);
  readonly walkinDoctorSlots = signal<string[]>([]);
  walkinBooking = {
    patientId: null as number | null,
    isNewPatient: false,
    newPatientFirstName: '',
    newPatientLastName: '',
    newPatientPhone: '',
    newPatientGender: 1,
    doctorId: null as number | null,
    appointmentDate: new Date().toISOString().substring(0, 10),
    appointmentTime: '10:00',
    type: 1,
    consultationFee: 250,
    paymentMethod: 'cash' as 'cash' | 'card' | 'wallet' | 'unpaid',
    reason: '',
    isPaid: true
  };

  newDoctor = {
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    dateOfBirth: '1985-01-01',
    gender: 1,
    consultationFee: 250,
    workStartTime: '09:00',
    workEndTime: '14:00',
    hasEveningShift: false,
    eveningStartTime: '17:00',
    eveningEndTime: '22:00',
    slotDurationMinutes: 20,
    qualifications: '',
    specialization: '',
    licenseNumber: '',
    yearsOfExperience: 5
  };

  readonly filteredDoctors = computed(() => {
    let list = this.doctors();
    const shift = this.doctorShiftFilter();
    if (shift === 'available') {
      list = list.filter(d => d.isAvailable);
    } else if (shift === 'morning') {
      list = list.filter(d => !!d.workStartTime);
    } else if (shift === 'evening') {
      list = list.filter(d => !!d.eveningStartTime && d.eveningStartTime !== '');
    }

    const term = this.doctorSearch().trim().toLowerCase();
    if (!term) return list;
    return list.filter(d => 
      (d.fullName || '').toLowerCase().includes(term) || 
      (d.specialization || '').toLowerCase().includes(term) ||
      (d.email || '').toLowerCase().includes(term) ||
      (d.licenseNumber || '').toLowerCase().includes(term) ||
      (d.phoneNumber || '').includes(term)
    );
  });

  readonly filteredDeletedDoctors = computed(() => {
    const term = this.doctorSearch().trim().toLowerCase();
    if (!term) return this.deletedDoctors();
    return this.deletedDoctors().filter(d => 
      (d.fullName || '').toLowerCase().includes(term) || 
      (d.specialization || '').toLowerCase().includes(term) ||
      (d.email || '').toLowerCase().includes(term) ||
      (d.licenseNumber || '').toLowerCase().includes(term)
    );
  });

  readonly adminSubTab = signal<'active' | 'archived'>('active');
  readonly receptionSubTab = signal<'active' | 'archived'>('active');

  readonly activeAdmins = computed(() => this.staffUsers().filter(s => s.roles && s.roles.includes('Admin') && !s.isDeleted));
  readonly archivedAdmins = computed(() => this.staffUsers().filter(s => s.roles && s.roles.includes('Admin') && s.isDeleted));

  readonly activeReceptionists = computed(() => this.staffUsers().filter(s => s.roles && s.roles.includes('Receptionist') && !s.isDeleted));
  readonly archivedReceptionists = computed(() => this.staffUsers().filter(s => s.roles && s.roles.includes('Receptionist') && s.isDeleted));

  readonly filteredActiveAdmins = computed(() => {
    const term = this.adminSearch().trim().toLowerCase();
    const list = this.activeAdmins();
    if (!term) return list;
    return list.filter(s => 
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(term) ||
      (s.email || '').toLowerCase().includes(term)
    );
  });

  readonly filteredArchivedAdmins = computed(() => {
    const term = this.adminSearch().trim().toLowerCase();
    const list = this.archivedAdmins();
    if (!term) return list;
    return list.filter(s => 
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(term) ||
      (s.email || '').toLowerCase().includes(term)
    );
  });

  readonly filteredActiveReceptionists = computed(() => {
    const term = this.receptionSearch().trim().toLowerCase();
    const list = this.activeReceptionists();
    if (!term) return list;
    return list.filter(s => 
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(term) ||
      (s.email || '').toLowerCase().includes(term)
    );
  });

  readonly filteredArchivedReceptionists = computed(() => {
    const term = this.receptionSearch().trim().toLowerCase();
    const list = this.archivedReceptionists();
    if (!term) return list;
    return list.filter(s => 
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(term) ||
      (s.email || '').toLowerCase().includes(term)
    );
  });

  readonly filteredPatients = computed(() => {
    const term = this.patientSearch().trim().toLowerCase();
    if (!term) return this.patients();
    return this.patients().filter(p => 
      (p.fullName || `${p.firstName} ${p.lastName}`).toLowerCase().includes(term) || 
      (p.email || '').toLowerCase().includes(term) ||
      (p.phoneNumber || '').includes(term)
    );
  });

  readonly filteredAppointments = computed(() => {
    let list = this.allAppointments();
    const term = this.appointmentSearch().trim().toLowerCase();
    const status = this.appointmentStatusFilter();
    const date = this.appointmentDateFilter();
    const todayStr = new Date().toISOString().split('T')[0];

    if (status !== 'all') {
      list = list.filter(a => String(this.getStatusValue(a.status)) === status || String(a.status).toLowerCase() === status.toLowerCase());
    }

    if (date === 'today') {
      list = list.filter(a => this.isAppointmentToday(a.appointmentDate));
    } else if (date === 'upcoming') {
      const localToday = this.getLocalDateString();
      list = list.filter(a => !this.isAppointmentToday(a.appointmentDate) && this.normalizeDateString(a.appointmentDate) >= localToday && this.getStatusValue(a.status) !== 4 && this.getStatusValue(a.status) !== 5);
    } else if (date === 'past') {
      const localToday = this.getLocalDateString();
      list = list.filter(a => (!this.isAppointmentToday(a.appointmentDate) && this.normalizeDateString(a.appointmentDate) < localToday) || this.getStatusValue(a.status) === 4 || this.getStatusValue(a.status) === 5 || this.getStatusValue(a.status) === 6);
    }

    if (term) {
      list = list.filter(a => 
        String(a.id).includes(term) ||
        (a.patientName || '').toLowerCase().includes(term) ||
        (a.doctorName || '').toLowerCase().includes(term) ||
        (a.reason || '').toLowerCase().includes(term)
      );
    }

    return list;
  });

  openConfirmModal(title: string, message: string, confirmText: string, isDanger: boolean, action: () => void): void {
    this.confirmModalState.set({ title, message, confirmText, isDanger, action });
  }

  closeConfirmModal(): void {
    this.confirmModalState.set(null);
  }

  onConfirmModalAction(): void {
    const modal = this.confirmModalState();
    if (modal) {
      const act = modal.action;
      this.closeConfirmModal();
      act();
    }
  }

  ngOnInit(): void {
    if (this.authService.isReceptionist() && !this.authService.isAdmin()) {
      this.activeTab.set('appointments');
    }
    this.loadAll();
  }

  loadAll(): void {
    this.doctorService.getAllDoctors().subscribe({
      next: (data) => this.doctors.set(data || [])
    });

    if (this.authService.isAdmin()) {
      this.doctorService.getDeletedDoctors().subscribe({
        next: (data) => this.deletedDoctors.set(data || [])
      });

      this.userService.getUsers().subscribe({
        next: (users) => {
          const staff = (users || []).filter(u => u.roles && (u.roles.includes('Receptionist') || u.roles.includes('Admin')));
          this.staffUsers.set(staff.length > 0 ? staff : (users || []));
        }
      });
    }

    this.patientService.getAllPatients().subscribe({
      next: (data) => this.patients.set(data || [])
    });

    this.appointmentService.getAllAppointments().subscribe({
      next: (data) => {
        const items = data?.items || data || [];
        this.allAppointments.set(items);
      }
    });
  }

  openAddDoctorModal(): void {
    this.addDoctorError.set(null);
    this.newDoctor = {
      firstName: '',
      middleName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      password: '',
      dateOfBirth: '1985-01-01',
      gender: 1,
      consultationFee: 250,
      workStartTime: '09:00',
      workEndTime: '14:00',
      hasEveningShift: false,
      eveningStartTime: '17:00',
      eveningEndTime: '22:00',
      slotDurationMinutes: 20,
      qualifications: '',
      specialization: '',
      licenseNumber: '',
      yearsOfExperience: 5
    };
    document.body.style.overflow = 'hidden';
    this.showAddDoctorModal.set(true);
  }

  closeAddDoctorModal(): void {
    document.body.style.overflow = '';
    this.showAddDoctorModal.set(false);
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }

  submitNewDoctor(): void {
    if (!this.newDoctor.firstName || !this.newDoctor.lastName || !this.newDoctor.email || !this.newDoctor.specialization || !this.newDoctor.licenseNumber) {
      this.addDoctorError.set('يرجى تعبئة كافة الحقول الإلزامية ورقم الترخيص.');
      return;
    }

    if (this.newDoctor.password && this.newDoctor.password.trim().length < 8) {
      this.addDoctorError.set('كلمة المرور يجب ألا تقل عن 8 خانات.');
      return;
    }

    this.isSubmittingDoctor.set(true);
    this.addDoctorError.set(null);

    const payload: any = {
      firstName: this.newDoctor.firstName,
      middleName: this.newDoctor.middleName || null,
      lastName: this.newDoctor.lastName,
      email: this.newDoctor.email,
      phoneNumber: this.newDoctor.phoneNumber,
      dateOfBirth: this.newDoctor.dateOfBirth,
      gender: this.newDoctor.gender,
      consultationFee: this.newDoctor.consultationFee,
      qualifications: this.newDoctor.qualifications,
      specialization: this.newDoctor.specialization,
      licenseNumber: this.newDoctor.licenseNumber,
      yearsOfExperience: this.newDoctor.yearsOfExperience,
      workStartTime: this.newDoctor.workStartTime ? `${this.newDoctor.workStartTime}:00` : undefined,
      workEndTime: this.newDoctor.workEndTime ? `${this.newDoctor.workEndTime}:00` : undefined,
      slotDurationMinutes: Number(this.newDoctor.slotDurationMinutes) || 20,
      password: this.newDoctor.password ? this.newDoctor.password.trim() : null
    };

    if (this.newDoctor.hasEveningShift && this.newDoctor.eveningStartTime && this.newDoctor.eveningEndTime) {
      payload.eveningStartTime = `${this.newDoctor.eveningStartTime}:00`;
      payload.eveningEndTime = `${this.newDoctor.eveningEndTime}:00`;
    } else {
      payload.eveningStartTime = null;
      payload.eveningEndTime = null;
    }

    this.doctorService.addDoctor(payload).subscribe({
      next: () => {
        this.isSubmittingDoctor.set(false);
        this.closeAddDoctorModal();
        this.loadAll();
      },
      error: (err) => {
        this.isSubmittingDoctor.set(false);
        this.addDoctorError.set(this.extractApiErrorMessage(err, 'تعذر إضافة الطبيب، يرجى مراجعة صحة الحقول المدخلة.'));
      }
    });
  }

  toggleDoctorAvailability(id: number): void {
    this.doctorService.toggleAvailability(id).subscribe({
      next: () => this.loadAll(),
      error: (err) => alert(this.extractApiErrorMessage(err, 'تعذر تغيير حالة الطبيب'))
    });
  }

  deleteDoctor(doc: Doctor): void {
    this.openConfirmModal(
      'تأكيد نقل الطبيب إلى الأرشيف',
      `هل أنت متأكد من رغبتك في نقل الطبيب د/ ${doc.fullName || doc.firstName} إلى أرشيف المحذوفين؟ يمكنك استعادته في أي وقت.`,
      'حذف ونقل للأرشيف',
      true,
      () => {
        this.doctorService.deleteDoctor(doc.id).subscribe({
          next: () => this.loadAll(),
          error: (err) => alert(this.extractApiErrorMessage(err, 'تعذر حذف الطبيب'))
        });
      }
    );
  }

  restoreDoctor(doc: Doctor): void {
    this.openConfirmModal(
      'تأكيد استعادة الطبيب',
      `هل ترغب في استعادة الطبيب د/ ${doc.fullName || doc.firstName} وتفعيله مجدداً ضمن قائمة الأطباء المعتمدين؟`,
      'استعادة الطبيب',
      false,
      () => {
        this.doctorService.restoreDoctor(doc.id).subscribe({
          next: () => {
            this.loadAll();
            this.doctorSubTab.set('active');
          },
          error: (err) => alert(this.extractApiErrorMessage(err, 'تعذر استعادة الطبيب'))
        });
      }
    );
  }

  openEditDoctorModal(doc: Doctor): void {
    this.editDoctorError.set(null);
    const hasEve = !!(doc.eveningStartTime && doc.eveningEndTime);
    this.editingDoctor = {
      id: doc.id,
      firstName: doc.firstName,
      lastName: doc.lastName,
      phoneNumber: doc.phoneNumber || '',
      specialization: doc.specialization,
      yearsOfExperience: doc.yearsOfExperience,
      qualifications: doc.qualifications || '',
      consultationFee: doc.consultationFee || 250,
      workStartTime: doc.workStartTime ? doc.workStartTime.substring(0, 5) : '09:00',
      workEndTime: doc.workEndTime ? doc.workEndTime.substring(0, 5) : '14:00',
      hasEveningShift: hasEve,
      eveningStartTime: doc.eveningStartTime ? doc.eveningStartTime.substring(0, 5) : '17:00',
      eveningEndTime: doc.eveningEndTime ? doc.eveningEndTime.substring(0, 5) : '22:00',
      slotDurationMinutes: doc.slotDurationMinutes || 20
    };
    document.body.style.overflow = 'hidden';
    this.showEditDoctorModal.set(true);
  }

  closeEditDoctorModal(): void {
    document.body.style.overflow = '';
    this.showEditDoctorModal.set(false);
    this.editingDoctor = null;
  }

  submitEditDoctor(): void {
    if (!this.editingDoctor.firstName || !this.editingDoctor.lastName || !this.editingDoctor.specialization) {
      this.editDoctorError.set('يرجى تعبئة كافة الحقول الإلزامية');
      return;
    }

    this.isSubmittingEditDoctor.set(true);
    this.editDoctorError.set(null);

    const updatePayload: any = {
      firstName: this.editingDoctor.firstName,
      lastName: this.editingDoctor.lastName,
      phoneNumber: this.editingDoctor.phoneNumber,
      specialization: this.editingDoctor.specialization,
      yearsOfExperience: this.editingDoctor.yearsOfExperience,
      qualifications: this.editingDoctor.qualifications,
      consultationFee: this.editingDoctor.consultationFee,
      workStartTime: this.editingDoctor.workStartTime ? `${this.editingDoctor.workStartTime}:00` : undefined,
      workEndTime: this.editingDoctor.workEndTime ? `${this.editingDoctor.workEndTime}:00` : undefined,
      slotDurationMinutes: Number(this.editingDoctor.slotDurationMinutes) || 20
    };

    if (this.editingDoctor.hasEveningShift && this.editingDoctor.eveningStartTime && this.editingDoctor.eveningEndTime) {
      updatePayload.eveningStartTime = `${this.editingDoctor.eveningStartTime}:00`;
      updatePayload.eveningEndTime = `${this.editingDoctor.eveningEndTime}:00`;
    } else {
      updatePayload.eveningStartTime = null;
      updatePayload.eveningEndTime = null;
    }

    this.doctorService.updateDoctor(this.editingDoctor.id, updatePayload).subscribe({
      next: () => {
        this.isSubmittingEditDoctor.set(false);
        this.closeEditDoctorModal();
        this.loadAll();
      },
      error: (err) => {
        this.isSubmittingEditDoctor.set(false);
        this.editDoctorError.set(this.extractApiErrorMessage(err, 'تعذر تعديل بيانات الطبيب'));
      }
    });
  }

  openResetPasswordModalForDoctor(doc: Doctor): void {
    const targetUserId = doc.userId || this.staffUsers().find(u => u.email.toLowerCase() === doc.email.toLowerCase())?.id || doc.email;
    const userItem: UserItem = {
      id: targetUserId,
      firstName: doc.firstName,
      lastName: doc.lastName,
      email: doc.email,
      isDeleted: false,
      roles: ['Doctor']
    };
    this.openResetPasswordModal(userItem);
  }

  openAddStaffModal(role: 'Receptionist' | 'Admin' = 'Receptionist'): void {
    this.addStaffError.set(null);
    this.newStaff = {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      password: '',
      roles: [role]
    };
    this.selectedStaffRole = role;
    this.newStaffGender = 1;
    document.body.style.overflow = 'hidden';
    this.showAddStaffModal.set(true);
  }

  closeAddStaffModal(): void {
    document.body.style.overflow = '';
    this.showAddStaffModal.set(false);
  }

  submitNewStaff(): void {
    if (!this.newStaff.firstName || !this.newStaff.lastName || !this.newStaff.email || !this.newStaff.password) {
      this.addStaffError.set('يرجى تعبئة كافة الحقول المطلوبة لإنشاء الحساب');
      return;
    }

    if (this.newStaff.firstName.trim().length < 3) {
      this.addStaffError.set('الاسم الأول يجب أن يتكون من 3 أحرف على الأقل');
      return;
    }

    if (this.newStaff.lastName.trim().length < 3) {
      this.addStaffError.set('اسم العائلة يجب أن يتكون من 3 أحرف على الأقل');
      return;
    }

    this.isSubmittingStaff.set(true);
    this.addStaffError.set(null);
    this.newStaff.roles = [this.selectedStaffRole];
    this.newStaff.phoneNumber = (this.newStaff.phoneNumber || '').trim() || '01000000000';

    this.userService.createUser(this.newStaff).subscribe({
      next: () => {
        this.isSubmittingStaff.set(false);
        this.closeAddStaffModal();
        this.loadAll();
      },
      error: (err) => {
        this.isSubmittingStaff.set(false);
        this.addStaffError.set(this.extractApiErrorMessage(err, 'تعذر إنشاء الحساب، يرجى مراجعة البيانات المدخلة'));
      }
    });
  }

  toggleStaffStatus(staff: any): void {
    const actionText = !staff.isDeleted ? 'تعطيل' : 'تفعيل واستعادة';
    const isDanger = !staff.isDeleted;
    this.openConfirmModal(
      `تأكيد ${actionText} حساب الموظف`,
      `هل أنت متأكد من رغبتك في ${actionText} حساب ${staff.firstName} ${staff.lastName} (${staff.email})؟`,
      `${actionText} الحساب`,
      isDanger,
      () => {
        this.userService.toggleStatus(staff.id).subscribe({
          next: () => this.loadAll(),
          error: (err) => alert(this.extractApiErrorMessage(err, 'تعذر تغيير حالة حساب الموظف'))
        });
      }
    );
  }

  extractApiErrorMessage(err: any, fallback: string): string {
    if (!err) return fallback;
    const errorObj = err.error || err;

    if (typeof errorObj === 'string') {
      return this.translateApiError(errorObj);
    }

    if (errorObj && typeof errorObj === 'object') {
      if (errorObj.errors) {
        const messages: string[] = [];
        if (Array.isArray(errorObj.errors)) {
          errorObj.errors.forEach((item: any) => {
            if (typeof item === 'string') {
              const tr = this.translateApiError(item);
              if (tr) messages.push(tr);
            }
          });
        } else if (typeof errorObj.errors === 'object') {
          for (const key of Object.keys(errorObj.errors)) {
            const val = errorObj.errors[key];
            if (Array.isArray(val)) {
              val.forEach((m: any) => {
                const tr = this.translateApiError(String(m));
                if (tr) messages.push(tr);
              });
            } else if (typeof val === 'string') {
              const tr = this.translateApiError(val);
              if (tr) messages.push(tr);
            }
          }
        }
        if (messages.length > 0) {
          return Array.from(new Set(messages)).join(' | ');
        }
      }

      if (errorObj.detail && typeof errorObj.detail === 'string') {
        const tr = this.translateApiError(errorObj.detail);
        if (tr) return tr;
      }

      if (errorObj.message && typeof errorObj.message === 'string') {
        const tr = this.translateApiError(errorObj.message);
        if (tr) return tr;
      }

      if (errorObj.title && typeof errorObj.title === 'string' && errorObj.title !== 'Bad Request' && errorObj.title !== 'One or more validation errors occurred.') {
        const tr = this.translateApiError(errorObj.title);
        if (tr) return tr;
      }
    }

    if (err.status === 409) {
      return 'البيانات مُسجلة بالفعل (البريد الإلكتروني أو رقم الترخيص مستخدم مسبقاً).';
    }

    return fallback;
  }

  translateApiError(msg: string): string {
    if (!msg) return '';
    const m = msg.trim();
    if (m === 'User.DuplicatedEmail' || m.includes('Email is already registered') || m.includes('DuplicatedEmail') || m.includes('is already taken')) {
      return 'البريد الإلكتروني مُسجل بالفعل لمستخدم بالمنظومة (تحقق من قائمة النشطين أو أرشيف المعطلين)';
    }
    if (m === 'Doctor.DuplicatedEmail') {
      return 'البريد الإلكتروني مُسجل بالفعل لطبيب أو مستخدم آخر بالمنظومة';
    }
    if (m === 'Doctor.DuplicatedLicenceNumber' || m.includes('licenseNumber') || m.includes('licence') || m.includes('DuplicatedLicenceNumber')) {
      return 'رقم ترخيص مزاولة المهنة مُسجل بالفعل لطبيب آخر بالمنظومة';
    }
    if (m.includes('NonAlphanumeric') || m.includes('at least 8 digits') || m.includes('Password') || m.includes('RegexPatterns') || m.includes('Passwords must')) {
      return 'كلمة المرور يجب أن تحتوي على 8 خانات على الأقل (حرف كبير، حرف صغير، رقم، ورمز خاص مثل @ أو # أو $)';
    }
    if (m === 'User.InvalidCredentials' || m.includes('Invalid credentials')) {
      return 'بيانات الدخول غير صحيحة، يرجى التأكد من البريد وكلمة المرور';
    }
    if (m === 'User.UserNotFounded' || m.includes('User with id not founded')) {
      return 'المستخدم غير موجود بالمنظومة';
    }
    if (m.includes('length') || m.includes('characters') || m.includes('at least 3')) {
      return 'يجب ألا يقل الاسم عن 3 أحرف';
    }
    if (m.includes('DuplicateUserName')) {
      return 'اسم المستخدم أو البريد الإلكتروني مُسجل مسبقاً';
    }
    if (m === 'User.InvalidRoles') {
      return 'الدور أو الصلاحية المحددة غير صالحة';
    }
    return m;
  }

  togglePatientStatus(pat: Patient): void {
    const actionText = !pat.isDeleted ? 'تعطيل' : 'تفعيل';
    const isDanger = !pat.isDeleted;
    this.openConfirmModal(
      `تأكيد ${actionText} حساب المريض`,
      `هل أنت متأكد من رغبتك في ${actionText} حساب المريض ${pat.fullName || pat.firstName} (${pat.email})؟`,
      `${actionText} الحساب`,
      isDanger,
      () => {
        const req$ = !pat.isDeleted
          ? this.patientService.deletePatient(pat.id)
          : this.patientService.restorePatient(pat.id);

        req$.subscribe({
          next: () => this.loadAll(),
          error: (err) => alert(err.error?.detail || err.error?.message || `تعذر ${actionText} حساب المريض`)
        });
      }
    );
  }

  getStatusValue(status: string | number): number {
    const s = String(status);
    switch (s) {
      case '1':
      case 'Pending':
        return 1;
      case '2':
      case 'Confirmed':
        return 2;
      case '3':
      case 'InProgress':
        return 3;
      case '4':
      case 'Completed':
        return 4;
      case '5':
      case 'Cancelled':
        return 5;
      case '6':
      case 'NoShow':
        return 6;
      default:
        return 1;
    }
  }

  onUpdateAppointmentStatus(appointmentId: number, newStatus: any): void {
    const statusNum = parseInt(String(newStatus), 10);
    this.appointmentService.changeStatus(appointmentId, statusNum).subscribe({
      next: () => {
        this.loadAll();
      },
      error: (err) => {
        alert(err.error?.detail || 'فشل تحديث حالة الموعد');
        this.loadAll();
      }
    });
  }

  getStatusBadge(status: string | number): string {
    const s = String(status);
    switch (s) {
      case '1':
      case 'Pending':
        return 'bg-amber-100 text-amber-800';
      case '2':
      case 'Confirmed':
        return 'bg-blue-100 text-blue-800';
      case '3':
      case 'InProgress':
        return 'bg-purple-100 text-purple-800';
      case '4':
      case 'Completed':
        return 'bg-emerald-100 text-emerald-800';
      case '5':
      case 'Cancelled':
        return 'bg-rose-100 text-rose-800';
      case '6':
      case 'NoShow':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  }

  getStatusText(status: string | number): string {
    const s = String(status);
    switch (s) {
      case '1':
      case 'Pending':
        return 'قيد الانتظار';
      case '2':
      case 'Confirmed':
        return 'مؤكد ومجدول';
      case '3':
      case 'InProgress':
        return 'حضر / جاري الكشف';
      case '4':
      case 'Completed':
        return 'تم الكشف';
      case '5':
      case 'Cancelled':
        return 'ملغي';
      case '6':
      case 'NoShow':
        return 'لم يحضر';
      default:
        return s;
    }
  }

  getGenderLabel(gender: any): string {
    if (gender === null || gender === undefined) return '—';
    const g = String(gender).toLowerCase();
    if (g === 'male' || g === '1') return 'ذكر';
    if (g === 'female' || g === '2') return 'أنثى';
    return '—';
  }

  getDisplayPatientName(apt: Appointment): string {
    if (!apt) return '—';
    if (apt.reason && (apt.reason.includes('مراجع العيادة:') || apt.reason.includes('اسم المراجع:'))) {
      const match = apt.reason.match(/(?:مراجع العيادة|اسم المراجع):\s*([^|\]]+)/);
      if (match && match[1]?.trim()) {
        return `${match[1].trim()} (مراجع عيادة)`;
      }
    }
    return apt.patientName || '—';
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

  getAppointmentFee(apt: Appointment): number {
    if (apt.consultationFee && apt.consultationFee > 0) return apt.consultationFee;
    const doc = this.doctors().find(d => d.id === apt.doctorId);
    return doc?.consultationFee || 250;
  }

  openPatientHistoryModal(patient: Patient): void {
    this.selectedPatientForHistory.set(patient);
    document.body.style.overflow = 'hidden';
    this.showPatientHistoryModal.set(true);
  }

  closePatientHistoryModal(): void {
    document.body.style.overflow = '';
    this.showPatientHistoryModal.set(false);
    this.selectedPatientForHistory.set(null);
  }

  getPatientAppointments(patient: Patient): Appointment[] {
    if (!patient) return [];
    const pName = (patient.fullName || `${patient.firstName} ${patient.lastName}`).trim().toLowerCase();
    return this.allAppointments().filter(a => 
      a.patientId === patient.id || 
      (a.patientName && a.patientName.trim().toLowerCase() === pName)
    );
  }

  getPatientCompletedCount(patient: Patient): number {
    return this.getPatientAppointments(patient).filter(a => this.getStatusValue(a.status) === 4).length;
  }

  getPatientUpcomingCount(patient: Patient): number {
    const todayStr = new Date().toISOString().split('T')[0];
    return this.getPatientAppointments(patient).filter(a => 
      a.appointmentDate >= todayStr && 
      this.getStatusValue(a.status) !== 4 && 
      this.getStatusValue(a.status) !== 5
    ).length;
  }

  getPatientTotalSpent(patient: Patient): number {
    return this.getPatientAppointments(patient)
      .filter(a => [2, 3, 4].includes(this.getStatusValue(a.status)))
      .reduce((sum, a) => sum + this.getAppointmentFee(a), 0);
  }

  openResetPasswordModal(user: UserItem): void {
    this.selectedStaffForReset = user;
    this.newResetPassword = '';
    this.confirmResetPassword = '';
    this.resetPasswordError.set(null);
    this.resetPasswordSuccess.set(null);
    document.body.style.overflow = 'hidden';
    this.showResetPasswordModal.set(true);
  }

  closeResetPasswordModal(): void {
    document.body.style.overflow = '';
    this.showResetPasswordModal.set(false);
    this.selectedStaffForReset = null;
  }

  submitResetPassword(): void {
    if (!this.selectedStaffForReset) return;

    if (!this.newResetPassword || !this.confirmResetPassword) {
      this.resetPasswordError.set('يرجى إدخال كلمة المرور وتأكيدها.');
      return;
    }

    if (this.newResetPassword !== this.confirmResetPassword) {
      this.resetPasswordError.set('كلمتا المرور غير متطابقتين.');
      return;
    }

    if (this.newResetPassword.length < 8) {
      this.resetPasswordError.set('يجب ألا تقل كلمة المرور عن 8 خانات.');
      return;
    }

    this.isSubmittingResetPassword.set(true);
    this.resetPasswordError.set(null);
    this.resetPasswordSuccess.set(null);

    this.userService.resetPassword(this.selectedStaffForReset.id, this.newResetPassword).subscribe({
      next: () => {
        this.isSubmittingResetPassword.set(false);
        this.resetPasswordSuccess.set('تمت إعادة تعيين كلمة المرور بنجاح.');
        setTimeout(() => {
          this.closeResetPasswordModal();
        }, 1500);
      },
      error: (err) => {
        this.isSubmittingResetPassword.set(false);
        this.resetPasswordError.set(this.extractApiErrorMessage(err, 'تعذر إعادة تعيين كلمة المرور.'));
      }
    });
  }

  unlockStaffAccount(user: UserItem): void {
    this.openConfirmModal(
      'فك قفل الحساب',
      `هل ترغب في فك قفل حساب الموظف ${user.firstName} ${user.lastName} وإعادة تفعيله فوراً؟`,
      'فك القفل',
      false,
      () => {
        this.userService.unlockUser(user.id).subscribe({
          next: () => {
            user.isLocked = false;
            this.userService.getUsers().subscribe({
              next: (users) => {
                const staff = (users || []).filter(u => u.roles && (u.roles.includes('Receptionist') || u.roles.includes('Admin')));
                this.staffUsers.set(staff.length > 0 ? staff : (users || []));
              }
            });
            alert('تم فك قفل الحساب بنجاح.');
          },
          error: (err) => alert(this.extractApiErrorMessage(err, 'تعذر فك قفل الحساب'))
        });
      }
    );
  }

  getPaymentValue(paymentStatus: any): number {
    if (paymentStatus === undefined || paymentStatus === null) return 1;
    if (typeof paymentStatus === 'number') return paymentStatus;
    const str = String(paymentStatus).toLowerCase();
    if (str === 'paid' || str === '2') return 2;
    if (str === 'refunded' || str === '3') return 3;
    return 1;
  }

  getPaymentBadge(paymentStatus: any): string {
    const val = this.getPaymentValue(paymentStatus);
    switch (val) {
      case 2: return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      case 3: return 'bg-amber-100 text-amber-800 border border-amber-200';
      default: return 'bg-rose-100 text-rose-800 border border-rose-200';
    }
  }

  getPaymentDot(paymentStatus: any): string {
    const val = this.getPaymentValue(paymentStatus);
    switch (val) {
      case 2: return 'bg-emerald-600';
      case 3: return 'bg-amber-600';
      default: return 'bg-rose-600';
    }
  }

  getPaymentText(paymentStatus: any): string {
    const val = this.getPaymentValue(paymentStatus);
    switch (val) {
      case 2: return 'تم الدفع';
      case 3: return 'مسترد';
      default: return 'غير مدفوع';
    }
  }

  onUpdatePaymentStatus(appointmentId: number, newStatus: number | string): void {
    const statusNum = Number(newStatus);
    this.appointmentService.changePaymentStatus(appointmentId, statusNum).subscribe({
      next: () => {
        this.allAppointments.update(list => 
          list.map(a => a.id === appointmentId ? { ...a, paymentStatus: statusNum as any } : a)
        );
      },
      error: (err) => {
        alert(err.error?.detail || 'تعذر تحديث حالة السداد');
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
          alert('لم يتم إصدار روشتة لهذا الكشف بعد. سيقوم الطبيب بتدوين الفحص وإصدار الروشتة فور انتهاء جلسة الكشف.');
        } else {
          alert(err.error?.detail || err.error?.message || 'تعذر تحميل ملف الروشتة حالياً، يرجى المحاولة لاحقاً');
        }
      }
    });
  }

  printPaymentReceipt(apt: Appointment): void {
    const printWindow = window.open('', '_blank', 'width=750,height=600');
    if (!printWindow) {
      alert('يرجى السماح بالنوافذ المنبثقة لطباعة الإيصال.');
      return;
    }

    const fee = this.getAppointmentFee(apt);
    const pStatus = this.getPaymentText(apt.paymentStatus);
    const isPaid = this.getPaymentValue(apt.paymentStatus) === 2;

    let paymentMethodArabic = '💵 نقداً بالعيادة (Cash)';
    if (apt.reason?.includes('فيزا') || apt.reason?.includes('بطاقة') || apt.isOnline) {
      paymentMethodArabic = '💳 بطاقة بنكية / فيزا (Card Payment)';
    } else if (apt.reason?.includes('محفظة') || apt.reason?.includes('إنستاباي')) {
      paymentMethodArabic = '📱 محفظة إلكترونية / إنستاباي (E-Wallet)';
    } else if (!isPaid) {
      paymentMethodArabic = '⏳ معلق / لم يتم السداد بعد (Pending)';
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8">
        <title>إيصال سداد - كشف #${apt.id}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; direction: rtl; color: #1e293b; }
          .receipt-box { max-width: 550px; margin: auto; border: 2px dashed #cbd5e1; padding: 25px; border-radius: 16px; }
          .header { text-align: center; border-bottom: 2px solid #047857; padding-bottom: 15px; margin-bottom: 20px; }
          .header h1 { margin: 0; font-size: 20px; color: #047857; }
          .header p { margin: 5px 0 0; font-size: 12px; color: #64748b; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 13px; border-bottom: 1px dotted #e2e8f0; padding-bottom: 6px; }
          .info-label { color: #64748b; font-weight: 500; }
          .info-val { font-weight: bold; color: #0f172a; }
          .amount-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 15px; text-align: center; margin: 20px 0; }
          .amount-box .amount { font-size: 26px; font-weight: 900; color: #15803d; }
          .status-badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: bold; margin-top: 5px; }
          .footer { text-align: center; font-size: 11px; color: #94a3b8; margin-top: 25px; }
        </style>
      </head>
      <body>
        <div class="receipt-box">
          <div class="header">
            <h1>🏥 المركز الطبي الاستشاري</h1>
            <p>إيصال مالي رسمي لحجز موعد كشف طبي</p>
          </div>
          <div class="info-row">
            <span class="info-label">رقم الحركة المرجعي:</span>
            <span class="info-val">#TX-${apt.id}</span>
          </div>
          <div class="info-row">
            <span class="info-label">اسم المريض:</span>
            <span class="info-val">${apt.patientName || '—'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">الطبيب المعالج:</span>
            <span class="info-val">د. ${apt.doctorName || '—'} (${apt.doctorSpecialization || 'عام'})</span>
          </div>
          <div class="info-row">
            <span class="info-label">نوع ومقر الكشف:</span>
            <span class="info-val">${apt.isOnline ? '💻 كشف أونلاين / عن بعد' : '🏥 كشف مباشر بالعيادة'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">تاريخ ووقت الموعد:</span>
            <span class="info-val">${apt.appointmentDate} | ${this.formatTime(apt.appointmentTime)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">طريقة السداد:</span>
            <span class="info-val text-emerald-800">${paymentMethodArabic}</span>
          </div>
          <div class="amount-box">
            <div style="font-size: 12px; color: #166534; font-weight: bold;">إجمالي المبلغ المطلوب / المحصل</div>
            <div class="amount">${fee} ج.م</div>
            <div class="status-badge" style="${isPaid ? 'background:#dcfce7; color:#166534;' : 'background:#fee2e2; color:#991b1b;'}">${pStatus}</div>
          </div>
          <div class="info-row">
            <span class="info-label">تاريخ إصدار الإيصال:</span>
            <span class="info-val">${new Date().toLocaleString('ar-EG')}</span>
          </div>
          <div class="footer">
            شكراً لثقتكم بالمركز الطبي • يُرجى الاحتفاظ بهذا الإيصال للمراجعة
          </div>
        </div>
        <script>
          window.onload = function() { window.print(); };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  }

  exportAppointmentsToCsv(): void {
    const items = this.filteredAppointments();
    if (items.length === 0) {
      alert('لا توجد حجوزات لتصديرها.');
      return;
    }

    const headers = ['رقم الحجز', 'المريض', 'الطبيب', 'التخصص', 'نوع الكشف', 'تاريخ الموعد', 'وقت الموعد', 'الحالة', 'سعر الكشف'];
    const rows = items.map(a => [
      a.id,
      `"${(a.patientName || '').replace(/"/g, '""')}"`,
      `"${(a.doctorName || '').replace(/"/g, '""')}"`,
      `"${(a.doctorSpecialization || '').replace(/"/g, '""')}"`,
      a.isOnline ? 'أونلاين' : 'عيادة',
      a.appointmentDate,
      a.appointmentTime,
      `"${this.getStatusText(a.status)}"`,
      this.getAppointmentFee(a)
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `appointments_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  printTodaySchedule(): void {
    const todayStr = this.getLocalDateString();
    const todayApts = this.allAppointments().filter(a => this.isAppointmentToday(a.appointmentDate));

    if (todayApts.length === 0) {
      alert('لا توجد حجوزات مسجلة لتاريخ اليوم لطباعتها.');
      return;
    }

    const printWindow = window.open('', '_blank', 'width=900,height=650');
    if (!printWindow) {
      alert('يرجى السماح بالنوافذ المنبثقة لطباعة الجدول.');
      return;
    }

    const rowsHtml = todayApts.map((a, idx) => `
      <tr>
        <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: center;">${idx + 1}</td>
        <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">${a.patientName || '—'}</td>
        <td style="padding: 10px; border: 1px solid #e2e8f0;">${a.doctorName || '—'} (${a.doctorSpecialization || ''})</td>
        <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: center;">${this.formatTime(a.appointmentTime)}</td>
        <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: center;">${a.isOnline ? '💻 أونلاين' : '🏥 عيادة'}</td>
        <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: center;">${this.getStatusText(a.status)}</td>
        <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: center; font-weight: bold;">${this.getAppointmentFee(a)} ج.م</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8">
        <title>جدول مواعيد اليوم - ${todayStr}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 25px; direction: rtl; color: #1e293b; }
          h1 { margin-bottom: 4px; font-size: 22px; color: #047857; }
          p { margin-top: 0; font-size: 13px; color: #64748b; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; }
          th { background: #f1f5f9; padding: 10px; border: 1px solid #cbd5e1; font-weight: bold; }
          .summary { margin-top: 20px; display: flex; justify-content: space-between; font-weight: bold; border-top: 2px solid #047857; padding-top: 10px; }
        </style>
      </head>
      <body>
        <h1>🏥 المركز الطبي - جدول مواعيد وكشوفات اليوم</h1>
        <p>تاريخ الطباعة: ${todayStr} | إجمالي المراجعين المسجلين: ${todayApts.length}</p>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>المريض</th>
              <th>الطبيب والتخصص</th>
              <th>الوقت</th>
              <th>النوع</th>
              <th>الحالة</th>
              <th>الرسوم</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
        <div class="summary">
          <div>إجمالي المواعيد: ${todayApts.length}</div>
          <div>إجمالي الإيراد المتوقع لليوم: ${this.todayRevenue()} ج.م</div>
        </div>
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  }

  toggleWalkinNewPatient(): void {
    this.walkinBooking.isNewPatient = !this.walkinBooking.isNewPatient;
    this.walkinBookingError.set(null);
  }

  openWalkinBookingModal(): void {
    this.walkinBookingError.set(null);
    const todayStr = this.getLocalDateString();
    const firstDoc = this.doctors().length > 0 ? this.doctors()[0] : null;
    const firstPat = this.patients().length > 0 ? this.patients()[0] : null;

    this.walkinBooking = {
      patientId: firstPat ? firstPat.id : null,
      isNewPatient: false,
      newPatientFirstName: '',
      newPatientLastName: '',
      newPatientPhone: '',
      newPatientGender: 1,
      doctorId: firstDoc ? firstDoc.id : null,
      appointmentDate: todayStr,
      appointmentTime: firstDoc?.workStartTime ? firstDoc.workStartTime.substring(0, 5) : '10:00',
      type: 1,
      consultationFee: firstDoc?.consultationFee || 250,
      paymentMethod: 'cash',
      reason: '',
      isPaid: true
    };

    if (firstDoc) {
      this.loadSlotsForWalkin();
    }
    this.showWalkinBookingModal.set(true);
  }

  closeWalkinBookingModal(): void {
    this.showWalkinBookingModal.set(false);
    this.walkinBookingError.set(null);
  }

  onWalkinDoctorChange(docId: any): void {
    this.walkinBooking.doctorId = Number(docId);
    const doc = this.doctors().find(d => d.id === this.walkinBooking.doctorId);
    if (doc?.consultationFee) {
      this.walkinBooking.consultationFee = doc.consultationFee;
    }
    this.loadSlotsForWalkin();
  }

  onWalkinDateChange(date: string): void {
    this.walkinBooking.appointmentDate = date;
    this.loadSlotsForWalkin();
  }

  loadSlotsForWalkin(): void {
    const docId = this.walkinBooking.doctorId;
    const date = this.walkinBooking.appointmentDate;
    if (!docId || !date) return;

    this.appointmentService.getDoctorAvailability(docId, date).subscribe({
      next: (res) => {
        if (res && res.timeSlots && res.timeSlots.length > 0) {
          const slots = res.timeSlots.map((s: any) => s.time.substring(0, 5));
          this.walkinDoctorSlots.set(slots);
          if (slots.length > 0 && !slots.includes(this.walkinBooking.appointmentTime)) {
            this.walkinBooking.appointmentTime = slots[0];
          }
        } else {
          this.generateFallbackSlots();
        }
      },
      error: () => {
        this.generateFallbackSlots();
      }
    });
  }

  private generateFallbackSlots(): void {
    const doc = this.doctors().find(d => d.id === this.walkinBooking.doctorId);
    const startH = doc?.workStartTime ? parseInt(doc.workStartTime.split(':')[0], 10) : 9;
    const endH = doc?.workEndTime ? parseInt(doc.workEndTime.split(':')[0], 10) : 17;
    const duration = doc?.slotDurationMinutes || 20;
    const slots: string[] = [];
    let cur = startH * 60;
    const end = endH * 60;
    while (cur < end) {
      const h = Math.floor(cur / 60).toString().padStart(2, '0');
      const m = (cur % 60).toString().padStart(2, '0');
      slots.push(`${h}:${m}`);
      cur += duration;
    }
    this.walkinDoctorSlots.set(slots);
    if (slots.length > 0) {
      this.walkinBooking.appointmentTime = slots[0];
    }
  }

  submitWalkinBooking(): void {
    this.walkinBookingError.set(null);

    if (!this.walkinBooking.doctorId) {
      this.walkinBookingError.set('يرجى اختيار الطبيب المختص');
      return;
    }

    if (!this.walkinBooking.appointmentDate || !this.walkinBooking.appointmentTime) {
      this.walkinBookingError.set('يرجى تحديد تاريخ ووقت الكشف');
      return;
    }

    this.isSubmittingWalkinBooking.set(true);

    if (this.walkinBooking.isNewPatient) {
      const fName = this.walkinBooking.newPatientFirstName.trim();
      const lName = this.walkinBooking.newPatientLastName.trim();
      const phone = this.walkinBooking.newPatientPhone.trim();

      if (!fName || !phone) {
        this.walkinBookingError.set('يرجى إدخال اسم المراجع ورقم الهاتف');
        this.isSubmittingWalkinBooking.set(false);
        return;
      }

      // Check for master walk-in account (patient@clinic.com or walkin.patient@medical-clinic.com)
      const walkinPatient = this.patients().find(p => 
        p.email?.toLowerCase() === 'patient@clinic.com' || 
        p.email?.toLowerCase() === 'walkin.patient@medical-clinic.com'
      );
      if (walkinPatient) {
        const fullName = `${fName} ${lName}`.trim();
        const visitorNote = `[مراجع العيادة: ${fullName} | هاتف: ${phone}]`;
        this.walkinBooking.reason = (this.walkinBooking.reason?.trim() ? this.walkinBooking.reason.trim() + ' ' : '') + visitorNote;
        this.executeBookAppointment(walkinPatient.id);
        return;
      }

      // Fallback: register if master account is not found
      const phoneClean = phone.replace(/[^0-9]/g, '');
      const uniqueSuffix = Date.now().toString().slice(-6);
      const email = `patient_${phoneClean || uniqueSuffix}@clinic.local`;
      const pass = `Clinic@${phoneClean.slice(-4) || '1234'}!`;
      const patientReq = {
        firstName: fName,
        lastName: lName || 'العيادة',
        email: email,
        password: pass,
        phoneNumber: phone,
        gender: Number(this.walkinBooking.newPatientGender) || 1,
        dateOfBirth: '2000-01-01',
        address: 'مقر العيادة'
      };

      this.patientService.registerPatient(patientReq).subscribe({
        next: () => {
          this.patientService.getAllPatients().subscribe({
            next: (pts) => {
              this.patients.set(pts || []);
              const newlyCreated = (pts || []).find(p => p.email.toLowerCase() === email.toLowerCase());
              const patientId = newlyCreated ? newlyCreated.id : pts[pts.length - 1]?.id;
              if (!patientId) {
                this.isSubmittingWalkinBooking.set(false);
                this.walkinBookingError.set('تم تسجيل المريض لكن تعذر العثور على معرّف الحساب لإتمام الحجز');
                return;
              }
              this.executeBookAppointment(patientId);
            },
            error: (err) => {
              this.isSubmittingWalkinBooking.set(false);
              this.walkinBookingError.set(this.extractApiErrorMessage(err, 'تم تسجيل المريض لكن تعذر جلب قائمة المرضى لإتمام الحجز'));
            }
          });
        },
        error: (err) => {
          this.isSubmittingWalkinBooking.set(false);
          this.walkinBookingError.set(this.extractApiErrorMessage(err, 'تعذر تسجيل المريض في النظام'));
        }
      });
    } else {
      if (!this.walkinBooking.patientId) {
        this.walkinBookingError.set('يرجى اختيار المريض من القائمة');
        this.isSubmittingWalkinBooking.set(false);
        return;
      }
      this.executeBookAppointment(Number(this.walkinBooking.patientId));
    }
  }

  private executeBookAppointment(patientId: number): void {
    const formattedTime = this.walkinBooking.appointmentTime.length === 5 
      ? `${this.walkinBooking.appointmentTime}:00` 
      : this.walkinBooking.appointmentTime;

    const isPaid = this.walkinBooking.paymentMethod !== 'unpaid';
    let methodArabic = 'نقداً بالعيادة 💵';
    if (this.walkinBooking.paymentMethod === 'card') methodArabic = 'بطاقة بنكية / فيزا 💳';
    else if (this.walkinBooking.paymentMethod === 'wallet') methodArabic = 'محفظة إلكترونية / إنستاباي 📱';
    else if (this.walkinBooking.paymentMethod === 'unpaid') methodArabic = 'غير مدفوع (سداد لاحق) ⏳';

    const reasonText = this.walkinBooking.reason?.trim() 
      ? `${this.walkinBooking.reason.trim()} [طريقة السداد: ${methodArabic}]` 
      : `كشف مراجع بالعيادة [طريقة السداد: ${methodArabic}]`;

    const bookReq: CreateAppointmentRequest = {
      doctorId: this.walkinBooking.doctorId!,
      appointmentDate: this.walkinBooking.appointmentDate,
      appointmentTime: formattedTime,
      type: this.walkinBooking.type,
      consultationFee: this.walkinBooking.consultationFee,
      isOnline: false,
      isPaid: isPaid,
      reason: reasonText,
      patientId: patientId
    };

    this.appointmentService.bookAppointment(bookReq).subscribe({
      next: (res) => {
        if (isPaid && res && res.appointmentId) {
          this.appointmentService.changePaymentStatus(res.appointmentId, 2).subscribe({
            next: () => {
              this.appointmentService.changeStatus(res.appointmentId, 2).subscribe({
                next: () => {
                  this.isSubmittingWalkinBooking.set(false);
                  this.closeWalkinBookingModal();
                  this.loadAll();
                },
                error: () => {
                  this.isSubmittingWalkinBooking.set(false);
                  this.closeWalkinBookingModal();
                  this.loadAll();
                }
              });
            },
            error: () => {
              this.isSubmittingWalkinBooking.set(false);
              this.closeWalkinBookingModal();
              this.loadAll();
            }
          });
        } else {
          this.isSubmittingWalkinBooking.set(false);
          this.closeWalkinBookingModal();
          this.loadAll();
        }
      },
      error: (err) => {
        this.isSubmittingWalkinBooking.set(false);
        this.walkinBookingError.set(this.extractApiErrorMessage(err, 'تعذر إتمام حجز الموعد بالعيادة'));
      }
    });
  }
}
