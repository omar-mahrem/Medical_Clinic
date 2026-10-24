import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, RouterLink } from '@angular/router';
import { Doctor } from '../../core/models/doctor.model';
import { DoctorService } from '../../core/services/doctor.service';
import { MedicalRecordService } from '../../core/services/medical-record.service';
import { AuthService } from '../../core/services/auth.service';
import { AppointmentService } from '../../core/services/appointment.service';
import { Appointment } from '../../core/models/appointment.model';
import { MedicalRecord } from '../../core/models/medical-record.model';
import { DoctorCardComponent } from '../../shared/components/doctor-card/doctor-card.component';
import { BookingModalComponent } from '../../shared/components/booking-modal/booking-modal.component';
import { ContactService, ContactMessagePayload } from '../../core/services/contact.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, RouterLink, DoctorCardComponent, BookingModalComponent],
  template: `
    <div class="space-y-24">
      
      <!-- ================= 1. HERO SECTION ================= -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-14">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <!-- Hero Text -->
          <div class="lg:col-span-7 space-y-6">
            <span class="inline-flex items-center gap-2.5 bg-emerald-100/90 text-emerald-950 border border-emerald-300 px-4 py-1.5 rounded-full text-xs font-extrabold shadow-2xs">
              <span class="w-2 h-2 rounded-full bg-emerald-600 pulse-live-dot"></span>
              ✨ خدمة جديدة: كشوفات بالعيادة أو استشارات طبية مرئية (عن بُعد) أونلاين 💻
            </span>

            <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#14291c] leading-[1.3] tracking-tight">
              رعايتك الصحية تبدأ بالاستماع الدقيق، 
              <span class="text-emerald-700 block mt-1">بالعيادة أو عبر استشارة فيديو أونلاين</span>
            </h1>

            <p class="text-slate-700 text-sm sm:text-base leading-relaxed max-w-2xl font-medium">
              نظام استشارات سريرية متكامل يجمع بين الفحص الحضوري بالعيادة والاستشارات المرئية المشفرة من منزلك، مع سداد إلكتروني فوري وروشتات رقمية معتمدة بصيغة PDF محفوظة بملفك الطبي فور انتهاء الكشف.
            </p>

            <!-- Hero Action Buttons -->
            <div class="flex flex-wrap items-center gap-4 pt-2">
              <a 
                href="#doctors"
                class="px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-700 hover:to-emerald-900 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-700/25 transition-all flex items-center gap-2 cursor-pointer">
                <span>حجز كشف أو استشارة أونلاين</span>
                <span>←</span>
              </a>
              <a 
                routerLink="/doctors" 
                class="px-6 py-3.5 bg-white text-emerald-800 border-2 border-emerald-200 hover:bg-emerald-50 rounded-xl text-sm font-bold transition-all shadow-xs cursor-pointer">
                استعراض مواعيد الأطباء المتاحة
              </a>
            </div>

            <!-- Features Checklist -->
            <div class="flex flex-wrap items-center gap-4 sm:gap-6 pt-4 text-xs font-bold text-slate-800">
              <div class="flex items-center gap-2">
                <span class="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">✓</span>
                <span>{{ uniqueSpecializationsCount() }} تخصصات طبية شاملة</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">✓</span>
                <span>استشارات فيديو أونلاين مشفرة</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">✓</span>
                <span>دفع إلكتروني (فيزا • محافظ • إنستاباي)</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">✓</span>
                <span>روشتة رقمية PDF فورية</span>
              </div>
            </div>
          </div>

          <!-- Hero Right: Interactive Quick Booking Card with Dynamic Rotating Doctors -->
          <div class="lg:col-span-5" (mouseenter)="pauseHero()" (mouseleave)="resumeHero()">
            <div class="bg-white rounded-3xl p-6 sm:p-7 shadow-2xl shadow-emerald-950/10 relative overflow-hidden transition-all duration-300">
              
              <!-- Clockwise Animated Full-Perimeter Border with Subtle Glow -->
              <svg class="absolute inset-0 w-full h-full pointer-events-none rounded-3xl z-10" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <filter id="subtleGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="0" stdDeviation="2.5" flood-color="#10b981" flood-opacity="0.6" />
                  </filter>
                </defs>
                <!-- Static subtle base border -->
                <rect x="1" y="1" width="calc(100% - 2px)" height="calc(100% - 2px)" rx="24" fill="none" stroke="#e2e8f0" stroke-width="1.5" />
                <!-- Clockwise progressive timer border with subtle glowing halo -->
                <rect 
                  x="1" y="1" width="calc(100% - 2px)" height="calc(100% - 2px)" rx="24" 
                  fill="none" 
                  stroke="#10b981" 
                  stroke-width="2.5" 
                  pathLength="100" 
                  stroke-dasharray="100 100" 
                  [attr.stroke-dashoffset]="100 - carouselProgress()" 
                  stroke-linecap="round" 
                  filter="url(#subtleGlow)"
                  class="transition-all duration-75 ease-linear" />
              </svg>

              <!-- Top Doc Info & Carousel Arrows -->
              <div class="flex items-center justify-between pb-4 border-b border-slate-100 mb-5 relative pt-1">
                @if (currentHeroDoctor(); as doc) {
                  <div 
                    (click)="openDoctorDetails(doc)" 
                    class="flex items-center gap-3 cursor-pointer group select-none"
                    title="انقر لعرض تفاصيل وملف الطبيب">
                    <div class="w-12 h-12 rounded-2xl bg-emerald-100/90 text-emerald-800 border border-emerald-300/80 flex items-center justify-center font-extrabold text-base shadow-2xs group-hover:scale-105 group-hover:border-emerald-500 transition-all">
                      {{ doc.avatarInitial || doc.firstName?.charAt(0) || 'ط' }}
                    </div>
                    <div>
                      <div class="flex items-center gap-2">
                        <h3 class="text-sm font-extrabold text-[#14291c] group-hover:text-emerald-700 transition-all flex items-center gap-1.5">
                          {{ doc.fullName || ('د/ ' + doc.firstName + ' ' + doc.lastName) }}
                          <span class="text-[10px] text-slate-400 group-hover:text-emerald-600 transition font-normal" title="عرض التفاصيل">👁️</span>
                        </h3>
                        <span class="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <span class="w-1.5 h-1.5 rounded-full bg-emerald-600 pulse-live-dot"></span>
                          متاح اليوم
                        </span>
                      </div>
                      <p class="text-xs text-emerald-700 font-semibold line-clamp-1 group-hover:text-emerald-800 transition">
                        {{ doc.specialization }}
                      </p>
                    </div>
                  </div>
                }

                <!-- Carousel Controls -->
                <div class="flex items-center gap-1.5 shrink-0">
                  <button 
                    type="button" 
                    (click)="prevHeroDoctor()" 
                    title="الطبيب السابق"
                    class="w-7 h-7 rounded-lg bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-800 flex items-center justify-center text-xs font-bold transition cursor-pointer">
                    →
                  </button>
                  <button 
                    type="button" 
                    (click)="nextHeroDoctor()" 
                    title="الطبيب التالي"
                    class="w-7 h-7 rounded-lg bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-800 flex items-center justify-center text-xs font-bold transition cursor-pointer">
                    ←
                  </button>
                </div>
              </div>

              <!-- Working Hours & Availability Summary -->
              <div class="space-y-2 mb-5">
                <div class="flex justify-between items-center text-xs font-bold">
                  <span class="text-slate-600">فترات العمل واستقبال الكشوفات:</span>
                  <span class="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100 font-semibold">
                    {{ formattedTodayArabic }}
                  </span>
                </div>
                <div class="bg-slate-50 border border-slate-200/70 rounded-2xl p-3.5 flex items-center justify-between text-xs">
                  <div class="flex items-center gap-2 text-slate-800 font-bold">
                    <span class="text-base">⏰</span>
                    <div>
                      <span>متاح يومياً من 09:00 ص حتى 11:00 م</span>
                      <span class="block text-[11px] text-slate-400 font-normal">جلسات كشف واستشارات كل 20 دقيقة</span>
                    </div>
                  </div>
                  <span class="text-[11px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-1 rounded-lg shrink-0 border border-emerald-200">
                    مواعيد فورية
                  </span>
                </div>
              </div>

              <!-- Consultation Price & Features -->
              <div class="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3.5 mb-5 flex justify-between items-center text-xs">
                <div>
                  <span class="text-slate-500 block text-[11px]">قيمة الكشف والاستشارة:</span>
                  <strong class="text-base font-extrabold text-[#14291c]">
                    {{ currentHeroDoctor()?.consultationFee || 250 }} ج.م
                  </strong>
                </div>
                <div class="text-[11px] font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-md border border-emerald-200 shadow-2xs">
                  يشمل الروشتة الرقمية PDF
                </div>
              </div>

              <!-- Action Button -->
              <button 
                (click)="openHeroBooking()"
                class="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-700 hover:to-emerald-900 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-700/25 transition-all text-center flex items-center justify-center gap-2 cursor-pointer">
                <span>تأكيد حجز الموعد مع {{ currentHeroDoctor()?.firstName ? ('د/ ' + currentHeroDoctor()?.firstName) : 'الطبيب' }}</span>
                <span>←</span>
              </button>

              <!-- Carousel Indicators (Gray dots for inactive, stretched green pill for active) -->
              @if (doctors().length > 1) {
                <div class="flex justify-center items-center gap-2 mt-4">
                  @for (doc of doctors(); track doc.id; let idx = $index) {
                    <button 
                      type="button"
                      (click)="setHeroDoctor(idx)"
                      [title]="doc.fullName || doc.firstName"
                      [class]="isHeroDoctorActive(idx) ? 'w-8 h-2.5 bg-emerald-600 rounded-full shadow-xs cursor-pointer transition-all duration-300' : 'w-2.5 h-2.5 bg-slate-300 hover:bg-slate-400 rounded-full cursor-pointer transition-all duration-300'">
                    </button>
                  }
                </div>
              }

            </div>
          </div>

        </div>
      </section>

      <!-- ================= HOMEPAGE PATIENT APPOINTMENTS PORTAL SECTION (ALWAYS VISIBLE) ================= -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-12 relative z-20">
        @if (upcomingAppointments().length > 0) {
          <!-- State 1: Patient has 1 or more upcoming appointments (sorted chronologically) -->
          <div class="space-y-2.5">
            @if (upcomingAppointments().length > 1) {
              <div class="flex items-center justify-between px-2 text-xs font-bold text-slate-700">
                <span class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                  مواعيدك القادمة ({{ upcomingAppointments().length }} مواعيد مرتبة حسب الأسبقية):
                </span>
                <a routerLink="/patient/appointments" class="text-emerald-700 hover:text-emerald-800 transition font-semibold">
                  عرض كل الحجوزات ←
                </a>
              </div>
            }

            <div [class]="appointmentGridClass()">
              @for (app of upcomingAppointments(); track app.id; let idx = $index) {
                <div class="bg-gradient-to-r from-emerald-950 via-emerald-900 to-[#14291c] text-white rounded-3xl p-5 shadow-xl border border-emerald-600/40 flex flex-col justify-between gap-4 transition-all hover:border-emerald-500/60">
                  <div class="flex items-start gap-3.5">
                    <div class="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-xl shrink-0 mt-0.5">
                      {{ isSessionActive(app) ? '🔴' : (idx === 0 ? '🔔' : '📅') }}
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 mb-1 flex-wrap">
                        @if (isSessionActive(app)) {
                          <span class="text-[11px] font-bold bg-amber-500/40 text-amber-200 px-2.5 py-0.5 rounded-full border border-amber-400/40 inline-flex items-center gap-1.5 shadow-2xs">
                            <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                            الجلسة جارية الآن
                          </span>
                        } @else if (idx === 0) {
                          <span class="text-[11px] font-bold bg-emerald-500/40 text-emerald-200 px-2.5 py-0.5 rounded-full border border-emerald-400/40 shadow-2xs">
                            🔔 أقرب موعد قادم
                          </span>
                        } @else {
                          <span class="text-[11px] font-bold bg-white/10 text-slate-300 px-2.5 py-0.5 rounded-full border border-white/10">
                            📅 موعد لاحق
                          </span>
                        }
                        <span class="text-xs text-slate-300 font-mono">#{{ app.id }}</span>
                      </div>
                      <h4 class="text-sm sm:text-base font-extrabold text-white truncate">
                        كشف مع د/ {{ app.doctorName }}
                      </h4>
                      <p class="text-xs text-emerald-300 font-semibold truncate">
                        {{ app.doctorSpecialization }}
                      </p>
                      <p class="text-xs text-emerald-200/90 mt-1 flex items-center gap-2 flex-wrap">
                        <span>📅 {{ app.appointmentDate }}</span>
                        <span>•</span>
                        <span>⏰ {{ formatTime(app.appointmentTime) }}</span>
                        @if (app.isOnline) {
                          <span>•</span>
                          <span class="text-teal-300 font-bold inline-flex items-center gap-1">💻 استشارة فيديو</span>
                        }
                      </p>
                    </div>
                  </div>

                  <div class="flex items-center gap-2 pt-2 border-t border-white/10">
                    @if (app.isOnline && app.meetingUrl) {
                      <a 
                        [href]="app.meetingUrl" 
                        target="_blank"
                        class="flex-1 py-2 px-3 bg-teal-500 hover:bg-teal-600 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer">
                        <span>🎥</span>
                        <span>دخول الاستشارة</span>
                      </a>
                    }
                    <button 
                      type="button"
                      (click)="openAppointmentDetails(app)"
                      class="flex-1 py-2 px-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition text-center cursor-pointer">
                      عرض تفاصيل الحجز 🔍
                    </button>
                  </div>
                </div>
              }
            </div>
          </div>
        } @else if (authService.isAuthenticated()) {
          <!-- State 2: Patient logged in, but has no upcoming appointments -->
          <div class="bg-gradient-to-r from-emerald-950 via-emerald-900 to-[#14291c] text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-emerald-600/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-2xl shrink-0">
                📅
              </div>
              <div>
                <h4 class="text-base font-extrabold text-white">
                  مرحباً {{ authService.currentUser()?.firstName }}، لا توجد مواعيد كشف قادمة مجدولة
                </h4>
                <p class="text-xs text-emerald-200/90 mt-0.5">
                  يمكنك حجز موعد كشف جديد مع كبار الاستشاريين أو تصفح روشتاتك وتقاريرك السابقة.
                </p>
              </div>
            </div>

            <div class="flex items-center gap-2.5 w-full md:w-auto">
              <a 
                routerLink="/" 
                fragment="doctors" 
                class="flex-1 md:flex-initial px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-950/20 transition text-center cursor-pointer">
                + حجز موعد كشف جديد
              </a>
              <a 
                routerLink="/patient/appointments"
                class="flex-1 md:flex-initial px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition text-center cursor-pointer">
                سجلاتي السابقة 📄
              </a>
            </div>
          </div>
        } @else {
          <!-- State 3: Visitor is not logged in -->
          <div class="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-[#dbe8dd] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center text-2xl shrink-0">
                🏥
              </div>
              <div>
                <h4 class="text-base font-extrabold text-[#14291c]">
                  بوابة متابعة الحجوزات والملفات الطبية
                </h4>
                <p class="text-xs text-slate-500 mt-0.5">
                  سجل دخولك الآن للوصول إلى مواعيدك القادمة، الانضمام للاستشارات المرئية، وتحميل الروشتات الرقمية.
                </p>
              </div>
            </div>

            <div class="flex items-center gap-2.5 w-full md:w-auto">
              <a 
                routerLink="/login" 
                class="flex-1 md:flex-initial px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition text-center cursor-pointer">
                تسجيل الدخول للملف الطبي 🔑
              </a>
              <a 
                routerLink="/register"
                class="flex-1 md:flex-initial px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition text-center cursor-pointer">
                حساب جديد
              </a>
            </div>
          </div>
        }
      </section>

      <!-- ================= 2. SERVICES SECTION ================= -->
      <section id="services" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div class="text-center max-w-2xl mx-auto mb-12">
          <span class="text-xs font-bold text-emerald-800 bg-emerald-100/70 border border-emerald-200 px-3 py-1 rounded-full inline-block mb-3">
            خدماتنا الطبية المتكاملة
          </span>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-[#14291c]">حلول سريرية حديثة بمعايير رعاية متقدمة</h2>
          <p class="text-xs text-slate-700 mt-2 font-medium">نقدم باقة شاملة من الرعاية الصحية الوقائية والتشخيصية لضمان سلامتك وسلامة عائلتك</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Card 1: In-Clinic Consultations -->
          <div class="bg-white rounded-3xl border border-[#dbe8dd] p-7 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all space-y-4">
            <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-2xl">
              🩺
            </div>
            <h3 class="text-lg font-bold text-[#14291c]">الاستشارات السريرية المتخصصة</h3>
            <p class="text-xs text-slate-600 leading-relaxed font-normal">
              كشوفات معمقة بالعيادة مع استشاريين في أمراض القلب، الباطنة، العظام، الأطفال والجلدية مع تشخيص دقيق وفحص سريري شامل.
            </p>
          </div>

          <!-- Card 2: Online Video Consultation (In the Middle) -->
          <div class="bg-gradient-to-b from-white to-teal-50/60 rounded-3xl border-2 border-teal-300 p-7 shadow-xs hover:border-teal-400 hover:shadow-md transition-all space-y-4 relative">
            <span class="absolute top-4 left-4 bg-teal-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
              خدمة مميزة 💻
            </span>
            <div class="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-2xl">
              💻
            </div>
            <h3 class="text-lg font-bold text-[#14291c]">الاستشارات الطبية المرئية (عن بُعد)</h3>
            <p class="text-xs text-slate-600 leading-relaxed font-normal">
              استشارة فيديو مباشرة ومشفرة مع نخبة من الاستشاريين أينما كنت دون مغادرة منزلك، مع سداد فوري واستلام الروشتة بملفك الطبي.
            </p>
          </div>

          <!-- Card 3: Digital Prescription PDF -->
          <div class="bg-white rounded-3xl border border-[#dbe8dd] p-7 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all space-y-4">
            <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-2xl">
              📄
            </div>
            <h3 class="text-lg font-bold text-[#14291c]">الروشتة الرقمية المعتمدة PDF</h3>
            <p class="text-xs text-slate-600 leading-relaxed font-normal">
              توثيق فوري لكافة الأدوية، الجرعات، ومواعيد الاستخدام في ملف رقمي رسمي مشفر ومحفوظ بملفك الطبي قابل للتحميل والطباعة فورياً.
            </p>
          </div>
        </div>
      </section>

      <!-- ================= 3. HOW IT WORKS ================= -->
      <section id="how-it-works" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div class="text-center max-w-2xl mx-auto mb-12">
          <span class="text-xs font-bold text-emerald-800 bg-emerald-100/70 border border-emerald-200 px-3 py-1 rounded-full inline-block mb-3">
            تجربة علاجية سلسة
          </span>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-[#14291c]">كيف تسير رحلتك الصحية في 3 خطوات بسيطة؟</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div class="bg-white rounded-2xl border border-[#dbe8dd] p-7 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all text-center space-y-3 cursor-default">
            <div class="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 font-extrabold text-lg flex items-center justify-center mx-auto">
              1
            </div>
            <h3 class="text-base font-extrabold text-[#14291c]">اختيار الطبيب والميعاد</h3>
            <p class="text-xs text-slate-600 leading-relaxed">
              اختر الطبيب المناسب وموعد الكشف (حضوري بالعيادة أو مكالمة فيديو أونلاين) من بين الفترات المتاحة فورياً.
            </p>
          </div>

          <div class="bg-white rounded-2xl border border-[#dbe8dd] p-7 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all text-center space-y-3 cursor-default">
            <div class="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 font-extrabold text-lg flex items-center justify-center mx-auto">
              2
            </div>
            <h3 class="text-base font-extrabold text-[#14291c]">الفحص والاستشارة الطبية</h3>
            <p class="text-xs text-slate-600 leading-relaxed">
              استشارة متأنية مع الطبيب في الموعد المحدد مع استلام رسائل وتنبيهات ورابط اللقاء المرئي عبر البريد الإلكتروني.
            </p>
          </div>

          <div class="bg-white rounded-2xl border border-[#dbe8dd] p-7 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all text-center space-y-3 cursor-default">
            <div class="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 font-extrabold text-lg flex items-center justify-center mx-auto">
              3
            </div>
            <h3 class="text-base font-extrabold text-[#14291c]">روشتتك بملفك الرقمي</h3>
            <p class="text-xs text-slate-600 leading-relaxed">
              تحميل الروشتة الطبية الرسمية بصيغة PDF المشفرة من حسابك فور انتهاء الكشف لمتابعة العلاج بسهولة.
            </p>
          </div>

        </div>
      </section>

      <!-- ================= 4. DOCTORS DIRECTORY (FEATURED) ================= -->
      <section id="doctors" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        
        <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
          <div>
            <span class="text-xs font-bold text-emerald-800 uppercase tracking-wider block mb-1">فريق الأطباء الاستشاريين</span>
            <h2 class="text-2xl sm:text-3xl font-extrabold text-[#14291c]">نخبة من كبار الأطباء المتاحين للحجز الفوري</h2>
          </div>

          <a 
            routerLink="/doctors" 
            class="text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-4 py-2.5 rounded-xl transition flex items-center gap-1.5"
          >
            <span>عرض دليل الأطباء بالكامل ({{ doctors().length }})</span>
            <span>←</span>
          </a>
        </div>

        <!-- Featured Doctors Grid (Top 3) -->
        @if (loadingDoctors()) {
          <div class="text-center py-16 text-slate-500 text-sm font-semibold">
            جاري تحميل قائمة الأطباء المتاحين...
          </div>
        } @else {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (doc of featuredDoctors(); track doc.id) {
              <app-doctor-card 
                [doctor]="doc" 
                (book)="openBookingModal($event)" 
                (viewDetails)="openDoctorDetails($event)" />
            }
          </div>

          <!-- Bottom Button to view all doctors with pagination -->
          <div class="mt-8 text-center">
            <a 
              routerLink="/doctors"
              class="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-700 hover:to-emerald-900 text-white font-bold text-sm rounded-2xl shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
            >
              <span>استعراض كافة الأطباء والبحث المتقدم (مع الفلاتر والترقيم)</span>
              <span>←</span>
            </a>
          </div>
        }

      </section>

      <!-- ================= 5. DIGITAL PRESCRIPTION & PDF PREVIEW ================= -->
      <section id="prescription-preview" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div class="bg-gradient-to-br from-emerald-900 to-[#14291c] text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div class="lg:col-span-7 space-y-4">
              <span *ngIf="latestPatientRecord()" class="text-xs font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 px-3 py-1 rounded-full inline-block">
                روشتتك الطبية الأخيرة جاهزة
              </span>
              <span *ngIf="!latestPatientRecord()" class="text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3 py-1 rounded-full inline-block">
                ميزة تقنية مدعومة بـ QuestPDF
              </span>

              <h2 *ngIf="latestPatientRecord()" class="text-2xl sm:text-3xl font-extrabold leading-tight">
                آخر روشتة طبية صادرة لك من المركز
              </h2>
              <h2 *ngIf="!latestPatientRecord()" class="text-2xl sm:text-3xl font-extrabold leading-tight">
                روشتة طبية رقمية معتمدة، محفوظة بملفك وقابلة للتحميل في أي وقت
              </h2>

              <p *ngIf="latestPatientRecord()" class="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                تم توثيق كشفك الأخير لدى <strong>{{ latestPatientRecord()?.doctorName }}</strong> ({{ latestPatientRecord()?.doctorSpecialization }}) بتاريخ <strong>{{ latestPatientRecord()?.appointmentDate }}</strong>، ويمكنك تحميل الروشتة الرسمية بصيغة PDF فوراً.
              </p>
              <p *ngIf="!latestPatientRecord()" class="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                يقوم الطبيب بإصدار الروشتة إلكترونياً عند إنهاء الكشف، متضمنة العلامات الحيوية والتشخيص وجرعات الدواء، وتُنشأ بصيغة PDF فورية معتمدة يمكنك تحميلها أو طباعتها بنقرة واحدة.
              </p>

              <div class="pt-2 flex flex-wrap items-center gap-3">
                <button 
                  *ngIf="latestPatientRecord()"
                  type="button"
                  (click)="downloadMyLatestPrescription()" 
                  [disabled]="isDownloadingPatientPdf()"
                  class="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer">
                  <span>📄</span>
                  <span>{{ isDownloadingPatientPdf() ? 'جاري تحميل روشتتك...' : 'تحميل روشتتك الطبية الأخيرة (PDF)' }}</span>
                </button>

                <a 
                  *ngIf="latestPatientRecord()"
                  routerLink="/patient/records"
                  class="px-5 py-2.5 bg-white/15 hover:bg-white/25 border border-white/20 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer">
                  <span>📋 عرض كافة روشتاتي بالملف الطبي</span>
                  <span>←</span>
                </a>

                <button 
                  *ngIf="!latestPatientRecord()"
                  type="button"
                  (click)="testPrescriptionDownload()" 
                  [disabled]="downloadingPdf()"
                  class="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer">
                  <span>📄</span>
                  <span>{{ downloadingPdf() ? 'جاري إنشاء وتحميل الملف...' : 'تحميل نموذج روشتة تجريبية (PDF حي)' }}</span>
                </button>
              </div>
            </div>

            <!-- Right side card -->
            <div class="lg:col-span-5">
              <!-- If logged in patient has latest record -->
              <div *ngIf="latestPatientRecord()" class="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 space-y-4 text-xs">
                <div class="flex justify-between items-center border-b border-white/10 pb-3">
                  <div>
                    <span class="font-bold text-emerald-300 block">روشتة: {{ latestPatientRecord()?.patientName }}</span>
                    <span class="text-[11px] text-slate-300">د/ {{ latestPatientRecord()?.doctorName }} • {{ latestPatientRecord()?.doctorSpecialization }}</span>
                  </div>
                  <span class="bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded text-[10px]">مكتمل ومعتمد</span>
                </div>
                <div>
                  <div class="text-[11px] text-slate-300">التشخيص الطبي المسجل:</div>
                  <div class="font-bold text-white text-sm mt-0.5">{{ latestPatientRecord()?.diagnosis }}</div>
                </div>
                <div *ngIf="latestPatientRecord()?.prescriptions?.length" class="space-y-1.5 text-slate-200">
                  <div *ngFor="let p of latestPatientRecord()?.prescriptions?.slice(0, 3)" class="flex justify-between">
                    <span>{{ p.medicationName }}</span>
                    <span class="text-emerald-300 font-semibold">{{ p.frequency }} • {{ p.duration }} أيام</span>
                  </div>
                </div>
                <div class="text-[11px] text-emerald-200 pt-2 border-t border-white/10 flex justify-between items-center">
                  <span>✓ موثق برقم كشف #{{ latestPatientRecord()?.appointmentId }}</span>
                  <span>📅 {{ latestPatientRecord()?.appointmentDate }}</span>
                </div>
              </div>

              <!-- Default static preview for visitors -->
              <div *ngIf="!latestPatientRecord()" class="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 space-y-4 text-xs">
                <div class="flex justify-between items-center border-b border-white/10 pb-3">
                  <span class="font-bold text-emerald-300">نموذج الروشتة الصادرة</span>
                  <span class="bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded text-[10px]">مكتمل ومعتمد</span>
                </div>
                <div>
                  <div class="text-[11px] text-slate-300">التشخيص الطبي:</div>
                  <div class="font-bold text-white text-sm mt-0.5">التهاب حاد في الجيوب الأنفية مع إجهاد عام</div>
                </div>
                <div class="space-y-1.5 text-slate-200">
                  <div class="flex justify-between">
                    <span>1. Augmentin 1g</span>
                    <span class="text-emerald-300 font-semibold">كل 12 ساعة • 7 أيام</span>
                  </div>
                  <div class="flex justify-between">
                    <span>2. Panadol Extra</span>
                    <span class="text-emerald-300 font-semibold">كل 8 ساعات عند اللزوم</span>
                  </div>
                  <div class="flex justify-between">
                    <span>3. Otrivin Nasal Spray</span>
                    <span class="text-emerald-300 font-semibold">بخة مرتين يومياً</span>
                  </div>
                </div>
                <div class="text-[11px] text-emerald-200 pt-2 border-t border-white/10">
                  ✓ مشفر ومسجل في قاعدة بيانات السجلات الطبية
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <!-- ================= 6. TRUST METRICS ================= -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div class="bg-white rounded-2xl border border-[#dbe8dd] p-8 shadow-xs grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div class="text-3xl font-extrabold text-emerald-800">100%</div>
            <div class="text-xs text-slate-700 mt-1 font-bold">التزام بالمواعيد المحددة</div>
          </div>
          <div>
            <div class="text-3xl font-extrabold text-emerald-800">{{ uniqueSpecializationsCount() }} تخصصات</div>
            <div class="text-xs text-slate-700 mt-1 font-bold">{{ totalDoctorsCount() }} استشاريين معتمدين دولياً</div>
          </div>
          <div>
            <div class="text-3xl font-extrabold text-emerald-800">فوري ⚡</div>
            <div class="text-xs text-slate-700 mt-1 font-bold">دفع إلكتروني (فيزا • محافظ • إنستاباي)</div>
          </div>
          <div>
            <div class="text-3xl font-extrabold text-emerald-800">24/7 💻</div>
            <div class="text-xs text-slate-700 mt-1 font-bold">استشارات أونلاين وروشتة PDF</div>
          </div>
        </div>
      </section>

      <!-- ================= 7. CONTACT & INQUIRIES SECTION ================= -->
      <section id="contact" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 scroll-mt-24">
        <div class="bg-gradient-to-br from-white to-emerald-50/50 rounded-3xl border border-emerald-200/80 p-8 sm:p-12 shadow-sm">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div class="lg:col-span-5 space-y-4">
              <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <span>✉️</span>
                <span>تواصل واستفسار</span>
              </span>
              <h2 class="text-2xl sm:text-3xl font-extrabold text-[#14291c] leading-tight">
                هل لديك استفسار للإدارة أو طاقم الاستقبال؟
              </h2>
              <p class="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                نسعد دائماً بالإجابة على استفساراتكم الطبية، تنسيق المواعيد الخاصة، ومتابعة مقترحاتكم لتقديم أفضل رعاية سريرية ممكنة.
              </p>

              <div class="space-y-3 pt-2 text-xs text-slate-700 font-semibold">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">📍</div>
                  <span>المركز الطبي الرئيسي: التجمع الخامس، القاهرة الجديدة</span>
                </div>
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">⏰</div>
                  <span>الاستقبال وخدمة العملاء: يومياً من 09:00 ص إلى 11:00 م</span>
                </div>
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">📞</div>
                  <span dir="ltr">01000000000 / 0220000000</span>
                </div>
              </div>
            </div>

            <div class="lg:col-span-7">
              <form (ngSubmit)="sendLandingContactMessage()" class="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">الاسم بالكامل *</label>
                    <input 
                      type="text" 
                      [(ngModel)]="contactForm.fullName" 
                      name="contactFullName" 
                      required 
                      placeholder="أحمد محمد"
                      class="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none" 
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">البريد الإلكتروني *</label>
                    <input 
                      type="email" 
                      [(ngModel)]="contactForm.email" 
                      name="contactEmail" 
                      required 
                      placeholder="example@mail.com"
                      class="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none" 
                    />
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">رقم الهاتف للتواصل</label>
                    <input 
                      type="tel" 
                      [(ngModel)]="contactForm.phoneNumber" 
                      name="contactPhone" 
                      placeholder="01XXXXXXXXX"
                      class="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none" 
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">القسم المعني *</label>
                    <select 
                      [(ngModel)]="contactForm.department" 
                      name="contactDept" 
                      class="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white cursor-pointer font-medium">
                      <option value="الاستقبال والمواعيد">📋 الاستقبال وتنسيق المواعيد</option>
                      <option value="الإدارة والشكاوى">🏢 الإدارة الطبية والشكاوى</option>
                      <option value="المعاملات المالية">💳 المعاملات المالية والاسترداد</option>
                      <option value="الدعم الفني">💻 الدعم الفني للمنصة</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">موضوع الاستفسار *</label>
                  <input 
                    type="text" 
                    [(ngModel)]="contactForm.subject" 
                    name="contactSubject" 
                    required 
                    placeholder="مثال: استفسار حول مواعيد دكتور العظام"
                    class="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none" 
                  />
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">نص الرسالة والاستفسار *</label>
                  <textarea 
                    [(ngModel)]="contactForm.message" 
                    name="contactMessage" 
                    required 
                    rows="3" 
                    placeholder="اكتب استفسارك أو رسالتك هنا بالتفصيل..."
                    class="w-full border border-slate-300 rounded-xl p-3 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"></textarea>
                </div>

                @if (contactSuccess()) {
                  <div class="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                    ✅ {{ contactSuccess() }}
                  </div>
                }

                @if (contactError()) {
                  <div class="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
                    ⚠️ {{ contactError() }}
                  </div>
                }

                <button 
                  type="submit" 
                  [disabled]="isSendingContact()"
                  class="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-700 hover:to-emerald-900 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer">
                  {{ isSendingContact() ? 'جاري إرسال الرسالة...' : 'إرسال الرسالة للإدارة والاستقبال ←' }}
                </button>
              </form>
            </div>

          </div>
        </div>
      </section>

      <!-- Booking Modal Dialog -->
      @if (activeModalDoctor()) {
        <app-booking-modal 
          [doctor]="activeModalDoctor()!" 
          (close)="activeModalDoctor.set(null)"
          (booked)="onAppointmentBooked()" />
      }

      <!-- Doctor Details Modal Dialog -->
      @if (selectedDoctorDetails(); as doc) {
        <div 
          (click)="closeDoctorDetails()"
          class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overscroll-contain animate-fadeIn">
          <div 
            (click)="$event.stopPropagation()"
            class="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-hidden flex flex-col overscroll-contain">
            <div class="p-6 sm:p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1 overscroll-contain relative">
            
            <button 
              type="button"
              (click)="closeDoctorDetails()"
              class="absolute top-5 left-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold flex items-center justify-center transition cursor-pointer">
              ✕
            </button>

            <!-- Top Profile Info -->
            <div class="flex items-center gap-4 border-b border-slate-100 pb-5">
              <div class="w-18 h-18 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white font-extrabold text-3xl flex items-center justify-center shadow-lg shadow-emerald-700/20">
                {{ doc.avatarInitial || '🩺' }}
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-xl font-extrabold text-slate-900">د/ {{ doc.fullName || (doc.firstName + ' ' + doc.lastName) }}</h3>
                  <span class="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">طبيب معتمد ✓</span>
                </div>
                <p class="text-sm font-semibold text-emerald-700 mt-0.5">{{ doc.specialization }}</p>
                <div class="flex items-center gap-1 text-xs text-amber-600 font-bold mt-1">
                  <span>★ {{ doc.rating || 4.9 }}</span>
                  <span class="text-slate-400 font-normal">({{ doc.reviewsCount || 110 }} تقييم موثق من المرضى)</span>
                </div>
              </div>
            </div>

            <!-- Qualifications & Credentials Grid -->
            <div class="grid grid-cols-2 gap-3 text-xs">
              <div class="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                <span class="block text-slate-400 font-semibold mb-1">الدرجة والمؤهل العلمي:</span>
                <strong class="text-slate-800 block">{{ doc.qualifications || 'استشاري معتمد لدى كبرى المنظومات الطبية' }}</strong>
              </div>
              <div class="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                <span class="block text-slate-400 font-semibold mb-1">سنوات الخبرة الإكلينيكية:</span>
                <strong class="text-slate-800 block">{{ doc.yearsOfExperience || 10 }} سنوات خبرة متخصصة</strong>
              </div>
              <div class="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                <span class="block text-slate-400 font-semibold mb-1">رقم الترخيص الطبي:</span>
                <strong class="text-slate-800 block font-mono">{{ doc.licenseNumber || 'DOC-LIC-770' }}</strong>
              </div>
              <div class="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                <span class="block text-slate-400 font-semibold mb-1">قيمة الكشف والاستشارة:</span>
                <strong class="text-emerald-800 block text-sm font-extrabold">{{ doc.consultationFee || 250 }} ج.م</strong>
              </div>
            </div>

            <!-- Bio / Overview -->
            <div class="bg-emerald-50/60 border border-emerald-200/70 rounded-2xl p-4 text-xs leading-relaxed text-slate-700 space-y-1">
              <span class="font-bold text-emerald-950 block">نبذة عن العيادة والفحص:</span>
              <p>
                يقدم الطبيب استشارات تشخيصية وعلاجية شاملة بأحدث البروتوكولات السريرية، مع المتابعة الدورية للعلامات الحيوية وإصدار الروشتات الرقمية المعتمدة بصيغة PDF فور انتهاء الجلسة.
              </p>
            </div>

            <!-- Action Buttons -->
            <div class="pt-2 flex gap-3">
              <button 
                type="button"
                (click)="activeModalDoctor.set(doc); closeDoctorDetails()"
                class="flex-1 py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-700 hover:to-emerald-900 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-700/25 transition-all text-center cursor-pointer">
                حجز موعد كشف الآن مع الطبيب ←
              </button>
              <button 
                type="button"
                (click)="closeDoctorDetails()"
                class="px-5 py-3.5 border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-sm rounded-xl transition cursor-pointer">
                إغلاق
              </button>
            </div>

            </div>
          </div>
        </div>
      }

      <!-- Appointment Details Modal (Direct inspection from Home Page) -->
      @if (selectedAppointmentDetails(); as app) {
        <div 
          (click)="closeAppointmentDetails()"
          class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overscroll-contain animate-fadeIn">
          <div 
            (click)="$event.stopPropagation()"
            class="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-hidden flex flex-col overscroll-contain">
            
            <!-- Modal Header -->
            <div class="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-xl font-bold">
                  {{ app.isOnline ? '💻' : '🏥' }}
                </div>
                <div>
                  <h3 class="text-base font-extrabold text-slate-900">تفاصيل موعد الكشف</h3>
                  <span class="text-xs text-slate-500 font-mono">رقم الحجز: #{{ app.id }}</span>
                </div>
              </div>
              <button 
                type="button" 
                (click)="closeAppointmentDetails()"
                class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold flex items-center justify-center transition cursor-pointer">
                ✕
              </button>
            </div>

            <!-- Modal Body -->
            <div class="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1 text-xs">
              
              <!-- Doctor Info -->
              <div class="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 flex items-center gap-3.5">
                <div class="w-12 h-12 rounded-2xl bg-emerald-700 text-white font-extrabold text-base flex items-center justify-center shadow-xs">
                  {{ app.doctorName?.charAt(0) || 'ط' }}
                </div>
                <div>
                  <h4 class="text-sm font-extrabold text-slate-900">كشف مع د/ {{ app.doctorName }}</h4>
                  <p class="text-xs text-emerald-800 font-semibold mt-0.5">{{ app.doctorSpecialization }}</p>
                </div>
              </div>

              <!-- Details Grid -->
              <div class="grid grid-cols-2 gap-3">
                <div class="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                  <span class="block text-slate-400 font-semibold mb-1">تاريخ الموعد:</span>
                  <strong class="text-slate-800 block text-xs">📅 {{ app.appointmentDate }}</strong>
                </div>
                <div class="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                  <span class="block text-slate-400 font-semibold mb-1">توقيت الكشف:</span>
                  <strong class="text-slate-800 block text-xs">⏰ {{ formatTime(app.appointmentTime) }}</strong>
                </div>
                <div class="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                  <span class="block text-slate-400 font-semibold mb-1">نوع الكشف:</span>
                  <strong class="text-slate-800 block text-xs">
                    {{ app.isOnline ? '💻 استشارة فيديو أونلاين' : '🏥 كشف بالعيادة' }}
                  </strong>
                </div>
                <div class="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                  <span class="block text-slate-400 font-semibold mb-1">حالة الحجز:</span>
                  <span [class]="isConfirmed(app.status) ? 'inline-block px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800' : 'inline-block px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800'">
                    {{ isConfirmed(app.status) ? 'مؤكد ✓' : 'قيد الانتظار' }}
                  </span>
                </div>
              </div>

              <!-- Notes / Reason -->
              @if (app.reason) {
                <div class="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                  <span class="block text-slate-400 font-semibold mb-1">ملاحظات وشكوى المريض:</span>
                  <p class="text-slate-700 leading-relaxed break-words whitespace-pre-wrap">{{ app.reason }}</p>
                </div>
              }

              <!-- Meeting Button if Online -->
              @if (app.isOnline && app.meetingUrl) {
                <div class="bg-teal-50 border border-teal-200 rounded-2xl p-3.5 flex items-center justify-between">
                  <div>
                    <span class="font-bold text-teal-950 block">غرفة الاستشارة المرئية جاهزة:</span>
                    <span class="text-[11px] text-teal-700">يمكنك الدخول مباشرة والتحدث مع الطبيب</span>
                  </div>
                  <a 
                    [href]="app.meetingUrl" 
                    target="_blank"
                    class="py-2 px-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer">
                    <span>🎥</span>
                    <span>دخول الاستشارة</span>
                  </a>
                </div>
              }

            </div>

            <!-- Modal Footer Actions -->
            <div class="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/60 flex items-center gap-3">
              <a 
                routerLink="/patient/appointments"
                (click)="closeAppointmentDetails()"
                class="flex-1 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition text-center cursor-pointer">
                إدارة كامل الحجوزات وإلغاء/تعديل الموعد ←
              </a>
              <button 
                type="button" 
                (click)="closeAppointmentDetails()"
                class="px-5 py-3 border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer">
                إغلاق
              </button>
            </div>

          </div>
        </div>
      }

    </div>
  `
})
export class LandingComponent implements OnInit, OnDestroy {
  private readonly doctorService = inject(DoctorService);
  private readonly medicalRecordService = inject(MedicalRecordService);
  readonly authService = inject(AuthService);
  private readonly appointmentService = inject(AppointmentService);
  private readonly contactService = inject(ContactService);

  readonly contactForm: ContactMessagePayload = {
    fullName: '',
    email: '',
    phoneNumber: '',
    department: 'الاستقبال والمواعيد',
    subject: '',
    message: ''
  };
  readonly isSendingContact = signal(false);
  readonly contactSuccess = signal<string | null>(null);
  readonly contactError = signal<string | null>(null);

  readonly heroSlots = ['09:30 ص', '11:00 ص', '12:30 م', '04:00 م', '05:30 م', '07:00 م'];
  readonly selectedHeroSlot = signal('09:30 ص');

  readonly doctors = signal<Doctor[]>([]);
  readonly loadingDoctors = signal(true);
  readonly activeModalDoctor = signal<Doctor | null>(null);
  readonly selectedDoctorDetails = signal<Doctor | null>(null);
  readonly downloadingPdf = signal(false);
  readonly latestPatientRecord = signal<MedicalRecord | null>(null);
  readonly isDownloadingPatientPdf = signal(false);

  // Rotating Hero Doctor & Clock Timer Progress
  readonly currentHeroDoctorIndex = signal(0);
  readonly carouselProgress = signal(0);
  readonly currentHeroDoctor = computed(() => {
    const list = this.doctors();
    if (!list.length) return null;
    return list[this.currentHeroDoctorIndex() % list.length];
  });

  private heroInterval: any;
  private isHeroPaused = false;

  // Active upcoming appointments for logged-in patient (sorted chronologically, up to 3)
  readonly upcomingAppointments = signal<Appointment[]>([]);
  readonly upcomingAppointment = computed(() => this.upcomingAppointments()[0] || null);
  readonly selectedAppointmentDetails = signal<Appointment | null>(null);

  readonly appointmentGridClass = computed(() => {
    const len = this.upcomingAppointments().length;
    if (len <= 1) return 'grid grid-cols-1';
    if (len === 2) return 'grid grid-cols-1 md:grid-cols-2 gap-4';
    return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4';
  });

  readonly featuredDoctors = computed(() => {
    return this.doctors().slice(0, 3);
  });

  readonly uniqueSpecializationsCount = computed(() => {
    const list = this.doctors();
    if (!list.length) return 5;
    const set = new Set(list.map(d => d.specialization?.trim().toLowerCase()).filter(Boolean));
    return set.size || 5;
  });

  readonly totalDoctorsCount = computed(() => {
    return this.doctors().length || 4;
  });

  get formattedTodayArabic(): string {
    const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    const now = new Date();
    return `${days[now.getDay()]} ${now.getDate()} ${months[now.getMonth()]}`;
  }

  ngOnInit(): void {
    this.loadDoctors();
    this.loadUpcomingAppointment();
    this.loadLatestPatientRecord();
    this.startHeroCarousel();
  }

  startHeroCarousel(): void {
    if (this.heroInterval) clearInterval(this.heroInterval);
    const duration = 6000;
    const interval = 50;
    this.heroInterval = setInterval(() => {
      if (!this.isHeroPaused) {
        const next = this.carouselProgress() + (interval / duration) * 100;
        if (next >= 100) {
          this.carouselProgress.set(0);
          this.nextHeroDoctor();
        } else {
          this.carouselProgress.set(next);
        }
      }
    }, interval);
  }

  pauseHero(): void {
    this.isHeroPaused = true;
  }

  resumeHero(): void {
    this.isHeroPaused = false;
  }

  nextHeroDoctor(): void {
    const list = this.doctors();
    if (list.length > 0) {
      this.carouselProgress.set(0);
      this.currentHeroDoctorIndex.update(i => (i + 1) % list.length);
    }
  }

  prevHeroDoctor(): void {
    const list = this.doctors();
    if (list.length > 0) {
      this.carouselProgress.set(0);
      this.currentHeroDoctorIndex.update(i => (i - 1 + list.length) % list.length);
    }
  }

  setHeroDoctor(idx: number): void {
    this.carouselProgress.set(0);
    this.currentHeroDoctorIndex.set(idx);
  }

  isHeroDoctorActive(idx: number): boolean {
    const list = this.doctors();
    if (!list.length) return false;
    return (this.currentHeroDoctorIndex() % list.length) === idx;
  }

  loadDoctors(): void {
    this.loadingDoctors.set(true);
    this.doctorService.getAvailableDoctors().subscribe({
      next: (docs) => {
        this.doctors.set(docs.length > 0 ? docs : this.getFallbackDoctors());
        this.loadingDoctors.set(false);
      },
      error: () => {
        this.doctors.set(this.getFallbackDoctors());
        this.loadingDoctors.set(false);
      }
    });
  }

  parseAppDateTime(dateStr: string, timeStr?: string): Date {
    if (!dateStr) return new Date(0);
    const dateParts = dateStr.split('T')[0].split('-');
    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1;
    const day = parseInt(dateParts[2], 10);
    let hours = 23;
    let minutes = 59;
    if (timeStr) {
      const timeParts = timeStr.split(':');
      hours = parseInt(timeParts[0], 10) || 0;
      minutes = parseInt(timeParts[1], 10) || 0;
    }
    return new Date(year, month, day, hours, minutes, 0, 0);
  }

  isSessionActive(app: Appointment): boolean {
    const now = new Date();
    const appDateTime = this.parseAppDateTime(app.appointmentDate, app.appointmentTime);
    const diff = now.getTime() - appDateTime.getTime();
    return diff >= 0 && diff <= 20 * 60 * 1000;
  }

  loadUpcomingAppointment(): void {
    if (this.authService.isAuthenticated()) {
      this.appointmentService.getMyAppointments().subscribe({
        next: (apps) => {
          const now = new Date();
          // 20 minutes grace period matching standard consultation duration
          const threshold = new Date(now.getTime() - 20 * 60 * 1000);

          const upcoming = apps
            .filter(a => {
              const s = String(a.status).toLowerCase();
              if (s !== 'pending' && s !== 'confirmed' && s !== '1' && s !== '2') return false;
              if (!a.appointmentDate) return false;
              const appDateTime = this.parseAppDateTime(a.appointmentDate, a.appointmentTime);
              return appDateTime >= threshold;
            })
            .sort((a, b) => {
              const dateA = this.parseAppDateTime(a.appointmentDate, a.appointmentTime).getTime();
              const dateB = this.parseAppDateTime(b.appointmentDate, b.appointmentTime).getTime();
              return dateA - dateB;
            });

          this.upcomingAppointments.set(upcoming.slice(0, 3));
        },
        error: () => this.upcomingAppointments.set([])
      });
    } else {
      this.upcomingAppointments.set([]);
    }
  }

  openAppointmentDetails(app: Appointment): void {
    document.body.style.overflow = 'hidden';
    this.selectedAppointmentDetails.set(app);
  }

  closeAppointmentDetails(): void {
    document.body.style.overflow = '';
    this.selectedAppointmentDetails.set(null);
  }

  isConfirmed(status: any): boolean {
    const s = String(status).toLowerCase();
    return s === 'confirmed' || s === '2';
  }

  formatTime(time: string | undefined): string {
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

  openHeroBooking(): void {
    const doc = this.currentHeroDoctor() || this.doctors()[0];
    if (doc) {
      this.activeModalDoctor.set(doc);
    }
  }

  openBookingModal(doc: Doctor): void {
    this.activeModalDoctor.set(doc);
  }

  openDoctorDetails(doc: Doctor): void {
    document.body.style.overflow = 'hidden';
    this.selectedDoctorDetails.set(doc);
  }

  closeDoctorDetails(): void {
    document.body.style.overflow = '';
    this.selectedDoctorDetails.set(null);
  }

  ngOnDestroy(): void {
    if (this.heroInterval) {
      clearInterval(this.heroInterval);
    }
    document.body.style.overflow = '';
  }

  onAppointmentBooked(): void {
    this.activeModalDoctor.set(null);
  }

  testPrescriptionDownload(): void {
    this.downloadingPdf.set(true);
    const user = this.authService.currentUser();
    const patientName = user ? `${user.firstName} ${user.lastName}`.trim() : undefined;
    this.medicalRecordService.downloadSamplePrescriptionPdf(patientName).subscribe({
      next: () => this.downloadingPdf.set(false),
      error: () => {
        this.downloadingPdf.set(false);
        // Fallback to downloading record 1
        this.medicalRecordService.downloadPrescriptionPdf(1).subscribe({
          next: () => {},
          error: (err) => alert(err.error?.detail || 'تعذر تحميل نموذج الروشتة حالياً')
        });
      }
    });
  }

  loadLatestPatientRecord(): void {
    if (!this.authService.isPatient()) return;
    this.appointmentService.getMyAppointments().subscribe({
      next: (apps) => {
        if (!apps || apps.length === 0) return;
        const patientId = apps[0]?.patientId;
        if (!patientId) return;
        this.medicalRecordService.getPatientHistory(patientId).subscribe({
          next: (records) => {
            if (records && records.length > 0) {
              this.latestPatientRecord.set(records[0]);
            }
          },
          error: () => {}
        });
      },
      error: () => {}
    });
  }

  downloadMyLatestPrescription(): void {
    const record = this.latestPatientRecord();
    if (!record) return;
    this.isDownloadingPatientPdf.set(true);
    this.medicalRecordService.downloadPrescriptionPdf(record.id).subscribe({
      next: () => this.isDownloadingPatientPdf.set(false),
      error: (err) => {
        this.isDownloadingPatientPdf.set(false);
        if (err.status === 0 || err.name === 'AbortError' || err.message?.includes('aborted')) {
          return;
        }
        alert('تعذر تحميل الروشتة حالياً، يرجى المحاولة لاحقاً');
      }
    });
  }

  private getFallbackDoctors(): Doctor[] {
    return [
      {
        id: 1,
        firstName: 'سارة',
        lastName: 'محمود',
        fullName: 'د. سارة محمود',
        email: 'dr.sarah@clinic.com',
        phoneNumber: '01011122233',
        specialization: 'استشارية أمراض القلب والأوعية',
        qualifications: 'دكتوراه أمراض القلب - قصر العيني، زميل الجمعية الأوروبية لأمراض القلب',
        yearsOfExperience: 14,
        isAvailable: true,
        consultationFee: 300,
        rating: 4.9,
        reviewsCount: 128,
        avatarInitial: 'س'
      },
      {
        id: 2,
        firstName: 'طارق',
        lastName: 'منصور',
        fullName: 'د. طارق منصور',
        email: 'dr.tarek@clinic.com',
        phoneNumber: '01022233344',
        specialization: 'استشاري جراحة العظام والمفاصل',
        qualifications: 'دكتوراه جراحة العظام والمناظير - جامعة عين شمس',
        yearsOfExperience: 18,
        isAvailable: true,
        consultationFee: 350,
        rating: 4.95,
        reviewsCount: 164,
        avatarInitial: 'ط'
      },
      {
        id: 3,
        firstName: 'مريم',
        lastName: 'إبراهيم',
        fullName: 'د. مريم إبراهيم',
        email: 'dr.mariam@clinic.com',
        phoneNumber: '01033344455',
        specialization: 'استشارية الأمراض الجلدية والليزر',
        qualifications: 'ماجستير الأمراض الجلدية والتجميل - جامعة القاهرة',
        yearsOfExperience: 11,
        isAvailable: true,
        consultationFee: 250,
        rating: 4.88,
        reviewsCount: 95,
        avatarInitial: 'م'
      },
      {
        id: 4,
        firstName: 'أحمد',
        lastName: 'الشناوي',
        fullName: 'د. أحمد الشناوي',
        email: 'dr.ahmed@clinic.com',
        phoneNumber: '01044455566',
        specialization: 'استشاري جراحة العظام والمفاصل',
        qualifications: 'استشاري جراحة العظام والعمود الفقري - قصر العيني',
        yearsOfExperience: 13,
        isAvailable: true,
        consultationFee: 350,
        rating: 4.94,
        reviewsCount: 130,
        avatarInitial: 'أ'
      },
      {
        id: 5,
        firstName: 'نورهان',
        lastName: 'عبد العزيز',
        fullName: 'د. نورهان عبد العزيز',
        email: 'dr.nourhan@clinic.com',
        phoneNumber: '01055566677',
        specialization: 'استشارية طب الأطفال وحديثي الولادة',
        qualifications: 'ماجستير طب الأطفال وحديثي الولادة ورعاية المبتسرين - جامعة القاهرة',
        yearsOfExperience: 12,
        isAvailable: true,
        consultationFee: 280,
        rating: 4.91,
        reviewsCount: 115,
        avatarInitial: 'ن'
      },
      {
        id: 6,
        firstName: 'حسام',
        lastName: 'فتحي',
        fullName: 'د. حسام فتحي',
        email: 'dr.hossam@clinic.com',
        phoneNumber: '01066677788',
        specialization: 'استشاري أمراض الباطنة والسكر',
        qualifications: 'استشاري الأمراض الباطنية ومناظير الجهاز الهضمي - جامعة الإسكندرية',
        yearsOfExperience: 15,
        isAvailable: true,
        consultationFee: 320,
        rating: 4.93,
        reviewsCount: 140,
        avatarInitial: 'ح'
      }
    ];
  }

  sendLandingContactMessage(): void {
    if (!this.contactForm.fullName || !this.contactForm.email || !this.contactForm.message) {
      this.contactError.set('يرجى تعبئة كافة الحقول الإلزامية.');
      return;
    }

    this.isSendingContact.set(true);
    this.contactError.set(null);
    this.contactSuccess.set(null);

    this.contactService.sendMessage(this.contactForm).subscribe({
      next: (res) => {
        this.isSendingContact.set(false);
        this.contactSuccess.set(res.message || 'تم إرسال رسالتك واستفسارك بنجاح لطاقم الاستقبال والإدارة.');
        this.contactForm.fullName = '';
        this.contactForm.email = '';
        this.contactForm.phoneNumber = '';
        this.contactForm.subject = '';
        this.contactForm.message = '';
        setTimeout(() => this.contactSuccess.set(null), 6000);
      },
      error: (err) => {
        this.isSendingContact.set(false);
        this.contactError.set(err.error?.detail || err.error?.message || 'تعذر إرسال الرسالة، يرجى المحاولة لاحقاً.');
      }
    });
  }
}
