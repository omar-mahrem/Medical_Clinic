import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-[#dbe8dd] shadow-xl">
        
        <div class="text-center">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white flex items-center justify-center font-extrabold text-2xl mx-auto mb-3 shadow-md shadow-emerald-700/20">
            🌿
          </div>
          <h2 class="text-2xl font-extrabold text-[#14291c]">إنشاء حساب مريض جديد</h2>
          <p class="text-xs text-slate-500 mt-1">سجل بياناتك للبدء في حجز الكشوفات ومتابعة روشتاتك الرقمية</p>
        </div>

        <form (ngSubmit)="onSubmit()" class="space-y-4">
          
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">الاسم الأول (3 أحرف على الأقل):</label>
              <input 
                type="text" 
                [(ngModel)]="firstName" 
                name="firstName"
                required 
                minlength="3"
                placeholder="أحمد"
                class="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-emerald-600 bg-slate-50" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">اسم العائلة (3 أحرف على الأقل):</label>
              <input 
                type="text" 
                [(ngModel)]="lastName" 
                name="lastName"
                required 
                minlength="3"
                placeholder="محمود"
                class="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-emerald-600 bg-slate-50" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">البريد الإلكتروني:</label>
            <input 
              type="email" 
              [(ngModel)]="email" 
              name="email"
              dir="ltr"
              placeholder="patient@example.com"
              required 
              class="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-emerald-600 bg-slate-50 text-left" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">رقم الهاتف:</label>
              <input 
                type="tel" 
                [(ngModel)]="phoneNumber" 
                name="phoneNumber"
                dir="ltr"
                placeholder="01012345678"
                class="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-emerald-600 bg-slate-50 text-left" />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">تاريخ الميلاد:</label>
              <input 
                type="date" 
                [(ngModel)]="dateOfBirth" 
                name="dateOfBirth"
                required
                class="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-emerald-600 bg-slate-50" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1.5">النوع (الجنس):</label>
            <div class="grid grid-cols-2 gap-3">
              <button 
                type="button" 
                (click)="gender = 1" 
                [class.bg-emerald-50]="gender === 1"
                [class.border-emerald-600]="gender === 1"
                [class.text-emerald-900]="gender === 1"
                [class.border-slate-200]="gender !== 1"
                [class.text-slate-600]="gender !== 1"
                class="py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer">
                <span>👨</span>
                <span>ذكر</span>
                @if (gender === 1) {
                  <span class="text-emerald-600 font-extrabold">✓</span>
                }
              </button>

              <button 
                type="button" 
                (click)="gender = 2" 
                [class.bg-emerald-50]="gender === 2"
                [class.border-emerald-600]="gender === 2"
                [class.text-emerald-900]="gender === 2"
                [class.border-slate-200]="gender !== 2"
                [class.text-slate-600]="gender !== 2"
                class="py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer">
                <span>👩</span>
                <span>أنثى</span>
                @if (gender === 2) {
                  <span class="text-emerald-600 font-extrabold">✓</span>
                }
              </button>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">كلمة المرور:</label>
            <input 
              type="password" 
              [(ngModel)]="password" 
              name="password"
              dir="ltr"
              placeholder="••••••••"
              required 
              class="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-emerald-600 bg-slate-50 text-left" />
            
            <!-- Password Guidelines Card -->
            <div class="mt-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
              <span class="font-bold text-slate-700 block mb-0.5">شروط كلمة المرور:</span>
              <div class="flex items-center gap-1.5" [class.text-emerald-700]="password.length >= 8">
                <span>{{ password.length >= 8 ? '✓' : '•' }}</span>
                <span>8 أحرف أو أكثر</span>
              </div>
              <div class="flex items-center gap-1.5" [class.text-emerald-700]="hasUpperAndLower(password)">
                <span>{{ hasUpperAndLower(password) ? '✓' : '•' }}</span>
                <span>حرف كبير (A-Z) وحرف صغير (a-z)</span>
              </div>
              <div class="flex items-center gap-1.5" [class.text-emerald-700]="hasNumberAndSpecial(password)">
                <span>{{ hasNumberAndSpecial(password) ? '✓' : '•' }}</span>
                <span>رقم (0-9) ورمز خاص (مثل @ أو # أو $ أو !)</span>
              </div>
            </div>
          </div>

          @if (errorMessage()) {
            <div class="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs font-bold leading-relaxed">
              {{ errorMessage() }}
            </div>
          }
          @if (successMessage()) {
            <div class="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs font-bold text-center">
              {{ successMessage() }}
            </div>
          }

          <button 
            type="submit" 
            [disabled]="loading()"
            class="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-700 hover:to-emerald-900 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-700/25 transition-all cursor-pointer">
            @if (loading()) {
              جاري إنشاء الحساب...
            } @else {
              تأكيد التسجيل وإنشاء الحساب ←
            }
          </button>

          <div class="text-center pt-2">
            <span class="text-xs text-slate-500">لديك حساب بالفعل؟ </span>
            <a routerLink="/auth/login" class="text-xs font-bold text-emerald-800 hover:underline">تسجيل الدخول</a>
          </div>

        </form>

      </div>
    </div>
  `
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  firstName = '';
  lastName = '';
  email = '';
  phoneNumber = '';
  dateOfBirth = '2000-01-01';
  gender = 1; // 1 = Male (ذكر), 2 = Female (أنثى)
  password = '';

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  hasUpperAndLower(pwd: string): boolean {
    return /[a-z]/.test(pwd) && /[A-Z]/.test(pwd);
  }

  hasNumberAndSpecial(pwd: string): boolean {
    return /[0-9]/.test(pwd) && /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(pwd);
  }

  onSubmit(): void {
    if (!this.firstName || !this.lastName || !this.email || !this.password || !this.dateOfBirth) {
      this.errorMessage.set('يرجى ملء جميع الحقول الإلزامية وتاريخ الميلاد.');
      return;
    }

    if (this.firstName.trim().length < 3 || this.lastName.trim().length < 3) {
      this.errorMessage.set('يجب ألا يقل الاسم الأول واسم العائلة عن 3 أحرف.');
      return;
    }

    if (this.password.length < 8) {
      this.errorMessage.set('كلمة المرور يجب أن تتكون من 8 خانات على الأقل.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.authService.register({
      firstName: this.firstName.trim(),
      lastName: this.lastName.trim(),
      email: this.email.trim(),
      phoneNumber: this.phoneNumber.trim() || '01000000000',
      password: this.password,
      dateOfBirth: this.dateOfBirth,
      gender: this.gender
    }).subscribe({
      next: () => {
        this.successMessage.set('تم إنشاء حساب المريض بنجاح! جاري تسجيل الدخول التلقائي...');
        
        // Auto-login immediately so patient enters directly and guest buttons disappear
        this.authService.login({ email: this.email.trim(), password: this.password }).subscribe({
          next: () => {
            this.loading.set(false);
            this.router.navigate(['/']);
          },
          error: () => {
            this.loading.set(false);
            this.router.navigate(['/auth/login']);
          }
        });
      },
      error: (err) => {
        this.loading.set(false);
        
        // Extract validation errors from ASP.NET ValidationProblemDetails
        if (err.error?.errors && typeof err.error.errors === 'object') {
          const errorsList: string[] = [];
          for (const key of Object.keys(err.error.errors)) {
            const arr = err.error.errors[key];
            if (Array.isArray(arr)) {
              errorsList.push(...arr);
            }
          }
          if (errorsList.length > 0) {
            this.errorMessage.set(errorsList.join(' • '));
            return;
          }
        }

        const msg = err.error?.detail || err.error?.title || err.error?.message;
        if (msg) {
          this.errorMessage.set(msg);
        } else {
          this.errorMessage.set('فشل إنشاء الحساب. تأكد من أن كلمة المرور تحتوي على حرف كبير وصغير ورقم ورمز (مثل: P@ssw0rd2026).');
        }
      }
    });
  }
}
