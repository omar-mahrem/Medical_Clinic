import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="bg-white border-b border-[#dbe8dd] sticky top-0 z-40 shadow-xs">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-20">
          
          <!-- Brand Logo -->
          <a [routerLink]="authService.isDoctor() ? '/doctor/dashboard' : ((authService.isAdmin() || authService.isReceptionist()) ? '/admin' : '/')" class="flex items-center gap-3 group">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white flex items-center justify-center font-extrabold text-xl shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
              🌿
            </div>
            <div>
              <span class="text-xl font-extrabold text-emerald-900 tracking-tight block leading-tight">مركز النخبة</span>
              <span class="text-xs text-emerald-700 font-semibold block">
                {{ authService.isAdmin() ? 'بوابة الإدارة العامة' : (authService.isReceptionist() ? 'بوابة الاستقبال والعيادات' : (authService.isDoctor() ? 'بوابة الطبيب والعيادة التخصصية' : 'للرعاية الطبية والتشخيص الدقيق')) }}
              </span>
            </div>
          </a>

          <!-- Navigation Links Based on Auth State -->
          <div class="hidden lg:flex items-center gap-5 text-xs sm:text-sm font-semibold text-slate-600">
            <!-- Normal navigation for patients and guests only -->
            <ng-container *ngIf="!authService.isAdmin() && !authService.isReceptionist() && !authService.isDoctor()">
              <a routerLink="/" routerLinkActive="text-emerald-700 font-bold" [routerLinkActiveOptions]="{exact: true}" class="hover:text-emerald-700 transition-colors">
                الرئيسية
              </a>
              <a routerLink="/doctors" routerLinkActive="text-emerald-700 font-bold" class="hover:text-emerald-700 transition-colors">
                دليل الأطباء
              </a>
              <a href="#services" (click)="scrollToSection('services', $event)" class="hover:text-emerald-700 transition-colors cursor-pointer">
                الخدمات الطبية
              </a>
            </ng-container>

            <!-- Admin navigation -->
            <ng-container *ngIf="authService.isAuthenticated() && authService.isAdmin()">
              <a routerLink="/admin" routerLinkActive="text-emerald-700 font-bold" class="hover:text-emerald-700 transition-colors flex items-center gap-1.5">
                <span>⚡</span>
                <span>لوحة التحكم المركزية</span>
              </a>
            </ng-container>

            <!-- Receptionist navigation -->
            <ng-container *ngIf="authService.isAuthenticated() && authService.isReceptionist() && !authService.isAdmin()">
              <a routerLink="/admin" routerLinkActive="text-emerald-700 font-bold" class="hover:text-emerald-700 transition-colors flex items-center gap-1.5">
                <span>📋</span>
                <span>إدارة الحجوزات والاستقبال</span>
              </a>
            </ng-container>

            <!-- Patient specific navigation -->
            <ng-container *ngIf="authService.isAuthenticated() && authService.isPatient()">
              <a routerLink="/patient/appointments" routerLinkActive="text-emerald-700 font-bold" class="hover:text-emerald-700 transition-colors flex items-center gap-1">
                <span>📅</span>
                <span>مواعيدي وحجوزاتي</span>
              </a>
              <a routerLink="/patient/records" routerLinkActive="text-emerald-700 font-bold" class="hover:text-emerald-700 transition-colors flex items-center gap-1">
                <span>📄</span>
                <span>سجلاتي والروشتات PDF</span>
              </a>
            </ng-container>

            <!-- Doctor specific navigation -->
            <ng-container *ngIf="authService.isAuthenticated() && authService.isDoctor()">
              <a routerLink="/doctor/dashboard" routerLinkActive="text-emerald-700 font-bold" class="hover:text-emerald-700 transition-colors flex items-center gap-1.5">
                <span>🩺</span>
                <span>لوحة كشوفات الطبيب</span>
              </a>
            </ng-container>

            <!-- Guest extra anchor links -->
            <ng-container *ngIf="!authService.isAuthenticated()">
              <a href="#how-it-works" (click)="scrollToSection('how-it-works', $event)" class="hover:text-emerald-700 transition-colors cursor-pointer">كيف نعمل؟</a>
              <a href="#prescription-preview" (click)="scrollToSection('prescription-preview', $event)" class="hover:text-emerald-700 transition-colors cursor-pointer">الروشتة الرقمية</a>
            </ng-container>
          </div>

          <!-- Auth CTA & User State -->
          <div class="flex items-center gap-3">
            @if (authService.currentUser(); as user) {
              <div class="flex items-center gap-3">
                <a 
                  routerLink="/account/profile" 
                  class="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 transition text-slate-800 hover:text-emerald-900 group cursor-pointer"
                >
                  <div class="w-7 h-7 rounded-lg bg-emerald-700 text-white font-bold text-xs flex items-center justify-center">
                    {{ user.firstName.charAt(0) }}
                  </div>
                  <div class="text-right">
                    <span class="block text-xs font-bold leading-none">{{ user.firstName }}</span>
                    <span class="block text-[10px] text-slate-400 group-hover:text-emerald-700 font-medium leading-tight mt-0.5">الملف الشخصي</span>
                  </div>
                </a>
              </div>
            } @else {
              <a 
                routerLink="/auth/register" 
                class="hidden sm:inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-700 hover:text-emerald-900 bg-slate-50 hover:bg-emerald-50/70 px-3.5 py-2 rounded-xl border border-slate-200 hover:border-emerald-300 transition-all cursor-pointer">
                <span>✨</span>
                <span>حساب جديد</span>
              </a>
              <a 
                routerLink="/auth/login" 
                class="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-700 hover:to-emerald-900 px-4 py-2.5 rounded-xl shadow-md shadow-emerald-700/25 transition-all cursor-pointer">
                <span>🔐</span>
                <span>تسجيل الدخول</span>
              </a>
            }
          </div>

        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  scrollToSection(sectionId: string, event: Event): void {
    event.preventDefault();
    const currentUrl = this.router.url.split('#')[0];
    if (currentUrl !== '/' && currentUrl !== '') {
      this.router.navigate(['/'], { fragment: sectionId }).then(() => {
        setTimeout(() => this.smoothScrollTo(sectionId), 150);
      });
    } else {
      this.smoothScrollTo(sectionId);
    }
  }

  private smoothScrollTo(id: string): void {
    const el = document.getElementById(id);
    if (el) {
      const navOffset = 80; // Exactly matches 80px navbar height
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - navOffset;
      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: 'smooth'
      });
    }
  }
}
