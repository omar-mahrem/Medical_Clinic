import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Appointment, AppointmentStatus } from '../../../core/models/appointment.model';
import { AppointmentService } from '../../../core/services/appointment.service';
import { MedicalRecordService } from '../../../core/services/medical-record.service';
import { AuthService } from '../../../core/services/auth.service';
import { ContactService, ContactMessagePayload } from '../../../core/services/contact.service';

@Component({
  selector: 'app-my-appointments',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <!-- Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#dbe8dd] pb-6">
        <div>
          <span class="text-xs font-bold text-emerald-800 bg-emerald-100/70 border border-emerald-200 px-3 py-1 rounded-full inline-block mb-1.5">
            بوابة المرضى والسجلات
          </span>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-[#14291c]">جدول مواعيدي واستشاراتي الطبية</h1>
          <p class="text-xs text-slate-500 mt-0.5">مرحباً {{ authService.currentUser()?.firstName }}، تابع كشوفاتك المحجوزة والروشتات الصادرة</p>
        </div>

        <div class="flex items-center gap-2.5 flex-wrap">
          <button 
            type="button"
            (click)="openInquiryModal()"
            class="px-4 py-2.5 bg-white text-emerald-800 border-2 border-emerald-300 hover:bg-emerald-50 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer">
            <span>✉️</span>
            <span>تواصل مع الإدارة / الاستقبال</span>
          </button>

          <a 
            routerLink="/" 
            fragment="doctors" 
            class="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-700 hover:to-emerald-900 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-700/20 transition-all flex items-center gap-2">
            <span>+ حجز موعد كشف جديد</span>
          </a>
        </div>
      </div>

      <!-- Banner Feedback Message (if any) -->
      @if (bannerMessage()) {
        <div class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span>✅</span>
            <span>{{ bannerMessage() }}</span>
          </div>
          <button (click)="bannerMessage.set(null)" class="text-emerald-700 hover:text-emerald-900 cursor-pointer font-bold">✕</button>
        </div>
      }

      <!-- Content -->
      @if (loading()) {
        <div class="text-center py-20 text-slate-500 text-sm font-semibold">
          جاري استرجاع مواعيدك وسجلاتك الطبية...
        </div>
      } @else if (appointments().length === 0) {
        <div class="bg-white rounded-3xl border border-[#dbe8dd] p-12 text-center max-w-md mx-auto space-y-4 shadow-xs">
          <div class="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 text-2xl flex items-center justify-center mx-auto">
            📅
          </div>
          <h3 class="text-lg font-extrabold text-[#14291c]">لا توجد مواعيد محجوزة حالياً</h3>
          <p class="text-xs text-slate-500 leading-relaxed">
            يمكنك تصفح كبار الأطباء والاستشاريين وحجز موعد كشف فوري بكل سهولة.
          </p>
          <a 
            routerLink="/" 
            fragment="doctors" 
            class="inline-block py-2.5 px-6 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-all">
            استعراض الأطباء المتاحين ←
          </a>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (app of appointments(); track app.id) {
            <div class="bg-white rounded-2xl border border-[#dbe8dd] p-5 sm:p-6 shadow-xs hover:border-emerald-300 transition-all flex flex-col h-full overflow-hidden">
              
              <!-- Card Top -->
              <div class="space-y-3 mb-3">
                <div class="flex justify-between items-start">
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <span class="text-xs font-bold text-slate-500">
                      رقم الحجز: #{{ app.id }}
                    </span>
                    @if (app.isOnline) {
                      <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-50 border border-teal-200 text-teal-800 inline-flex items-center gap-1">
                        <span>💻</span>
                        <span>استشارة أونلاين</span>
                      </span>
                    } @else {
                      <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-600 inline-flex items-center gap-1">
                        <span>🏥</span>
                        <span>كشف بالعيادة</span>
                      </span>
                    }
                  </div>
                  <span [class]="getStatusClass(app)" class="text-[11px] font-bold px-2.5 py-0.5 rounded-md border">
                    {{ getStatusText(app) }}
                  </span>
                </div>

                <div>
                  <h4 class="text-base font-extrabold text-[#14291c] mb-0.5">د/ {{ app.doctorName }}</h4>
                  <p class="text-xs text-emerald-800 font-semibold">{{ app.doctorSpecialization }}</p>
                </div>
              </div>

              <!-- Gray Details Box: flex-1 expands down to buttons -->
              <div class="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs text-slate-600 flex-1 flex flex-col justify-center space-y-2 mb-3">
                <div class="flex justify-between">
                  <span>التاريخ:</span>
                  <strong class="text-slate-900">{{ app.appointmentDate }}</strong>
                </div>
                <div class="flex justify-between items-center">
                  <span>التوقيت:</span>
                  <strong class="text-slate-900 bg-emerald-50/80 text-emerald-950 px-2 py-0.5 rounded-md font-mono text-xs">{{ formatTime(app.appointmentTime) }}</strong>
                </div>
                @if (app.isOnline) {
                  <div class="flex justify-between text-[11px] text-teal-800 font-semibold pt-1 border-t border-slate-200/60">
                    <span>الخدمة:</span>
                    <span>مكالمة فيديو Jitsi Meet مشفرة</span>
                  </div>
                }
                @if (app.reason) {
                  <div class="pt-1.5 border-t border-slate-200/60 text-[11px] leading-relaxed flex items-center justify-between gap-2">
                    <div class="truncate text-slate-700 min-w-0" [title]="app.reason">
                      <span class="text-slate-400 font-medium">ملاحظات:</span> {{ app.reason }}
                    </div>
                    <button 
                      type="button" 
                      (click)="openViewNotesModal(app)" 
                      class="text-emerald-700 hover:text-emerald-900 font-bold text-[10px] underline whitespace-nowrap cursor-pointer shrink-0">
                      عرض الملاحظة
                    </button>
                  </div>
                }
              </div>

              <!-- Card Actions: Pinned to bottom -->
              <div class="pt-3 border-t border-slate-100 flex flex-col gap-2 mt-auto">
                @if (app.isOnline && app.meetingUrl && !isCancelled(app.status)) {
                  <a 
                    [href]="app.meetingUrl" 
                    target="_blank"
                    class="w-full py-2.5 px-3 bg-gradient-to-r from-teal-600 to-emerald-700 hover:from-teal-700 hover:to-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer">
                    <span>🎥</span>
                    <span>دخول غرفة الاستشارة المرئية (Video Call)</span>
                  </a>
                }

                @if (isCompleted(app.status)) {
                  <button 
                    (click)="downloadPrescription(app.id)"
                    class="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
                    <span>📄</span>
                    <span>تحميل الروشتة الطبية (PDF)</span>
                  </button>
                } @else {
                  <div class="flex items-center justify-between text-[11px] bg-slate-50 border border-slate-200/80 px-3 py-2 rounded-xl text-slate-500">
                    <span class="flex items-center gap-1">
                      <span>⏳</span>
                      <span>الروشتة تصدر فور إتمام الفحص من الطبيب</span>
                    </span>
                    <button 
                      type="button" 
                      (click)="showNoticeModal.set(true)" 
                      class="text-emerald-700 hover:underline font-bold cursor-pointer">
                      ملاحظة
                    </button>
                  </div>
                }

                <!-- Edit Notes / Reason Button (Available before appointment time) -->
                @if (isEditable(app)) {
                  <button 
                    type="button"
                    (click)="openEditReasonModal(app)"
                    class="w-full py-2 px-3 bg-slate-50 hover:bg-emerald-50 text-emerald-800 hover:text-emerald-900 border border-slate-200 hover:border-emerald-200 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5">
                    <span>✏️</span>
                    <span>تعديل الملاحظات / الشكوى المرضية</span>
                  </button>
                }

                @if (isCancellable(app)) {
                  <button 
                    (click)="openCancelModal(app)"
                    class="w-full py-2 px-3 bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 border border-slate-200 hover:border-rose-200 font-bold text-xs rounded-xl transition-colors cursor-pointer">
                    إلغاء هذا الموعد
                  </button>
                }
              </div>

            </div>
          }
        </div>
      }

      <!-- Custom In-App Modal for Viewing Full Notes (Message Style) -->
      @if (viewingNotesApp()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-emerald-100 space-y-4 animate-in fade-in zoom-in duration-150">
            
            <div class="flex items-start justify-between pb-3 border-b border-slate-100">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 text-lg flex items-center justify-center font-bold border border-emerald-100">
                  📝
                </div>
                <div>
                  <h3 class="text-base font-extrabold text-[#14291c]">
                    الملاحظات والشكوى المرضية
                  </h3>
                  <p class="text-[11px] text-slate-500 mt-0.5">
                    حجز رقم #{{ viewingNotesApp()?.id }} مع د/ {{ viewingNotesApp()?.doctorName }} ({{ viewingNotesApp()?.appointmentDate }})
                  </p>
                </div>
              </div>
              <button 
                (click)="closeViewNotesModal()" 
                class="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 cursor-pointer">
                ✕
              </button>
            </div>

            <!-- Notes Content Bubble -->
            <div class="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 max-h-72 overflow-y-auto">
              <p class="text-xs text-slate-800 leading-relaxed break-words break-all [overflow-wrap:anywhere] whitespace-pre-wrap">
                {{ viewingNotesApp()?.reason }}
              </p>
            </div>

            <!-- Footer with actions -->
            <div class="flex items-center justify-between pt-2">
              @if (isEditable(viewingNotesApp()!)) {
                <button 
                  type="button" 
                  (click)="switchToEditModal()"
                  class="text-xs text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1.5 cursor-pointer underline">
                  <span>✏️</span>
                  <span>تعديل هذه الملاحظات</span>
                </button>
              } @else {
                <span class="text-[10px] text-slate-400">
                  (الملاحظات للقراءة فقط)
                </span>
              }

              <button 
                type="button" 
                (click)="closeViewNotesModal()"
                class="py-2 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer">
                إغلاق
              </button>
            </div>

          </div>
        </div>
      }

      <!-- Custom In-App Confirmation Modal for Cancellation -->
      @if (appointmentToCancel()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div class="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-rose-100 text-center space-y-4 animate-in fade-in zoom-in duration-150">
            <div class="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 text-2xl flex items-center justify-center mx-auto border border-rose-100">
              ⚠️
            </div>

            <div class="space-y-1.5">
              <h3 class="text-lg font-black text-slate-900">تأكيد إلغاء الموعد الطبي</h3>
              <p class="text-xs text-slate-500 leading-relaxed">
                هل أنت متأكد من رغبتك في إلغاء حجز موعدك رقم <strong class="text-slate-800">#{{ appointmentToCancel()?.id }}</strong> مع <strong class="text-slate-800">د/ {{ appointmentToCancel()?.doctorName }}</strong> بتاريخ <strong class="text-slate-800">{{ appointmentToCancel()?.appointmentDate }}</strong>؟
              </p>
              <p class="text-[11px] text-rose-600 font-semibold pt-1">
                لن تتمكن من استرجاع هذا الموعد بعد الإلغاء وستحتاج إلى حجز موعد جديد.
              </p>
            </div>

            <div class="flex items-center gap-3 pt-2">
              <button 
                type="button" 
                (click)="confirmCancelAppointment()"
                [disabled]="isCancelling()"
                class="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2">
                @if (isCancelling()) {
                  <span>جاري الإلغاء...</span>
                } @else {
                  <span>تأكيد الإلغاء</span>
                }
              </button>
              <button 
                type="button" 
                (click)="closeCancelModal()"
                [disabled]="isCancelling()"
                class="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer">
                إبقاء الموعد
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Custom In-App Modal for Editing Reason / Notes -->
      @if (editingAppointment()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-emerald-100 space-y-4 animate-in fade-in zoom-in duration-150">
            
            <div class="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 class="text-lg font-black text-[#14291c] flex items-center gap-2">
                  <span>✏️</span>
                  <span>تعديل الملاحظات والشكوى المرضية</span>
                </h3>
                <p class="text-xs text-slate-500 mt-1">
                  موعد كشف مع د/ {{ editingAppointment()?.doctorName }} ({{ editingAppointment()?.appointmentDate }})
                </p>
              </div>
              <button 
                (click)="closeEditReasonModal()" 
                class="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 cursor-pointer">
                ✕
              </button>
            </div>

            <div class="space-y-2">
              <label class="block text-xs font-bold text-slate-700">
                الملاحظات أو الأعراض الطبية للزيارة:
              </label>
              <textarea 
                [(ngModel)]="editReasonText"
                maxlength="1000"
                rows="5"
                placeholder="صف ما تشعر به أو أي أعراض جديدة ترغب في إطلاع الطبيب عليها قبل موعد الكشف..."
                class="w-full text-xs p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition resize-none leading-relaxed text-slate-800 placeholder:text-slate-400">
              </textarea>
              
              <div class="flex items-center justify-between text-[11px] text-slate-500">
                <span class="text-[10px] text-slate-500">
                  * يُتاح التعديل قبل موعد الكشف لمساعدة الطبيب في دراسة حالتك.
                </span>
                <span 
                  class="font-mono text-xs font-semibold px-2 py-0.5 rounded-md"
                  [class.text-slate-500]="(editReasonText.length || 0) < 900"
                  [class.bg-slate-100]="(editReasonText.length || 0) < 900"
                  [class.text-amber-700]="(editReasonText.length || 0) >= 900 && (editReasonText.length || 0) < 1000"
                  [class.bg-amber-50]="(editReasonText.length || 0) >= 900 && (editReasonText.length || 0) < 1000"
                  [class.text-rose-700]="(editReasonText.length || 0) >= 1000"
                  [class.bg-rose-50]="(editReasonText.length || 0) >= 1000">
                  {{ editReasonText.length || 0 }} / 1000 حرف
                </span>
              </div>
            </div>

            @if (editError()) {
              <div class="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {{ editError() }}
              </div>
            }

            <div class="flex items-center gap-3 pt-3 border-t border-slate-100">
              <button 
                type="button" 
                (click)="saveEditedReason()"
                [disabled]="isSavingReason()"
                class="flex-1 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-300 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2">
                @if (isSavingReason()) {
                  <span>جاري الحفظ...</span>
                } @else {
                  <span>حفظ التعديلات</span>
                }
              </button>
              <button 
                type="button" 
                (click)="closeEditReasonModal()"
                [disabled]="isSavingReason()"
                class="py-2.5 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer">
                إلغاء
              </button>
            </div>

          </div>
        </div>
      }

      <!-- Custom In-App Modal for Prescription Notice -->
      @if (showNoticeModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div class="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-emerald-100 text-center space-y-4 animate-in fade-in zoom-in duration-150">
            <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 text-2xl flex items-center justify-center mx-auto">
              📋
            </div>
            <div>
              <h3 class="text-base font-extrabold text-slate-900">تنويه بخصوص الروشتة الطبية</h3>
              <p class="text-xs text-slate-500 mt-2 leading-relaxed">
                الروشتات الرقمية تُصدر إلكترونياً وتُوثق تلقائياً بملفك الطبي فور انتهاء جلسة الفحص مع الطبيب وتدوين الأدوية والتعليمات.
              </p>
            </div>
            <button 
              type="button" 
              (click)="showNoticeModal.set(false)"
              class="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer">
              فهمت ذلك
            </button>
          </div>
        </div>
      }

      <!-- Patient Inquiry / Contact Modal -->
      @if (showInquiryModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overscroll-contain animate-fadeIn">
          <div class="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-hidden flex flex-col overscroll-contain">
            
            <div class="p-6 border-b border-slate-100 flex items-center justify-between bg-emerald-700 text-white shrink-0">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xl">
                  ✉️
                </div>
                <div>
                  <h3 class="text-base font-extrabold">تواصل مع إدارة المركز والاستقبال</h3>
                  <p class="text-xs text-emerald-100 mt-0.5">أرسل استفسارك وسيقوم الطاقم المختص بالرد عليك ومتابعتك فوراً</p>
                </div>
              </div>
              <button 
                type="button" 
                (click)="closeInquiryModal()"
                class="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white font-bold flex items-center justify-center transition cursor-pointer">
                ✕
              </button>
            </div>

            <form (ngSubmit)="submitInquiry()" class="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">القسم المعني بالاستفسار *</label>
                <select 
                  [(ngModel)]="inquiryForm.department" 
                  name="inquiryDept" 
                  class="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white cursor-pointer font-medium">
                  <option value="الاستقبال وتنسيق المواعيد">📋 الاستقبال وتنسيق المواعيد</option>
                  <option value="الإدارة الطبية والشكاوى">🏢 الإدارة الطبية والشكاوى</option>
                  <option value="المعاملات المالية والاسترداد">💳 المعاملات المالية وفواتير الكشف</option>
                  <option value="الدعم الفني">💻 الدعم الفني للموقع</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">موضوع الاستفسار *</label>
                <input 
                  type="text" 
                  [(ngModel)]="inquiryForm.subject" 
                  name="inquirySubject" 
                  required 
                  placeholder="مثال: استفسار عن تحويل الموعد أو تعديل الملاحظات" 
                  class="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none" 
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">رقم الهاتف للتواصل والمتابعة (اختياري)</label>
                <input 
                  type="tel" 
                  [(ngModel)]="inquiryForm.phoneNumber" 
                  name="inquiryPhone" 
                  placeholder="01XXXXXXXXX" 
                  class="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none" 
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">تفاصيل الرسالة أو الاستفسار *</label>
                <textarea 
                  [(ngModel)]="inquiryForm.message" 
                  name="inquiryMessage" 
                  required 
                  rows="4" 
                  placeholder="اكتب رسالتك واستفسارك بالتفصيل..." 
                  class="w-full border border-slate-300 rounded-xl p-3 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"></textarea>
              </div>

              @if (inquiryError()) {
                <div class="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
                  ⚠️ {{ inquiryError() }}
                </div>
              }

              <div class="flex items-center gap-3 pt-3 border-t border-slate-100">
                <button 
                  type="submit" 
                  [disabled]="isSendingInquiry()" 
                  class="flex-1 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer">
                  {{ isSendingInquiry() ? 'جاري الإرسال...' : 'إرسال الاستفسار الآن ←' }}
                </button>
                <button 
                  type="button" 
                  (click)="closeInquiryModal()" 
                  class="py-2.5 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer">
                  إلغاء
                </button>
              </div>
            </form>

          </div>
        </div>
      }

    </div>
  `
})
export class MyAppointmentsComponent implements OnInit {
  private readonly appointmentService = inject(AppointmentService);
  private readonly medicalRecordService = inject(MedicalRecordService);
  private readonly contactService = inject(ContactService);
  readonly authService = inject(AuthService);

  readonly appointments = signal<Appointment[]>([]);
  readonly loading = signal(true);
  readonly bannerMessage = signal<string | null>(null);

  // Cancellation Modal State
  readonly appointmentToCancel = signal<Appointment | null>(null);
  readonly isCancelling = signal(false);

  // View Full Notes Modal State (Message Style)
  readonly viewingNotesApp = signal<Appointment | null>(null);

  // Edit Reason Modal State
  readonly editingAppointment = signal<Appointment | null>(null);
  editReasonText = '';
  readonly isSavingReason = signal(false);
  readonly editError = signal<string | null>(null);

  // Notice Modal
  readonly showNoticeModal = signal(false);

  // Contact / Inquiry Modal State
  readonly showInquiryModal = signal(false);
  readonly isSendingInquiry = signal(false);
  readonly inquiryError = signal<string | null>(null);
  readonly inquiryForm: ContactMessagePayload = {
    fullName: '',
    email: '',
    phoneNumber: '',
    department: 'الاستقبال وتنسيق المواعيد',
    subject: '',
    message: ''
  };

  openInquiryModal(): void {
    const user = this.authService.currentUser();
    this.inquiryForm.fullName = user ? `${user.firstName} ${user.lastName}`.trim() : '';
    this.inquiryForm.email = user?.email || '';
    this.inquiryForm.phoneNumber = '';
    this.inquiryForm.subject = '';
    this.inquiryForm.message = '';
    this.inquiryError.set(null);
    this.showInquiryModal.set(true);
  }

  closeInquiryModal(): void {
    if (!this.isSendingInquiry()) {
      this.showInquiryModal.set(false);
      this.inquiryError.set(null);
    }
  }

  submitInquiry(): void {
    if (!this.inquiryForm.subject.trim() || !this.inquiryForm.message.trim()) {
      this.inquiryError.set('يرجى كتابة موضوع ورسالة الاستفسار.');
      return;
    }

    const user = this.authService.currentUser();
    if (!this.inquiryForm.email) {
      this.inquiryForm.email = user?.email || 'patient@clinic.com';
    }
    if (!this.inquiryForm.fullName) {
      this.inquiryForm.fullName = user ? `${user.firstName} ${user.lastName}`.trim() : 'مريض';
    }

    this.isSendingInquiry.set(true);
    this.inquiryError.set(null);

    this.contactService.sendMessage(this.inquiryForm).subscribe({
      next: (res) => {
        this.isSendingInquiry.set(false);
        this.showInquiryModal.set(false);
        this.bannerMessage.set(res.message || 'تم إرسال استفسارك بنجاح للإدارة والاستقبال، سنتواصل معك قريباً.');
      },
      error: (err) => {
        this.isSendingInquiry.set(false);
        this.inquiryError.set(err.error?.detail || err.error?.message || 'تعذر إرسال الاستفسار، يرجى المحاولة لاحقاً.');
      }
    });
  }

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.loading.set(true);
    this.appointmentService.getMyAppointments().subscribe({
      next: (data) => {
        // Order by latest booking first (newest reservation on top)
        const sorted = [...data].sort((a, b) => {
          if (b.createdAt && a.createdAt) {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }
          return b.id - a.id;
        });
        this.appointments.set(sorted);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  // --- View Notes Modal ---
  openViewNotesModal(app: Appointment): void {
    this.viewingNotesApp.set(app);
  }

  closeViewNotesModal(): void {
    this.viewingNotesApp.set(null);
  }

  switchToEditModal(): void {
    const app = this.viewingNotesApp();
    if (app && this.isEditable(app)) {
      this.closeViewNotesModal();
      this.openEditReasonModal(app);
    }
  }

  // --- Cancellation ---
  openCancelModal(app: Appointment): void {
    this.appointmentToCancel.set(app);
  }

  closeCancelModal(): void {
    if (!this.isCancelling()) {
      this.appointmentToCancel.set(null);
    }
  }

  confirmCancelAppointment(): void {
    const app = this.appointmentToCancel();
    if (!app) return;

    this.isCancelling.set(true);
    this.appointmentService.cancelAppointment(app.id).subscribe({
      next: () => {
        this.isCancelling.set(false);
        this.appointmentToCancel.set(null);
        this.bannerMessage.set(`تم إلغاء الموعد رقم #${app.id} بنجاح.`);
        this.loadAppointments();
      },
      error: (err) => {
        this.isCancelling.set(false);
        alert(err.error?.detail || err.error?.message || 'فشل إلغاء الموعد.');
      }
    });
  }

  // --- Edit Reason ---
  openEditReasonModal(app: Appointment): void {
    this.editingAppointment.set(app);
    this.editReasonText = app.reason || '';
    this.editError.set(null);
  }

  closeEditReasonModal(): void {
    if (!this.isSavingReason()) {
      this.editingAppointment.set(null);
      this.editReasonText = '';
      this.editError.set(null);
    }
  }

  saveEditedReason(): void {
    const app = this.editingAppointment();
    if (!app) return;

    this.isSavingReason.set(true);
    this.editError.set(null);

    this.appointmentService.updateAppointment(app.id, {
      reason: this.editReasonText.trim()
    }).subscribe({
      next: () => {
        this.isSavingReason.set(false);
        this.editingAppointment.set(null);
        this.bannerMessage.set(`تم تحديث ملاحظات الموعد رقم #${app.id} بنجاح.`);
        this.loadAppointments();
      },
      error: (err) => {
        this.isSavingReason.set(false);
        this.editError.set(err.error?.detail || err.error?.message || 'تعذر تعديل الملاحظات، ربما فات موعد الكشف.');
      }
    });
  }

  downloadPrescription(appointmentId: number): void {
    this.medicalRecordService.downloadPrescriptionByAppointmentPdf(appointmentId).subscribe({
      next: () => {},
      error: (err) => {
        if (err.status === 0 || err.name === 'AbortError' || err.message?.includes('aborted')) {
          return;
        }
        if (err.status === 404) {
          alert('لم يتم إصدار روشتة لهذا الكشف بعد. سيقوم الطبيب بتدوين الفحص وإصدار الروشتة فور انتهاء جلسة الكشف.');
        } else if (err.status && err.status !== 200) {
          alert(err.error?.detail || err.error?.message || 'تعذر تحميل ملف الروشتة حالياً، يرجى المحاولة لاحقاً');
        }
      }
    });
  }

  isCompleted(status: any): boolean {
    const s = String(status).toLowerCase();
    return s === 'completed' || s === '4';
  }

  isMissedOrPast(app: Appointment): boolean {
    const s = String(app.status).toLowerCase();
    if (s === 'completed' || s === '4' || s === 'cancelled' || s === '5' || s === 'noshow' || s === '6') {
      return false;
    }
    if (!app.appointmentDate) return false;
    const now = new Date();
    const appDate = new Date(app.appointmentDate);
    if (app.appointmentTime) {
      const parts = app.appointmentTime.split(':');
      const h = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      appDate.setHours(isNaN(h) ? 0 : h, isNaN(m) ? 0 : m, 0, 0);
    } else {
      appDate.setHours(23, 59, 59, 999);
    }
    return appDate < now;
  }

  isCancellable(app: Appointment): boolean {
    if (this.isMissedOrPast(app)) return false;
    const s = String(app.status).toLowerCase();
    return s === 'pending' || s === 'confirmed' || s === '1' || s === '2';
  }

  isEditable(app: Appointment): boolean {
    if (this.isMissedOrPast(app)) return false;
    const s = String(app.status).toLowerCase();
    return s === 'pending' || s === 'confirmed' || s === '1' || s === '2';
  }

  isCancelled(status: any): boolean {
    const s = String(status).toLowerCase();
    return s === 'cancelled' || s === '5';
  }

  getStatusText(app: Appointment): string {
    const s = String(app.status).toLowerCase();
    if (s === 'cancelled' || s === '5') return 'ملغي';
    if (s === 'completed' || s === '4') return 'مكتمل ومفحوص';
    if (s === 'noshow' || s === '6') return 'لم يحضر';
    if (this.isMissedOrPast(app)) return 'لم يتم الكشف / فات الموعد';
    if (s === 'inprogress' || s === '3') return 'جاري الكشف';
    if (s === 'confirmed' || s === '2') return 'مؤكد ومجدول';
    if (s === 'pending' || s === '1') return 'قيد الانتظار';
    return 'مؤكد ومجدول';
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
    const arabicPeriod = isPm ? 'م' : 'ص';
    return `${hourStr}:${minute} ${arabicPeriod}`;
  }

  getStatusClass(app: Appointment): string {
    const s = String(app.status).toLowerCase();
    if (s === 'cancelled' || s === '5') return 'bg-rose-50 text-rose-800 border-rose-200';
    if (s === 'completed' || s === '4') return 'bg-teal-50 text-teal-800 border-teal-200';
    if (s === 'noshow' || s === '6') return 'bg-orange-50 text-orange-800 border-orange-200';
    if (this.isMissedOrPast(app)) return 'bg-amber-100 text-amber-900 border-amber-300 font-extrabold';
    if (s === 'inprogress' || s === '3') return 'bg-blue-50 text-blue-800 border-blue-200';
    if (s === 'confirmed' || s === '2') return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    return 'bg-emerald-50 text-emerald-800 border-emerald-200';
  }
}
