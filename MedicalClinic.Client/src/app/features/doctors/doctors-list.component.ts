import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Doctor } from '../../core/models/doctor.model';
import { DoctorService } from '../../core/services/doctor.service';
import { DoctorCardComponent } from '../../shared/components/doctor-card/doctor-card.component';
import { BookingModalComponent } from '../../shared/components/booking-modal/booking-modal.component';

@Component({
  selector: 'app-doctors-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, DoctorCardComponent, BookingModalComponent],
  template: `
    <div class="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto space-y-8">
        
        <!-- Header -->
        <div class="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div class="flex items-center gap-2">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                دليل الأطباء والاستشاريين
              </span>
              <span class="text-xs text-slate-400">إجمالي {{ allDoctors().length }} طبيب</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-[#14291c] mt-1.5">
              احجز مع نخبة من كبار الأطباء والخبراء
            </h1>
            <p class="text-sm text-slate-500 mt-1">
              ابحث بالتخصص الطبي أو اسم الطبيب، استعرض التقييمات وسنوات الخبرة، واحجز موعدك فورياً
            </p>
          </div>

          <a 
            routerLink="/"
            class="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 px-4 py-2.5 rounded-xl border border-emerald-200 transition"
          >
            <span>← العودة للرئيسية</span>
          </a>
        </div>

        <!-- Filters & Search Toolbar -->
        <div class="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            
            <!-- Search Input -->
            <div class="md:col-span-5 relative">
              <input 
                type="text" 
                [ngModel]="searchTerm()" 
                (ngModelChange)="searchTerm.set($event); currentPage.set(1)"
                placeholder="البحث بالاسم أو التخصص (مثال: قلب، عظام، د. سارة)..." 
                class="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
              />
            </div>

            <!-- Sort Select -->
            <div class="md:col-span-4">
              <select 
                [ngModel]="sortBy()" 
                (ngModelChange)="sortBy.set($event); currentPage.set(1)"
                class="w-full bg-slate-50 border border-slate-300 rounded-2xl pr-4 pl-10 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition cursor-pointer"
              >
                <option value="featured">الترتيب: الافتراضي والمميز</option>
                <option value="rating">الأعلى تقييماً</option>
                <option value="experience">الأكثر خبرة</option>
                <option value="fee-asc">سعر الكشف: من الأقل للأعلى</option>
                <option value="fee-desc">سعر الكشف: من الأعلى للأقل</option>
              </select>
            </div>

            <!-- Availability Toggle -->
            <div class="md:col-span-3 flex items-center justify-end">
              <label class="flex items-center gap-2.5 cursor-pointer select-none bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200 hover:border-emerald-300 transition">
                <input 
                  type="checkbox" 
                  [ngModel]="onlyAvailable()" 
                  (ngModelChange)="onlyAvailable.set($event); currentPage.set(1)"
                  class="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                />
                <span class="text-xs font-bold text-slate-700">المتاحون للحجز فقط</span>
              </label>
            </div>

          </div>

          <!-- Specialty Filter Badges -->
          <div class="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
            <span class="text-xs font-semibold text-slate-500 ml-2">التخصص:</span>
            <button 
              *ngFor="let spec of specialties()" 
              (click)="selectSpecialty(spec)"
              [class.bg-emerald-800]="selectedSpecialty() === spec"
              [class.text-white]="selectedSpecialty() === spec"
              [class.bg-slate-100]="selectedSpecialty() !== spec"
              [class.text-slate-700]="selectedSpecialty() !== spec"
              class="text-xs font-bold px-3 py-1.5 rounded-xl transition cursor-pointer hover:bg-emerald-700 hover:text-white"
            >
              {{ spec }}
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="isLoading()" class="py-20 text-center">
          <div class="inline-block animate-spin rounded-full h-10 w-10 border-4 border-emerald-600 border-t-transparent mb-4"></div>
          <p class="text-sm text-slate-600 font-medium">جاري استرجاع قائمة الأطباء المعتمدين...</p>
        </div>

        <!-- Empty Results -->
        <div *ngIf="!isLoading() && paginatedDoctors().length === 0" class="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
          <div class="w-16 h-16 mx-auto mb-4 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
            🔍
          </div>
          <h2 class="text-lg font-bold text-slate-800">لم يتم العثور على أطباء مطابقين</h2>
          <p class="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            جرب تغيير كلمات البحث أو إزالة الفلاتر لعرض الأطباء المتاحين في كافة التخصصات
          </p>
          <button 
            (click)="resetFilters()"
            class="mt-4 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
          >
            إعادة تعيين الفلاتر
          </button>
        </div>

        <!-- Doctors Grid -->
        <div *ngIf="!isLoading() && paginatedDoctors().length > 0" class="space-y-8">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <app-doctor-card 
              *ngFor="let doc of paginatedDoctors()" 
              [doctor]="doc" 
              (book)="openBookingModal($event)" 
              (viewDetails)="openDoctorDetails($event)"
            />
          </div>

          <!-- Pagination Bar -->
          <div *ngIf="totalPages() > 1" class="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <span class="text-xs text-slate-500">
              عرض <strong>{{ (currentPage() - 1) * pageSize + 1 }}</strong> إلى <strong>{{ min(currentPage() * pageSize, filteredDoctors().length) }}</strong> من إجمالي <strong>{{ filteredDoctors().length }}</strong> طبيب
            </span>

            <div class="flex items-center gap-1.5">
              <button 
                (click)="setPage(currentPage() - 1)" 
                [disabled]="currentPage() === 1"
                class="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                السابق
              </button>

              <button 
                *ngFor="let p of pageNumbers()"
                (click)="setPage(p)"
                [class.bg-emerald-700]="currentPage() === p"
                [class.text-white]="currentPage() === p"
                [class.border-emerald-700]="currentPage() === p"
                [class.bg-white]="currentPage() !== p"
                [class.text-slate-700]="currentPage() !== p"
                class="w-8 h-8 rounded-lg border text-xs font-bold transition cursor-pointer"
              >
                {{ p }}
              </button>

              <button 
                (click)="setPage(currentPage() + 1)" 
                [disabled]="currentPage() === totalPages()"
                class="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                التالي
              </button>
            </div>
          </div>
        </div>

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

        <!-- Booking Modal Dialog -->
        <app-booking-modal 
          *ngIf="activeModalDoctor()" 
          [doctor]="activeModalDoctor()!" 
          (close)="activeModalDoctor.set(null)"
          (booked)="activeModalDoctor.set(null)" 
        />

      </div>
    </div>
  `
})
export class DoctorsListComponent implements OnInit, OnDestroy {
  private readonly doctorService = inject(DoctorService);

  readonly allDoctors = signal<Doctor[]>([]);
  readonly isLoading = signal(true);
  readonly activeModalDoctor = signal<Doctor | null>(null);
  readonly selectedDoctorDetails = signal<Doctor | null>(null);

  readonly searchTerm = signal('');
  readonly sortBy = signal('featured');
  readonly onlyAvailable = signal(false);
  readonly selectedSpecialty = signal('الكل');

  readonly currentPage = signal(1);
  readonly pageSize = 6;

  ngOnInit(): void {
    this.loadDoctors();
  }

  loadDoctors(): void {
    this.isLoading.set(true);
    this.doctorService.getAllDoctors().subscribe({
      next: (docs) => {
        this.allDoctors.set(docs && docs.length > 0 ? docs : this.getFallbackDoctors());
        this.isLoading.set(false);
      },
      error: () => {
        this.allDoctors.set(this.getFallbackDoctors());
        this.isLoading.set(false);
      }
    });
  }

  readonly specialties = computed(() => {
    const set = new Set<string>();
    set.add('الكل');
    for (const d of this.allDoctors()) {
      if (d.specialization) {
        set.add(d.specialization.trim());
      }
    }
    return Array.from(set);
  });

  selectSpecialty(spec: string): void {
    this.selectedSpecialty.set(spec);
    this.currentPage.set(1);
  }

  readonly filteredDoctors = computed(() => {
    let list = [...this.allDoctors()];
    const term = this.searchTerm().trim().toLowerCase();
    const spec = this.selectedSpecialty();

    if (spec !== 'الكل') {
      list = list.filter(d => d.specialization?.trim() === spec);
    }

    if (this.onlyAvailable()) {
      list = list.filter(d => d.isAvailable);
    }

    if (term) {
      list = list.filter(d => 
        (d.fullName || '').toLowerCase().includes(term) ||
        (d.specialization || '').toLowerCase().includes(term) ||
        (d.qualifications || '').toLowerCase().includes(term)
      );
    }

    // Sorting
    const sort = this.sortBy();
    switch (sort) {
      case 'rating':
        list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'experience':
        list.sort((a, b) => (b.yearsOfExperience || 0) - (a.yearsOfExperience || 0));
        break;
      case 'fee-asc':
        list.sort((a, b) => (a.consultationFee || 0) - (b.consultationFee || 0));
        break;
      case 'fee-desc':
        list.sort((a, b) => (b.consultationFee || 0) - (a.consultationFee || 0));
        break;
    }

    return list;
  });

  readonly totalPages = computed(() => 
    Math.ceil(this.filteredDoctors().length / this.pageSize) || 1
  );

  readonly paginatedDoctors = computed(() => {
    const list = this.filteredDoctors();
    const page = this.currentPage();
    const start = (page - 1) * this.pageSize;
    return list.slice(start, start + this.pageSize);
  });

  readonly pageNumbers = computed(() => {
    const total = this.totalPages();
    const pages = [];
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
    return pages;
  });

  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
    document.body.style.overflow = '';
  }

  resetFilters(): void {
    this.searchTerm.set('');
    this.sortBy.set('featured');
    this.onlyAvailable.set(false);
    this.selectedSpecialty.set('الكل');
    this.currentPage.set(1);
  }

  min(a: number, b: number): number {
    return Math.min(a, b);
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
        specialization: 'استشاري طب الأطفال وحديثي الولادة',
        qualifications: 'استشاري طب الأطفال والمبتسرين - قصر العيني',
        yearsOfExperience: 16,
        isAvailable: true,
        consultationFee: 280,
        rating: 4.92,
        reviewsCount: 142,
        avatarInitial: 'أ'
      },
      {
        id: 5,
        firstName: 'نورهان',
        lastName: 'عبد العزيز',
        fullName: 'د. نورهان عبد العزيز',
        email: 'dr.nourhan@clinic.com',
        phoneNumber: '01055566677',
        specialization: 'استشارية الأمراض الباطنية والسكر',
        qualifications: 'دكتوراه الأمراض الباطنية والغدد الصماء - جامعة الإسكندرية',
        yearsOfExperience: 15,
        isAvailable: true,
        consultationFee: 270,
        rating: 4.9,
        reviewsCount: 110,
        avatarInitial: 'ن'
      },
      {
        id: 6,
        firstName: 'حسام',
        lastName: 'فتحي',
        fullName: 'د. حسام فتحي',
        email: 'dr.hossam@clinic.com',
        phoneNumber: '01066677788',
        specialization: 'استشاري جراحة المخ والأعصاب والعمود الفقري',
        qualifications: 'دكتوراه جراحة المخ والأعصاب - كلية الطب جامعة القاهرة',
        yearsOfExperience: 20,
        isAvailable: true,
        consultationFee: 400,
        rating: 4.97,
        reviewsCount: 185,
        avatarInitial: 'ح'
      }
    ];
  }
}
