import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AccountSetupService, SetupValidationResponse } from '../../../core/services/account-setup.service';

@Component({
  selector: 'app-account-setup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div class="w-full max-w-md bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6">
        
        <!-- Brand Logo & Header -->
        <div class="text-center space-y-2">
          <div class="w-14 h-14 bg-emerald-700 text-white rounded-2xl mx-auto flex items-center justify-center shadow-md">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-slate-900">تفعيل حساب الطبيب</h1>
          <p class="text-xs text-slate-500">مرحباً بك في المنظومة الطبية الموحدة. يرجى إعداد كلمة المرور الخاصة بك للبدء.</p>
        </div>

        <!-- Validating Token State -->
        <div *ngIf="isValidating()" class="py-12 text-center text-slate-500">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-emerald-600 border-t-transparent mb-3"></div>
          <p class="text-sm">جاري التحقق من صحة رابط الدعوة...</p>
        </div>

        <!-- Token Invalid Error -->
        <div *ngIf="!isValidating() && validationError()" class="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-center space-y-3">
          <div class="w-12 h-12 bg-rose-100 text-rose-600 rounded-full mx-auto flex items-center justify-center">
            ✕
          </div>
          <h2 class="text-base font-bold text-rose-900">رابط الدعوة غير صالح أو منتهي الصلاحية</h2>
          <p class="text-xs text-rose-700">{{ validationError() }}</p>
          <a routerLink="/auth/login" class="inline-block text-xs font-semibold text-emerald-800 hover:underline pt-2">
            العودة لصفحة تسجيل الدخول
          </a>
        </div>

        <!-- Setup Form -->
        <div *ngIf="!isValidating() && !validationError() && !isComplete()" class="space-y-5">
          <!-- Doctor details badge -->
          <div class="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-100 flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-700 text-white font-bold flex items-center justify-center">
              د
            </div>
            <div>
              <p class="text-sm font-bold text-slate-900">{{ doctorInfo()?.name }}</p>
              <p class="text-xs text-slate-500">{{ doctorInfo()?.email }}</p>
            </div>
          </div>

          <form (ngSubmit)="submitPasswordSetup()" class="space-y-4">
            <div *ngIf="formError()" class="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
              {{ formError() }}
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">كلمة المرور الجديدة</label>
              <input 
                type="password" 
                [(ngModel)]="password" 
                name="password" 
                required
                placeholder="••••••••"
                class="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">تأكيد كلمة المرور</label>
              <input 
                type="password" 
                [(ngModel)]="confirmPassword" 
                name="confirmPassword" 
                required
                placeholder="••••••••"
                class="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <p class="text-xs text-slate-400 leading-relaxed">
              كلمة المرور يجب أن تتضمن أحرف كبيرة وصغيرة، أرقام ورموز خاصة وألا تقل عن 8 خانات.
            </p>

            <button 
              type="submit" 
              [disabled]="isSubmitting()"
              class="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md transition cursor-pointer disabled:opacity-50 mt-2"
            >
              {{ isSubmitting() ? 'جاري تفعيل الحساب...' : 'حفظ كلمة المرور وتفعيل الحساب' }}
            </button>
          </form>
        </div>

        <!-- Success Complete State -->
        <div *ngIf="isComplete()" class="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-4">
          <div class="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-full mx-auto flex items-center justify-center font-bold text-2xl">
            ✓
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">تم تفعيل حسابك بنجاح!</h2>
            <p class="text-xs text-slate-600 mt-1">يمكنك الآن تسجيل الدخول مباشرة والبدء في إدارة الكشوفات الطبية.</p>
          </div>
          <a 
            routerLink="/auth/login" 
            class="inline-block w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-sm transition"
          >
            الانتقال لتسجيل الدخول
          </a>
        </div>

      </div>
    </div>
  `
})
export class AccountSetupComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly accountSetupService = inject(AccountSetupService);

  readonly isValidating = signal<boolean>(true);
  readonly validationError = signal<string | null>(null);
  readonly doctorInfo = signal<SetupValidationResponse | null>(null);

  readonly isSubmitting = signal<boolean>(false);
  readonly isComplete = signal<boolean>(false);
  readonly formError = signal<string | null>(null);

  userId = '';
  token = '';
  password = '';
  confirmPassword = '';

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.userId = params['userId'] || '';
      this.token = params['token'] || '';

      if (!this.userId || !this.token) {
        this.isValidating.set(false);
        this.validationError.set('معلومات التحقق غير مكتملة، يرجى استخدام الرابط المرسل إليك عبر البريد الإلكتروني.');
        return;
      }

      this.validateLink();
    });
  }

  validateLink(): void {
    this.isValidating.set(true);
    this.accountSetupService.validateSetupLink(this.userId, this.token).subscribe({
      next: (res) => {
        this.doctorInfo.set(res);
        this.isValidating.set(false);
      },
      error: (err) => {
        this.isValidating.set(false);
        this.validationError.set(err.error?.detail || err.error?.message || 'الرابط منتهي الصلاحية أو تم استخدامه مسبقاً.');
      }
    });
  }

  submitPasswordSetup(): void {
    if (this.password !== this.confirmPassword) {
      this.formError.set('كلمة المرور وتأكيدها غير متطابقين');
      return;
    }

    if (this.password.length < 8) {
      this.formError.set('كلمة المرور يجب أن تتكون من 8 أحرف على الأقل');
      return;
    }

    this.isSubmitting.set(true);
    this.formError.set(null);

    this.accountSetupService.completeAccountSetup({
      userId: this.userId,
      token: this.token,
      password: this.password
    }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.isComplete.set(true);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.formError.set(err.error?.detail || err.error?.message || 'حدث خطأ أثناء تفعيل الحساب، يرجى المحاولة مرة أخرى');
      }
    });
  }
}
