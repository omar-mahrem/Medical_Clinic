import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div class="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-[#dbe8dd] shadow-xl">
        
        <!-- Header -->
        <div class="text-center">
          <div class="w-14 h-14 rounded-2xl text-white flex items-center justify-center font-extrabold text-2xl mx-auto mb-3 shadow-md bg-gradient-to-br from-emerald-600 to-emerald-800 shadow-emerald-700/20">
            🌿
          </div>
          
          <h2 class="text-2xl font-extrabold text-[#14291c]">
            تسجيل الدخول
          </h2>
          
          <p class="text-xs text-slate-500 mt-1.5 leading-relaxed">
            مرحباً بك في مركز النخبة الطبي. أدخل بيانات حسابك للمتابعة
          </p>
        </div>

        <!-- Form -->
        <form (ngSubmit)="onSubmit()" class="space-y-4">
          
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">البريد الإلكتروني:</label>
            <input 
              type="email" 
              [(ngModel)]="email" 
              name="email"
              dir="ltr"
              placeholder="user@example.com"
              required 
              class="w-full text-xs font-semibold px-3.5 py-3 rounded-xl border border-slate-200 focus:outline-emerald-600 bg-slate-50 focus:bg-white transition-all text-left" />
          </div>

          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="block text-xs font-bold text-slate-700">كلمة المرور:</label>
              <button 
                type="button" 
                (click)="openForgotPassword()" 
                class="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 hover:underline cursor-pointer">
                هل نسيت كلمة السر؟
              </button>
            </div>
            <input 
              type="password" 
              [(ngModel)]="password" 
              name="password"
              dir="ltr"
              placeholder="••••••••"
              required 
              class="w-full text-xs font-semibold px-3.5 py-3 rounded-xl border border-slate-200 focus:outline-emerald-600 bg-slate-50 focus:bg-white transition-all text-left" />
          </div>

          @if (errorMessage()) {
            <div class="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs font-bold text-center leading-relaxed">
              {{ errorMessage() }}
            </div>
          }

          <button 
            type="submit" 
            [disabled]="loading()"
            class="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-700 hover:to-emerald-900 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-700/25 transition-all cursor-pointer">
            @if (loading()) {
              جاري تسجيل الدخول...
            } @else {
              تسجيل الدخول ←
            }
          </button>

          <!-- Footer Links -->
          <div class="text-center pt-2">
            <div>
              <span class="text-xs text-slate-500">ليس لديك حساب مريض؟ </span>
              <a routerLink="/auth/register" class="text-xs font-bold text-emerald-800 hover:underline">إنشاء حساب مريض جديد</a>
            </div>
          </div>

        </form>

      </div>
    </div>

    <!-- Forgot Password Modal -->
    <div 
      *ngIf="showForgotModal()" 
      (click)="closeForgotModal()"
      class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overscroll-contain animate-fadeIn"
    >
      <div 
        (click)="$event.stopPropagation()"
        class="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8 space-y-5"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 font-bold flex items-center justify-center text-lg shadow-inner">
              🔑
            </div>
            <div>
              <h3 class="text-base font-bold text-slate-900">استعادة كلمة المرور</h3>
              <p class="text-[11px] text-slate-500">إعادة تعيين كلمة مرور حسابك بأمان</p>
            </div>
          </div>
          <button (click)="closeForgotModal()" class="text-slate-400 hover:text-slate-600 text-lg font-bold cursor-pointer">✕</button>
        </div>

        <!-- Step 1: Request Code -->
        <div *ngIf="forgotStep() === 1" class="space-y-4">
          <p class="text-xs text-slate-600 leading-relaxed">
            أدخل بريدك الإلكتروني المسجل لدينا، وسنرسل لك رمز تحقق ورابطاً لإعادة تعيين كلمة المرور:
          </p>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">البريد الإلكتروني:</label>
            <input 
              type="email" 
              [(ngModel)]="forgotEmail" 
              name="forgotEmail" 
              dir="ltr"
              placeholder="user@example.com"
              class="w-full text-xs font-semibold px-3.5 py-3 rounded-xl border border-slate-200 focus:outline-emerald-600 bg-slate-50 focus:bg-white text-left" 
            />
          </div>

          <div *ngIf="forgotError()" class="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold leading-relaxed">
            ⚠️ {{ forgotError() }}
          </div>

          <div class="pt-2 flex items-center gap-2">
            <button 
              type="button" 
              (click)="sendForgotCode()" 
              [disabled]="isForgotSubmitting()"
              class="flex-1 py-3 px-4 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer"
            >
              {{ isForgotSubmitting() ? 'جاري الإرسال...' : 'إرسال رمز الاستعادة ←' }}
            </button>
            <button 
              type="button" 
              (click)="forgotStep.set(2)" 
              class="py-3 px-3 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              معي رمز بالفعل
            </button>
          </div>
        </div>

        <!-- Step 2: Reset with Code -->
        <div *ngIf="forgotStep() === 2" class="space-y-4">
          <div class="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-[11px] text-emerald-800 leading-relaxed">
            تم إرسال رمز التحقق إلى بريدك الإلكتروني. يرجى إدخال الرمز وكلمة المرور الجديدة:
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">البريد الإلكتروني:</label>
            <input 
              type="email" 
              [(ngModel)]="forgotEmail" 
              name="forgotEmail2" 
              dir="ltr"
              class="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-left" 
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">رمز التحقق المستلم (Code):</label>
            <input 
              type="text" 
              [(ngModel)]="forgotCode" 
              name="forgotCode" 
              dir="ltr"
              placeholder="أدخل الرمز أو الصقه هنا..."
              class="w-full text-xs font-mono font-bold px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-emerald-600 bg-slate-50 focus:bg-white text-left" 
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">كلمة المرور الجديدة:</label>
            <input 
              type="password" 
              [(ngModel)]="newForgotPass" 
              name="newForgotPass" 
              dir="ltr"
              placeholder="••••••••"
              class="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-emerald-600 bg-slate-50 focus:bg-white text-left" 
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">تأكيد كلمة المرور الجديدة:</label>
            <input 
              type="password" 
              [(ngModel)]="confirmForgotPass" 
              name="confirmForgotPass" 
              dir="ltr"
              placeholder="••••••••"
              class="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-emerald-600 bg-slate-50 focus:bg-white text-left" 
            />
          </div>

          <div *ngIf="forgotError()" class="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold leading-relaxed">
            ⚠️ {{ forgotError() }}
          </div>

          <div *ngIf="forgotSuccess()" class="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold leading-relaxed">
            ✅ {{ forgotSuccess() }}
          </div>

          <div class="pt-2 flex items-center gap-2">
            <button 
              type="button" 
              (click)="submitResetPassword()" 
              [disabled]="isForgotSubmitting()"
              class="flex-1 py-3 px-4 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer"
            >
              {{ isForgotSubmitting() ? 'جاري تعيين كلمة المرور...' : 'تأكيد وحفظ كلمة المرور' }}
            </button>
            <button 
              type="button" 
              (click)="forgotStep.set(1)" 
              class="py-3 px-3 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              رجوع
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  email = '';
  password = '';
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  // Forgot Password signals
  readonly showForgotModal = signal(false);
  readonly forgotStep = signal<1 | 2>(1);
  forgotEmail = '';
  forgotCode = '';
  newForgotPass = '';
  confirmForgotPass = '';
  readonly forgotError = signal<string | null>(null);
  readonly forgotSuccess = signal<string | null>(null);
  readonly isForgotSubmitting = signal(false);

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const email = params['email'];
      const code = params['code'];
      if (email || code) {
        this.forgotEmail = email || '';
        this.forgotCode = code || '';
        this.forgotStep.set(2);
        this.showForgotModal.set(true);
      }
    });
  }

  openForgotPassword(): void {
    this.forgotError.set(null);
    this.forgotSuccess.set(null);
    this.forgotEmail = this.email || '';
    this.forgotCode = '';
    this.newForgotPass = '';
    this.confirmForgotPass = '';
    this.forgotStep.set(1);
    this.showForgotModal.set(true);
  }

  closeForgotModal(): void {
    this.showForgotModal.set(false);
  }

  sendForgotCode(): void {
    if (!this.forgotEmail || !this.forgotEmail.includes('@')) {
      this.forgotError.set('يرجى إدخال بريد إلكتروني صحيح.');
      return;
    }

    this.isForgotSubmitting.set(true);
    this.forgotError.set(null);

    this.authService.forgotPassword(this.forgotEmail).subscribe({
      next: () => {
        this.isForgotSubmitting.set(false);
        this.forgotStep.set(2);
      },
      error: (err) => {
        this.isForgotSubmitting.set(false);
        this.forgotError.set(err.error?.detail || 'تعذر إرسال رمز الاستعادة، يرجى المحاولة لاحقاً.');
      }
    });
  }

  submitResetPassword(): void {
    if (!this.forgotEmail || !this.forgotCode || !this.newForgotPass) {
      this.forgotError.set('يرجى ملء البريد، رمز التحقق، وكلمة المرور الجديدة.');
      return;
    }

    if (this.newForgotPass !== this.confirmForgotPass) {
      this.forgotError.set('كلمتا المرور غير متطابقتين.');
      return;
    }

    if (this.newForgotPass.length < 8) {
      this.forgotError.set('يجب ألا تقل كلمة المرور عن 8 خانات.');
      return;
    }

    this.isForgotSubmitting.set(true);
    this.forgotError.set(null);
    this.forgotSuccess.set(null);

    this.authService.resetPassword({
      email: this.forgotEmail,
      code: this.forgotCode,
      newPassword: this.newForgotPass
    }).subscribe({
      next: () => {
        this.isForgotSubmitting.set(false);
        this.forgotSuccess.set('تمت إعادة تعيين كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول.');
        this.email = this.forgotEmail;
        this.password = '';
        setTimeout(() => {
          this.closeForgotModal();
        }, 2000);
      },
      error: (err) => {
        this.isForgotSubmitting.set(false);
        let msg = 'تعذر إعادة تعيين كلمة المرور، يرجى التحقق من صحة الرمز والبيانات.';
        if (err.error?.detail) {
          msg = err.error.detail;
        } else if (err.error?.errors) {
          const errs: string[] = [];
          for (const k of Object.keys(err.error.errors)) {
            errs.push(...err.error.errors[k]);
          }
          if (errs.length > 0) msg = errs.join(' | ');
        }
        this.forgotError.set(msg);
      }
    });
  }

  onSubmit(): void {
    if (!this.email || !this.password) {
      this.errorMessage.set('يرجى إدخال البريد الإلكتروني وكلمة المرور.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.loading.set(false);
        
        // Smart routing based on actual user roles
        const explicitReturn = this.route.snapshot.queryParams['returnUrl'];
        if (explicitReturn) {
          this.router.navigateByUrl(explicitReturn);
          return;
        }

        if (this.authService.isDoctor()) {
          this.router.navigate(['/doctor/dashboard']);
        } else if (this.authService.isAdmin() || this.authService.isReceptionist()) {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.loading.set(false);
        const errObj = err?.error;
        const errString = JSON.stringify(errObj || '').toLowerCase();

        if (err.status === 401 || err.status === 400) {
          if (errString.includes('emailnotconfirmed') || errString.includes('email is not confirmed')) {
            this.errorMessage.set('يرجى تأكيد البريد الإلكتروني أولاً قبل تسجيل الدخول.');
            return;
          }
          if (errString.includes('lockeduser') || errString.includes('locked')) {
            this.errorMessage.set('الحساب معطل أو مقفل مؤقتاً. يرجى مراجعة إدارة المركز.');
            return;
          }
          if (errString.includes('deleted')) {
            this.errorMessage.set('هذا الحساب تم حذفه مسبقاً.');
            return;
          }
          // Unauthorized / Invalid Credentials
          this.errorMessage.set('البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى التأكد من البيانات والمحاولة مجدداً.');
          return;
        }

        this.errorMessage.set('حدث خطأ غير متوقع أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.');
      }
    });
  }
}
