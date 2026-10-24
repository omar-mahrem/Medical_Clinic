import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountService, UserProfile, UpdateProfileRequest, ChangePasswordRequest } from '../../../core/services/account.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto space-y-8">
        
        <!-- Header -->
        <div class="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-sm flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-2xl bg-emerald-700 text-white font-bold text-2xl flex items-center justify-center shadow-md">
              {{ initials() }}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h1 class="text-2xl font-bold text-slate-900">
                  {{ firstName }} {{ lastName }}
                </h1>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                  {{ userRoleLabel() }}
                </span>
              </div>
              <p class="text-xs text-slate-500 mt-1">{{ displayEmail }}</p>
            </div>
          </div>
        </div>

        <!-- Notification Messages -->
        <div *ngIf="profileSuccess()" class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium">
          {{ profileSuccess() }}
        </div>
        <div *ngIf="profileError()" class="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium">
          {{ profileError() }}
        </div>
        <div *ngIf="pwdSuccess()" class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium">
          {{ pwdSuccess() }}
        </div>
        <div *ngIf="pwdError()" class="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium">
          {{ pwdError() }}
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <!-- Personal Info Form -->
          <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm flex flex-col">
            <div class="mb-6">
              <h2 class="text-lg font-bold text-slate-900">البيانات الشخصية</h2>
              <p class="text-xs text-slate-500 mt-0.5">تعديل الاسم ورقم الهاتف وتاريخ الميلاد المسجل في النظام</p>
            </div>

            <form (ngSubmit)="updateProfile()" class="space-y-4 flex flex-col flex-1">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">البريد الإلكتروني (غير قابل للتعديل)</label>
                <input 
                  type="email" 
                  [value]="displayEmail" 
                  disabled
                  dir="ltr"
                  class="w-full border border-slate-200 bg-slate-100 rounded-xl px-4 py-2.5 text-sm text-slate-600 font-semibold cursor-not-allowed text-left"
                />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">الاسم الأول</label>
                  <input 
                    type="text" 
                    [(ngModel)]="firstName" 
                    name="firstName" 
                    required
                    class="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">اسم العائلة</label>
                  <input 
                    type="text" 
                    [(ngModel)]="lastName" 
                    name="lastName" 
                    required
                    class="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">الاسم الأوسط (اختياري)</label>
                <input 
                  type="text" 
                  [(ngModel)]="middleName" 
                  name="middleName" 
                  class="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">رقم الهاتف</label>
                <input 
                  type="tel" 
                  [(ngModel)]="phoneNumber" 
                  name="phoneNumber" 
                  dir="ltr"
                  placeholder="01XXXXXXXXX"
                  class="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-left font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">تاريخ الميلاد</label>
                <input 
                  type="date" 
                  [(ngModel)]="dateOfBirth" 
                  name="dateOfBirth" 
                  class="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div class="mt-auto pt-4">
                <button 
                  type="submit" 
                  [disabled]="isUpdatingProfile()"
                  class="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-sm transition cursor-pointer disabled:opacity-50"
                >
                  {{ isUpdatingProfile() ? 'جاري الحفظ...' : 'تحديث البيانات الشخصية' }}
                </button>
              </div>
            </form>
          </div>

          <!-- Change Password Form -->
          <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm flex flex-col">
            <div class="mb-6">
              <h2 class="text-lg font-bold text-slate-900">أمان الحساب وكلمة المرور</h2>
              <p class="text-xs text-slate-500 mt-0.5">تحديث كلمة المرور لحماية حسابك الطبي</p>
            </div>

            <form (ngSubmit)="changePassword()" class="space-y-4 flex flex-col flex-1">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">كلمة المرور الحالية</label>
                <input 
                  type="password" 
                  [(ngModel)]="passwordForm.currentPassword" 
                  name="currentPassword" 
                  required
                  placeholder="••••••••"
                  class="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">كلمة المرور الجديدة</label>
                <input 
                  type="password" 
                  [(ngModel)]="passwordForm.newPassword" 
                  name="newPassword" 
                  required
                  placeholder="••••••••"
                  class="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">تأكيد كلمة المرور الجديدة</label>
                <input 
                  type="password" 
                  [(ngModel)]="confirmPassword" 
                  name="confirmPassword" 
                  required
                  placeholder="••••••••"
                  class="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <p class="text-xs text-slate-400">يجب أن تحتوي على 8 أحرف على الأقل، حروف كبيرة وصغيرة، وأرقام ورموز خاصة.</p>

              <div class="mt-auto pt-4">
                <button 
                  type="submit" 
                  [disabled]="isChangingPwd()"
                  class="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-sm shadow-sm transition cursor-pointer disabled:opacity-50"
                >
                  {{ isChangingPwd() ? 'جاري التغيير...' : 'تغيير كلمة المرور' }}
                </button>
              </div>
            </form>
          </div>

          <!-- Account Session & Logout Card -->
          <div class="md:col-span-2 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 class="text-sm font-bold text-slate-800">جلسة تسجيل الدخول</h3>
              <p class="text-xs text-slate-500 mt-0.5">يمكنك إنهاء الجلسة الحالية وتسجيل الخروج بأمان من هذا الجهاز في أي وقت.</p>
            </div>
            <button 
              type="button"
              (click)="authService.logout()"
              class="px-6 py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
            >
              <span>🚪</span>
              <span>تسجيل الخروج من الحساب</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  private readonly accountService = inject(AccountService);
  readonly authService = inject(AuthService);

  readonly profile = signal<UserProfile | null>(null);
  readonly isUpdatingProfile = signal<boolean>(false);
  readonly isChangingPwd = signal<boolean>(false);

  readonly profileSuccess = signal<string | null>(null);
  readonly profileError = signal<string | null>(null);
  readonly pwdSuccess = signal<string | null>(null);
  readonly pwdError = signal<string | null>(null);

  // Form fields as explicit reactive signals
  firstName = '';
  middleName = '';
  lastName = '';
  phoneNumber = '';
  dateOfBirth = '';

  passwordForm: ChangePasswordRequest = {
    currentPassword: '',
    newPassword: ''
  };

  confirmPassword = '';

  ngOnInit(): void {
    // Initial immediate populate from stored session
    const current = this.authService.currentUser();
    if (current) {
      this.firstName = current.firstName || '';
      this.lastName = current.lastName || '';
    }

    this.loadProfile();
  }

  get displayEmail(): string {
    return this.profile()?.email || this.authService.currentUser()?.email || '';
  }

  loadProfile(): void {
    this.accountService.getProfile().subscribe({
      next: (data) => {
        this.profile.set(data);
        this.firstName = data.firstName || this.firstName;
        this.middleName = data.middleName || '';
        this.lastName = data.lastName || this.lastName;
        this.phoneNumber = data.phoneNumber || '';
        this.dateOfBirth = data.dateOfBirth || '';
      },
      error: () => {
        const local = this.authService.currentUser();
        if (local) {
          this.firstName = local.firstName || '';
          this.lastName = local.lastName || '';
        }
      }
    });
  }

  updateProfile(): void {
    this.isUpdatingProfile.set(true);
    this.profileSuccess.set(null);
    this.profileError.set(null);

    const payload: UpdateProfileRequest = {
      firstName: this.firstName.trim(),
      middleName: this.middleName.trim() || undefined,
      lastName: this.lastName.trim(),
      phoneNumber: this.phoneNumber.trim() || undefined,
      dateOfBirth: this.dateOfBirth || undefined
    };

    this.accountService.updateProfile(payload).subscribe({
      next: () => {
        this.isUpdatingProfile.set(false);
        this.profileSuccess.set('تم تحديث البيانات الشخصية بنجاح!');
        this.loadProfile();
      },
      error: (err) => {
        this.isUpdatingProfile.set(false);
        this.profileError.set(err.error?.detail || err.error?.title || 'حدث خطأ أثناء حفظ التعديلات');
      }
    });
  }

  changePassword(): void {
    if (this.passwordForm.newPassword !== this.confirmPassword) {
      this.pwdError.set('كلمة المرور الجديدة وتأكيدها غير متطابقين');
      return;
    }

    this.isChangingPwd.set(true);
    this.pwdSuccess.set(null);
    this.pwdError.set(null);

    this.accountService.changePassword(this.passwordForm).subscribe({
      next: () => {
        this.isChangingPwd.set(false);
        this.pwdSuccess.set('تم تغيير كلمة المرور بنجاح!');
        this.passwordForm = { currentPassword: '', newPassword: '' };
        this.confirmPassword = '';
      },
      error: (err) => {
        this.isChangingPwd.set(false);
        this.pwdError.set(err.error?.detail || err.error?.message || 'تعذر تغيير كلمة المرور، يرجى التأكد من كلمة المرور الحالية');
      }
    });
  }

  initials(): string {
    const f = this.firstName || this.authService.currentUser()?.firstName || 'م';
    const l = this.lastName || this.authService.currentUser()?.lastName || '';
    return (f.charAt(0) + (l ? '.' + l.charAt(0) : '')).toUpperCase();
  }

  userRoleLabel(): string {
    if (this.authService.isAdmin()) return 'مدير النظام';
    if (this.authService.isDoctor()) return 'طبيب معتمد';
    if (this.authService.isReceptionist()) return 'موظف استقبال';
    return 'مريض';
  }
}
