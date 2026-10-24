import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <footer class="bg-[#14291c] text-white border-t border-emerald-950/40 mt-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          <!-- Col 1: Brand -->
          <div class="md:col-span-1 space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-extrabold text-lg shadow-md">
                🌿
              </div>
              <div>
                <span class="text-lg font-extrabold text-white block leading-tight">مركز النخبة</span>
                <span class="text-xs text-emerald-400 font-semibold block">للرعاية الطبية المتكاملة</span>
              </div>
            </div>
            <p class="text-xs text-slate-300 leading-relaxed">
              منظومة رعاية صحية متطورة تضع راحة المريض في المقام الأول، مبنية على أحدث معايير الطب الوقائي ورقمنة السجلات الدوائية.
            </p>
          </div>

          <!-- Col 2: Quick Links -->
          <div class="space-y-3">
            <h4 class="text-sm font-bold text-emerald-300 uppercase tracking-wider">روابط سريعة</h4>
            <ul class="space-y-2 text-xs text-slate-300 font-medium">
              <li><a routerLink="/" class="hover:text-white transition-colors">الرئيسية</a></li>
              <li><a routerLink="/doctors" class="hover:text-white transition-colors">فريق الأطباء</a></li>
              <li><a routerLink="/" fragment="services" class="hover:text-white transition-colors">الخدمات التخصصية</a></li>
              <li>
                <a [routerLink]="authService.isAuthenticated() ? ((authService.isAdmin() || authService.isReceptionist()) ? '/admin' : (authService.isDoctor() ? '/doctor/dashboard' : '/patient/appointments')) : '/auth/login'" class="hover:text-white transition-colors">
                  {{ authService.isAuthenticated() ? ((authService.isAdmin() || authService.isReceptionist()) ? 'لوحة التحكم' : (authService.isDoctor() ? 'لوحة كشوفات الطبيب' : 'مواعيدي وحجوزاتي')) : 'تسجيل الدخول' }}
                </a>
              </li>
            </ul>
          </div>

          <!-- Col 3: Hours -->
          <div class="space-y-3">
            <h4 class="text-sm font-bold text-emerald-300 uppercase tracking-wider">ساعات العمل</h4>
            <ul class="space-y-2 text-xs text-slate-300">
              <li class="flex justify-between">
                <span>السبت - الخميس:</span>
                <span class="font-bold text-white">09:00 ص - 10:00 م</span>
              </li>
              <li class="flex justify-between">
                <span>الجمعة:</span>
                <span class="font-bold text-emerald-400">استشارات طوارئ</span>
              </li>
              <li class="text-[11px] text-slate-400 pt-1">
                خدمة الحجز الإلكتروني متاحة 24/7
              </li>
            </ul>
          </div>

          <!-- Col 4: Contact -->
          <div class="space-y-3">
            <h4 class="text-sm font-bold text-emerald-300 uppercase tracking-wider">تواصل معنا</h4>
            <ul class="space-y-2 text-xs text-slate-300">
              <li class="flex items-center gap-2">
                <span>📍</span>
                <span>القاهرة، التجمع الخامس، مجمع العيادات الطبي</span>
              </li>
              <li class="flex items-center gap-2">
                <span>📞</span>
                <span dir="ltr">+20 100 234 5678</span>
              </li>
              <li class="flex items-center gap-2">
                <span>✉️</span>
                <span>contact&#64;clinic.com</span>
              </li>
            </ul>
          </div>

        </div>

        <div class="border-t border-emerald-900/60 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 gap-4">
          <p>© 2026 مركز النخبة للرعاية الطبية المتكاملة. جميع الحقوق محفوظة.</p>
          <div class="flex gap-6">
            <span class="text-emerald-400 font-semibold">.NET 10 API • Angular 22 Client</span>
          </div>
        </div>

      </div>
    </footer>
  `
})
export class FooterComponent {
  readonly authService = inject(AuthService);
}
