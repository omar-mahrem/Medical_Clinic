import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Doctor } from '../../../core/models/doctor.model';
import { AppointmentType } from '../../../core/models/appointment.model';
import { AppointmentService } from '../../../core/services/appointment.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-booking-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div 
      (click)="onBackdropClick($event)"
      class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overscroll-contain">
      <div 
        (click)="$event.stopPropagation()"
        class="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-hidden border border-emerald-100 shadow-2xl flex flex-col relative animate-in fade-in zoom-in-95 duration-200 overscroll-contain">
        
        <!-- Pinned Header with Close Button -->
        <div class="p-6 pb-4 sm:p-8 sm:pb-4 border-b border-slate-100 shrink-0 relative bg-white">
          <button 
            type="button"
            (click)="close.emit()" 
            class="absolute top-5 left-5 text-slate-400 hover:text-slate-600 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold transition cursor-pointer">
            ✕
          </button>

          <span class="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full inline-block mb-1.5">
            حجز كشف طبي فوري
          </span>
          <h3 class="text-xl font-extrabold text-[#14291c]">تأكيد موعد مع د/ {{ doctor.fullName || (doctor.firstName + ' ' + doctor.lastName) }}</h3>
          <p class="text-xs text-emerald-700 font-semibold">{{ doctor.specialization }}</p>
        </div>

        <!-- Scrollable Content with Inset Scrollbar -->
        <div class="p-6 sm:p-8 pt-5 overflow-y-auto custom-scrollbar flex-1 overscroll-contain">

        @if (!authService.isAuthenticated()) {
          <div class="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-4 text-xs space-y-3 mb-6">
            <p class="font-bold">⚠️ يلزم تسجيل الدخول أو إنشاء حساب مريض لتثبيت الحجز بملفك الطبي.</p>
            <div class="flex gap-2">
              <button 
                (click)="redirectToLogin()" 
                class="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-lg text-xs transition-colors">
                تسجيل الدخول الآن
              </button>
            </div>
          </div>
        }

        <!-- Booking Form -->
        <form (ngSubmit)="confirmBooking()" class="space-y-4">
          
          <!-- Date Picker -->
          <div>
            <div class="flex justify-between items-center mb-1">
              <label class="block text-xs font-bold text-slate-700">تاريخ الكشف:</label>
              <span class="text-[11px] font-semibold" [ngClass]="isDateInPast ? 'text-rose-600' : 'text-emerald-700'">
                {{ isDateInPast ? '⚠️ تاريخ منتهي' : 'متاح اليوم والأيام القادمة' }}
              </span>
            </div>
            <input 
              type="date" 
              [(ngModel)]="selectedDate" 
              (change)="onDateChange()"
              (input)="onDateChange()"
              name="date"
              [min]="today"
              [class.border-rose-400]="isDateInPast"
              [class.bg-rose-50/50]="isDateInPast"
              [class.text-rose-700]="isDateInPast"
              class="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-emerald-600 bg-slate-50 transition"
              required />

            @if (isDateInPast) {
              <div class="mt-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <span class="text-base shrink-0">⚠️</span>
                <span>هذا اليوم قد انقضى بالفعل! لا يمكن حجز موعد في تاريخ ماضٍ، يرجى اختيار تاريخ اليوم أو موعد قادم.</span>
              </div>
            }
          </div>

          <!-- Time Slots Grid -->
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <label class="block text-xs font-bold text-slate-700">المواعيد المتاحة لدى الطبيب:</label>
              @if (loadingSlots()) {
                <span class="text-[10px] text-slate-400 font-medium">جاري فحص جدول المواعيد...</span>
              } @else {
                <span class="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                  {{ availableCount() }} موعد متاح للحجز
                </span>
              }
            </div>

            <!-- Morning Period -->
            <div>
              <span class="text-[11px] font-bold text-slate-500 mb-1.5 block">☀️ الفترة الصباحية:</span>
              <div class="grid grid-cols-3 gap-2">
                @for (slot of morningSlots(); track slot.time) {
                  <button 
                    type="button"
                    (click)="selectSlot(slot)"
                    [disabled]="!slot.isAvailable"
                    [class.bg-emerald-700]="selectedTime === slot.time && slot.isAvailable"
                    [class.text-white]="selectedTime === slot.time && slot.isAvailable"
                    [class.border-emerald-700]="selectedTime === slot.time && slot.isAvailable"
                    [class.bg-white]="selectedTime !== slot.time && slot.isAvailable"
                    [class.text-slate-800]="selectedTime !== slot.time && slot.isAvailable"
                    [class.opacity-40]="!slot.isAvailable"
                    [class.bg-slate-100]="!slot.isAvailable"
                    [class.text-slate-400]="!slot.isAvailable"
                    [class.cursor-not-allowed]="!slot.isAvailable"
                    class="text-xs font-bold py-2 px-1 rounded-xl border border-slate-200 hover:border-emerald-500 transition-all text-center flex flex-col items-center justify-center">
                    <span>{{ slot.label }}</span>
                    @if (!slot.isAvailable) {
                      <span class="text-[9px] text-rose-500 font-normal">{{ slot.statusLabel || 'محجوز' }}</span>
                    }
                  </button>
                }
              </div>
            </div>

            <!-- Evening Period -->
            <div>
              <span class="text-[11px] font-bold text-slate-500 mb-1.5 block">🌙 الفترة المسائية:</span>
              <div class="grid grid-cols-3 gap-2">
                @for (slot of eveningSlots(); track slot.time) {
                  <button 
                    type="button"
                    (click)="selectSlot(slot)"
                    [disabled]="!slot.isAvailable"
                    [class.bg-emerald-700]="selectedTime === slot.time && slot.isAvailable"
                    [class.text-white]="selectedTime === slot.time && slot.isAvailable"
                    [class.border-emerald-700]="selectedTime === slot.time && slot.isAvailable"
                    [class.bg-white]="selectedTime !== slot.time && slot.isAvailable"
                    [class.text-slate-800]="selectedTime !== slot.time && slot.isAvailable"
                    [class.opacity-40]="!slot.isAvailable"
                    [class.bg-slate-100]="!slot.isAvailable"
                    [class.text-slate-400]="!slot.isAvailable"
                    [class.cursor-not-allowed]="!slot.isAvailable"
                    class="text-xs font-bold py-2 px-1 rounded-xl border border-slate-200 hover:border-emerald-500 transition-all text-center flex flex-col items-center justify-center">
                    <span>{{ slot.label }}</span>
                    @if (!slot.isAvailable) {
                      <span class="text-[9px] text-rose-500 font-normal">{{ slot.statusLabel || 'محجوز' }}</span>
                    }
                  </button>
                }
              </div>
            </div>

            <p class="text-[11px] text-slate-400 leading-tight">
              ✓ يمكنك اختيار أي موعد من المواعيد المتاحة أعلاه بما يناسب جدولك.
            </p>
          </div>

          <!-- Service Medium (In-Clinic vs Online Video) -->
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1.5">مكان ونوع تقديم الخدمة:</label>
            <div class="grid grid-cols-2 gap-2">
              <button 
                type="button" 
                (click)="isOnline = false"
                [class.border-emerald-600]="!isOnline"
                [class.bg-emerald-50]="!isOnline"
                [class.text-emerald-950]="!isOnline"
                [class.border-slate-200]="isOnline"
                [class.bg-white]="isOnline"
                [class.text-slate-700]="isOnline"
                class="p-2.5 rounded-xl border text-center transition-all cursor-pointer">
                <div class="text-lg mb-0.5">🏥</div>
                <div class="text-xs font-bold">كشف حضوري بالعيادة</div>
                <div class="text-[10px] text-slate-500">نقداً أو دفع أونلاين مسبق</div>
              </button>

              <button 
                type="button" 
                (click)="isOnline = true"
                [class.border-teal-600]="isOnline"
                [class.bg-teal-50]="isOnline"
                [class.text-teal-950]="isOnline"
                [class.border-slate-200]="!isOnline"
                [class.bg-white]="!isOnline"
                [class.text-slate-700]="!isOnline"
                class="p-2.5 rounded-xl border text-center transition-all cursor-pointer relative overflow-hidden">
                <span class="absolute top-1 left-1 bg-teal-600 text-white text-[8px] font-extrabold px-1.5 py-0.2 rounded-full">جديد</span>
                <div class="text-lg mb-0.5">💻</div>
                <div class="text-xs font-bold">استشارة فيديو أونلاين</div>
                <div class="text-[10px] text-teal-700 font-semibold">غرفة مرئية + دفع فوري</div>
              </button>
            </div>
          </div>

          <!-- If In-Clinic: Payment Preference -->
          @if (!isOnline) {
            <div class="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <label class="block text-xs font-bold text-slate-700 mb-2">طريقة سداد كشف العيادة:</label>
              <div class="grid grid-cols-2 gap-2">
                <button 
                  type="button"
                  (click)="payOnlineForClinic = false"
                  [class.border-emerald-600]="!payOnlineForClinic"
                  [class.bg-emerald-100/60]="!payOnlineForClinic"
                  [class.text-emerald-950]="!payOnlineForClinic"
                  [class.border-slate-300]="payOnlineForClinic"
                  [class.bg-white]="payOnlineForClinic"
                  [class.text-slate-700]="payOnlineForClinic"
                  class="py-2 px-2.5 rounded-lg border text-xs font-bold text-center cursor-pointer transition-all">
                  💵 نقداً عند الحضور
                </button>
                <button 
                  type="button"
                  (click)="payOnlineForClinic = true"
                  [class.border-teal-600]="payOnlineForClinic"
                  [class.bg-teal-100/60]="payOnlineForClinic"
                  [class.text-teal-950]="payOnlineForClinic"
                  [class.border-slate-300]="!payOnlineForClinic"
                  [class.bg-white]="!payOnlineForClinic"
                  [class.text-slate-700]="!payOnlineForClinic"
                  class="py-2 px-2.5 rounded-lg border text-xs font-bold text-center cursor-pointer transition-all">
                  💳 دفع إلكتروني مسبقاً
                </button>
              </div>
            </div>
          }

          <!-- Appointment Type -->
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">نوع الكشف الطبي:</label>
            <select 
              [(ngModel)]="selectedType" 
              name="type" 
              class="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-emerald-600 bg-slate-50">
              <option [value]="1">🩺 كشف جديد أول مرة (First Visit) — فحص سريري كامل وفتح ملف</option>
              <option [value]="2">🔄 متابعة واستشارة دورية (Follow Up) — مراجعة تحاليل أو استجابة علاج</option>
              <option [value]="4">🔬 استشارة متخصصة معمقة (Consultation) — تقييم فحوصات متقدمة أو رأي طبي ثانٍ</option>
            </select>
          </div>

          <!-- Notes -->
          <div>
            <div class="flex justify-between items-center mb-1">
              <label class="block text-xs font-bold text-slate-700">ملاحظات أو شكوى موجزة (اختياري):</label>
              <span class="text-[10px] text-slate-400 font-mono">{{ reason.length || 0 }}/1000 حرف</span>
            </div>
            <textarea 
              [(ngModel)]="reason" 
              name="reason" 
              rows="3" 
              maxlength="1000"
              placeholder="مثال: آلام متكررة في الصدر، متابعة كشف سابق، تفاصيل الأعراض..."
              class="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-emerald-600 bg-slate-50"></textarea>
          </div>

          <!-- Online Payment Box (If Online OR Clinic Pre-pay) -->
          @if (requiresPayment) {
            <div class="bg-teal-50/80 border border-teal-200 rounded-2xl p-4 space-y-3 animate-in fade-in duration-200">
              <div class="flex items-center justify-between">
                <span class="text-xs font-extrabold text-teal-950 flex items-center gap-1.5">
                  <span>💳</span>
                  <span>بوابة السداد الإلكتروني (دفع تجريبي Sandbox):</span>
                </span>
                <span class="text-[10px] bg-teal-200 text-teal-900 font-bold px-2 py-0.5 rounded">
                  مشفر ومؤمن
                </span>
              </div>

              <!-- Payment Method Tabs -->
              <div class="grid grid-cols-3 gap-1.5 bg-teal-100/60 p-1 rounded-xl text-xs font-bold">
                <button 
                  type="button"
                  (click)="paymentMethod = 'card'"
                  [class.bg-white]="paymentMethod === 'card'"
                  [class.text-teal-950]="paymentMethod === 'card'"
                  [class.shadow-2xs]="paymentMethod === 'card'"
                  [class.text-teal-800]="paymentMethod !== 'card'"
                  class="py-1.5 rounded-lg text-center cursor-pointer transition-all">
                  💳 بطاقة بنكية
                </button>
                <button 
                  type="button"
                  (click)="paymentMethod = 'wallet'"
                  [class.bg-white]="paymentMethod === 'wallet'"
                  [class.text-teal-950]="paymentMethod === 'wallet'"
                  [class.shadow-2xs]="paymentMethod === 'wallet'"
                  [class.text-teal-800]="paymentMethod !== 'wallet'"
                  class="py-1.5 rounded-lg text-center cursor-pointer transition-all">
                  📱 محفظة كاش
                </button>
                <button 
                  type="button"
                  (click)="paymentMethod = 'instapay'"
                  [class.bg-white]="paymentMethod === 'instapay'"
                  [class.text-teal-950]="paymentMethod === 'instapay'"
                  [class.shadow-2xs]="paymentMethod === 'instapay'"
                  [class.text-teal-800]="paymentMethod !== 'instapay'"
                  class="py-1.5 rounded-lg text-center cursor-pointer transition-all">
                  ⚡ إنستاباي
                </button>
              </div>

              <!-- Tab 1: Bank Card Form -->
              @if (paymentMethod === 'card') {
                <div class="space-y-2 pt-1">
                  <div>
                    <label class="block text-[10px] font-bold text-slate-600 mb-0.5">رقم البطاقة:</label>
                    <input 
                      type="text" 
                      [(ngModel)]="cardNumber" 
                      name="cardNumber"
                      dir="ltr"
                      class="w-full text-xs font-mono px-3 py-1.5 rounded-lg border border-teal-200 bg-white" />
                  </div>
                  <div class="grid grid-cols-2 gap-2">
                    <div>
                      <label class="block text-[10px] font-bold text-slate-600 mb-0.5">تاريخ الانتهاء:</label>
                      <input 
                        type="text" 
                        [(ngModel)]="cardExp" 
                        name="cardExp"
                        dir="ltr"
                        placeholder="MM/YY"
                        class="w-full text-xs font-mono px-3 py-1.5 rounded-lg border border-teal-200 bg-white" />
                    </div>
                    <div>
                      <label class="block text-[10px] font-bold text-slate-600 mb-0.5">رمز الأمان CVC:</label>
                      <input 
                        type="password" 
                        [(ngModel)]="cardCvc" 
                        name="cardCvc"
                        dir="ltr"
                        placeholder="•••"
                        class="w-full text-xs font-mono px-3 py-1.5 rounded-lg border border-teal-200 bg-white" />
                    </div>
                  </div>
                </div>
              }

              <!-- Tab 2: Mobile Wallet Form -->
              @if (paymentMethod === 'wallet') {
                <div class="space-y-2 pt-1 text-xs">
                  <div>
                    <label class="block text-[10px] font-bold text-slate-600 mb-0.5">اختر شبكة المحفظة:</label>
                    <div class="grid grid-cols-4 gap-1.5 text-center text-[10px] font-bold">
                      <button type="button" (click)="walletProvider = 'vodafone'" [class.bg-rose-600]="walletProvider === 'vodafone'" [class.text-white]="walletProvider === 'vodafone'" [class.bg-white]="walletProvider !== 'vodafone'" class="p-1.5 rounded-lg border border-teal-200 cursor-pointer">فودافون كاش</button>
                      <button type="button" (click)="walletProvider = 'orange'" [class.bg-amber-500]="walletProvider === 'orange'" [class.text-white]="walletProvider === 'orange'" [class.bg-white]="walletProvider !== 'orange'" class="p-1.5 rounded-lg border border-teal-200 cursor-pointer">أورنج كاش</button>
                      <button type="button" (click)="walletProvider = 'etisalat'" [class.bg-emerald-600]="walletProvider === 'etisalat'" [class.text-white]="walletProvider === 'etisalat'" [class.bg-white]="walletProvider !== 'etisalat'" class="p-1.5 rounded-lg border border-teal-200 cursor-pointer">اتصالات كاش</button>
                      <button type="button" (click)="walletProvider = 'we'" [class.bg-purple-600]="walletProvider === 'we'" [class.text-white]="walletProvider === 'we'" [class.bg-white]="walletProvider !== 'we'" class="p-1.5 rounded-lg border border-teal-200 cursor-pointer">وي باي WE</button>
                    </div>
                  </div>
                  <div>
                    <label class="block text-[10px] font-bold text-slate-600 mb-0.5">رقم هاتف المحفظة:</label>
                    <input 
                      type="tel" 
                      [(ngModel)]="walletNumber" 
                      name="walletNumber"
                      dir="ltr"
                      placeholder="010xxxxxxxx"
                      class="w-full text-xs font-mono px-3 py-1.5 rounded-lg border border-teal-200 bg-white" />
                  </div>
                  <p class="text-[10px] text-teal-800">✓ ستصلك رسالة تأكيد الخصم على هاتفك المحمول تلقائياً فور النقر على التأكيد.</p>
                </div>
              }

              <!-- Tab 3: InstaPay Form -->
              @if (paymentMethod === 'instapay') {
                <div class="space-y-2 pt-1 text-xs">
                  <div class="bg-white p-2.5 rounded-xl border border-teal-200 space-y-1">
                    <div class="flex justify-between items-center text-[11px]">
                      <span class="text-slate-500">عنوان إنستاباي المركز (IPA):</span>
                      <strong class="font-mono text-emerald-800 font-extrabold select-all">clinic@instapay</strong>
                    </div>
                    <div class="flex justify-between items-center text-[11px]">
                      <span class="text-slate-500">رقم الهاتف للتحويل:</span>
                      <strong class="font-mono text-emerald-800 font-extrabold select-all">01000001234</strong>
                    </div>
                  </div>
                  <div>
                    <label class="block text-[10px] font-bold text-slate-600 mb-0.5">الرقم المرجعي للمعاملة (Reference No):</label>
                    <input 
                      type="text" 
                      [(ngModel)]="instapayRef" 
                      name="instapayRef"
                      dir="ltr"
                      class="w-full text-xs font-mono px-3 py-1.5 rounded-lg border border-teal-200 bg-white" />
                  </div>
                </div>
              }

              <div class="text-[11px] text-teal-900 flex items-center justify-between pt-1 border-t border-teal-200/60 font-semibold">
                <span>المبلغ الإجمالي للسداد:</span>
                <span class="font-extrabold text-sm text-teal-950">{{ totalFee }} ج.م</span>
              </div>
            </div>
          }

          <!-- Price & PDF Notice -->
          <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex justify-between items-center text-xs">
            <div>
              <span class="text-slate-600 block">إجمالي الرسوم:</span>
              <strong class="text-sm font-extrabold text-emerald-900">{{ totalFee }} ج.م</strong>
            </div>
            <span class="text-[11px] font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-md border border-emerald-200">
              {{ isOnline ? 'يشمل رابط اللقاء + روشتة PDF' : (requiresPayment ? 'مدفوع إلكترونياً مسبقاً' : 'الدفع نقداً عند الحضور') }}
            </span>
          </div>

          <!-- Submit Buttons -->
          <div class="flex gap-3 pt-2">
            <button 
              type="submit" 
              [disabled]="loading() || !authService.isAuthenticated() || !selectedTime || isDateInPast"
              class="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-700 hover:to-emerald-900 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-700/25 transition-all cursor-pointer">
              @if (loading()) {
                {{ isOnline ? 'جاري معالجة الدفع وتثبيت الجلسة...' : 'جاري تأكيد الحجز...' }}
              } @else {
                {{ isOnline ? 'تأكيد الدفع وحجز الاستشارة الأونلاين ←' : 'تأكيد حجز الموعد الآن (' + formatDisplayTime(selectedTime) + ') ←' }}
              }
            </button>
            <button 
              type="button" 
              (click)="close.emit()" 
              class="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer">
              إلغاء
            </button>
          </div>

          @if (errorMessage()) {
            <p class="text-xs text-rose-600 font-bold text-center mt-2">{{ errorMessage() }}</p>
          }
          @if (successMessage()) {
            <p class="text-xs text-emerald-700 font-bold text-center mt-2">{{ successMessage() }}</p>
          }

        </form>
        </div>

      </div>
    </div>
  `
})
export class BookingModalComponent implements OnInit, OnDestroy {
  @Input({ required: true }) doctor!: Doctor;
  @Output() close = new EventEmitter<void>();
  @Output() booked = new EventEmitter<void>();

  private readonly appointmentService = inject(AppointmentService);
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  private getLocalDateString(d: Date = new Date()): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  readonly today = this.getLocalDateString();
  selectedDate: string = this.getLocalDateString();
  selectedTime: string = '09:30';
  selectedType: number = AppointmentType.FirstVisit;
  reason: string = '';
  isOnline: boolean = false;
  payOnlineForClinic: boolean = false;
  readonly onlineFee: number = 350;

  paymentMethod: 'card' | 'wallet' | 'instapay' = 'card';
  cardNumber: string = '4242 4242 4242 4242';
  cardExp: string = '12/28';
  cardCvc: string = '123';
  walletNumber: string = '01012345678';
  walletProvider: string = 'vodafone';
  instapayRef: string = 'INSTA-883921';

  get totalFee(): number {
    return this.isOnline ? this.onlineFee : (this.doctor.consultationFee || 250);
  }

  get requiresPayment(): boolean {
    return this.isOnline || this.payOnlineForClinic;
  }

  readonly loading = signal(false);
  readonly loadingSlots = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  readonly slots = signal<{ time: string; label: string; isAvailable: boolean; statusLabel?: string; period: 'morning' | 'evening' }[]>([]);

  readonly morningSlots = computed(() => this.slots().filter(s => s.period === 'morning'));
  readonly eveningSlots = computed(() => this.slots().filter(s => s.period === 'evening'));
  readonly availableCount = computed(() => this.slots().filter(s => s.isAvailable).length);

  ngOnInit(): void {
    document.body.style.overflow = 'hidden';
    this.loadAvailability();
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }

  get isDateInPast(): boolean {
    if (!this.selectedDate) return false;
    return this.selectedDate < this.today;
  }

  onDateChange(): void {
    if (this.isDateInPast) {
      const pastSlots = this.getDefaultSlots().map(s => ({
        ...s,
        isAvailable: false,
        statusLabel: 'تاريخ مضى'
      }));
      this.slots.set(pastSlots);
      this.selectedTime = '';
      return;
    }
    this.loadAvailability();
  }

  selectSlot(slot: { time: string; isAvailable: boolean }): void {
    if (slot.isAvailable) {
      this.selectedTime = slot.time;
    }
  }

  formatDisplayTime(time: string): string {
    const slot = this.slots().find(s => s.time === time);
    return slot ? slot.label : time;
  }

  private isTimePassed(timeStr: string): boolean {
    if (this.selectedDate !== this.today) return false;
    const now = new Date();
    const parts = timeStr.split(':');
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const currentH = now.getHours();
    const currentM = now.getMinutes();
    return h < currentH || (h === currentH && m <= currentM);
  }

  loadAvailability(): void {
    if (this.isDateInPast) {
      const pastSlots = this.getDefaultSlots().map(s => ({
        ...s,
        isAvailable: false,
        statusLabel: 'تاريخ مضى'
      }));
      this.slots.set(pastSlots);
      this.selectedTime = '';
      this.loadingSlots.set(false);
      return;
    }

    this.loadingSlots.set(true);
    this.appointmentService.getDoctorAvailability(this.doctor.id, this.selectedDate).subscribe({
      next: (res) => {
        this.loadingSlots.set(false);
        if (res && res.timeSlots && res.timeSlots.length > 0) {
          const parsed = res.timeSlots.map(s => {
            const timeStr = typeof s.time === 'string' ? s.time.substring(0, 5) : s.time;
            const hour = parseInt(timeStr.split(':')[0], 10);
            const period: 'morning' | 'evening' = hour < 14 ? 'morning' : 'evening';
            const label = this.toArabicTimeLabel(timeStr);
            const isPassed = this.isTimePassed(timeStr);
            const isAvailable = s.isAvailable && !isPassed;
            const statusLabel = isPassed ? 'فات وقته' : (!s.isAvailable ? 'محجوز' : undefined);
            return {
              time: timeStr,
              label,
              isAvailable,
              statusLabel,
              period
            };
          });

          const uniqueMap = new Map<string, typeof parsed[0]>();
          for (const s of parsed) {
            if (!uniqueMap.has(s.time)) {
              uniqueMap.set(s.time, s);
            }
          }
          const uniqueSlots = Array.from(uniqueMap.values());
          this.slots.set(uniqueSlots.length > 0 ? uniqueSlots : this.getDefaultSlots());

          // Auto-select first available slot
          const firstAvailable = this.slots().find(s => s.isAvailable);
          if (firstAvailable) {
            this.selectedTime = firstAvailable.time;
          } else {
            this.selectedTime = '';
          }
        } else {
          this.slots.set(this.getDefaultSlots());
        }
      },
      error: () => {
        this.loadingSlots.set(false);
        this.slots.set(this.getDefaultSlots());
      }
    });
  }

  private toArabicTimeLabel(hhmm: string): string {
    const parts = hhmm.split(':');
    let hour = parseInt(parts[0], 10);
    const minute = parts[1] || '00';
    const isPm = hour >= 12;
    if (hour > 12) hour -= 12;
    if (hour === 0) hour = 12;
    const hourStr = hour < 10 ? '0' + hour : '' + hour;
    return `${hourStr}:${minute} ${isPm ? 'م' : 'ص'}`;
  }

  private getDefaultSlots(): { time: string; label: string; isAvailable: boolean; statusLabel?: string; period: 'morning' | 'evening' }[] {
    const defaultList = [
      { time: '09:00', label: '09:00 ص', period: 'morning' as const },
      { time: '09:20', label: '09:20 ص', period: 'morning' as const },
      { time: '09:40', label: '09:40 ص', period: 'morning' as const },
      { time: '10:00', label: '10:00 ص', period: 'morning' as const },
      { time: '10:20', label: '10:20 ص', period: 'morning' as const },
      { time: '10:40', label: '10:40 ص', period: 'morning' as const },
      { time: '11:00', label: '11:00 ص', period: 'morning' as const },
      { time: '11:20', label: '11:20 ص', period: 'morning' as const },
      { time: '11:40', label: '11:40 ص', period: 'morning' as const },
      { time: '16:00', label: '04:00 م', period: 'evening' as const },
      { time: '16:20', label: '04:20 م', period: 'evening' as const },
      { time: '16:40', label: '04:40 م', period: 'evening' as const },
      { time: '17:00', label: '05:00 م', period: 'evening' as const },
      { time: '17:20', label: '05:20 م', period: 'evening' as const },
      { time: '17:40', label: '05:40 م', period: 'evening' as const },
      { time: '18:00', label: '06:00 م', period: 'evening' as const },
      { time: '18:20', label: '06:20 م', period: 'evening' as const },
      { time: '18:40', label: '06:40 م', period: 'evening' as const },
      { time: '19:00', label: '07:00 م', period: 'evening' as const },
      { time: '19:20', label: '07:20 م', period: 'evening' as const },
      { time: '19:40', label: '07:40 م', period: 'evening' as const },
      { time: '20:00', label: '08:00 م', period: 'evening' as const }
    ];

    return defaultList.map(s => {
      const isPassed = this.isTimePassed(s.time);
      return {
        ...s,
        isAvailable: !isPassed,
        statusLabel: isPassed ? 'فات وقته' : undefined
      };
    });
  }

  redirectToLogin(): void {
    this.close.emit();
    this.router.navigate(['/auth/login']);
  }

  confirmBooking(): void {
    if (!this.authService.isAuthenticated()) {
      this.redirectToLogin();
      return;
    }

    if (this.isDateInPast) {
      this.errorMessage.set('لا يمكن حجز موعد في تاريخ سابق. يرجى اختيار تاريخ اليوم أو موعد قادم.');
      return;
    }

    if (!this.selectedTime) {
      this.errorMessage.set('يرجى اختيار موعد متاح من القائمة');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const timeFormatted = this.selectedTime.length === 5 ? this.selectedTime + ':00' : this.selectedTime;
    const fee = this.totalFee;
    const isPaid = this.requiresPayment;

    this.appointmentService.bookAppointment({
      doctorId: this.doctor.id,
      type: this.selectedType,
      appointmentDate: this.selectedDate,
      appointmentTime: timeFormatted,
      reason: this.reason || undefined,
      isOnline: this.isOnline,
      consultationFee: fee,
      isPaid: isPaid
    }).subscribe({
      next: (res) => {
        this.loading.set(false);
        const msg = this.isOnline
          ? 'تم سداد الرسوم وحجز الاستشارة المرئية بنجاح! تم إنشاء رابط اللقاء وإرساله لبريدك الإلكتروني.'
          : (isPaid 
              ? 'تم سداد رسوم الكشف بالعيادة إلكترونياً وتأكيد حجزك مسبقاً بنجاح!' 
              : 'تم تأكيد حجز موعدك بنجاح وسجله بملفك الطبي!');
        this.successMessage.set(msg);
        setTimeout(() => {
          this.booked.emit();
          this.close.emit();
          this.router.navigate(['/patient/appointments']);
        }, 1400);
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 401) {
          this.errorMessage.set('انتهت جلسة تسجيل الدخول الخاصة بك. جاري تحويلك لتسجيل الدخول مجدداً...');
          setTimeout(() => {
            this.authService.logout();
          }, 1600);
          return;
        }

        const backendDetail = err.error?.detail || err.error?.title;
        if (err.status === 400 && (backendDetail?.includes('مضى') || backendDetail?.includes('PastAppointment') || backendDetail?.includes('Bad Request'))) {
          this.errorMessage.set('عذراً، هذا التاريخ أو التوقيت قد انقضى بالفعل ولا يمكن حجزه. يرجى اختيار تاريخ قادم.');
          return;
        }

        this.errorMessage.set(backendDetail || 'حدث خطأ أثناء حجز الموعد. يرجى مراجعة البيانات والمحاولة مرة أخرى.');
      }
    });
  }
}
