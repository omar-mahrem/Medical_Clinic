import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Doctor } from '../../../core/models/doctor.model';

@Component({
  selector: 'app-doctor-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      (click)="viewDetails.emit(doctor)"
      class="bg-white rounded-2xl border border-[#dbe8dd] p-6 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between cursor-pointer group relative">
      
      <!-- Card Top: Avatar & Rating -->
      <div>
        <div class="flex items-start justify-between mb-4">
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-200/60 text-emerald-900 border border-emerald-300/80 flex items-center justify-center text-xl font-bold shadow-xs">
            {{ doctor.avatarInitial || '🩺' }}
          </div>
          <span class="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-2xs">
            <span>★</span>
            <span>{{ doctor.rating || 4.9 }}</span>
            <span class="text-amber-600/70 text-[10px]">({{ doctor.reviewsCount || 110 }})</span>
          </span>
        </div>

        <!-- Name & Specialization -->
        <h4 class="text-lg font-extrabold text-[#14291c] mb-1 group-hover:text-emerald-800 transition-colors">
          د/ {{ doctor.fullName || (doctor.firstName + ' ' + doctor.lastName) }}
        </h4>
        <div class="inline-block bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-md mb-3">
          {{ doctor.specialization }}
        </div>

        <p class="text-xs text-slate-600 leading-relaxed mb-4 line-clamp-2">
          {{ doctor.qualifications || 'خبرة سريرية متقدمة • استشاري معتمد لدى كبرى المنظومات الطبية.' }}
        </p>

        <!-- Tap to view bio hint -->
        <span class="text-[11px] text-emerald-700 group-hover:underline font-semibold block mb-2">
          انقر لعرض الملف والشهادات والخبرات ←
        </span>
      </div>

      <!-- Card Bottom: Fee & Action -->
      <div class="border-t border-slate-100 pt-4 mt-2">
        <div class="flex justify-between items-center mb-3">
          <div class="text-xs text-slate-600 font-medium">
            قيمة الكشف: <strong class="text-sm font-extrabold text-slate-900">{{ doctor.consultationFee || 250 }} ج.م</strong>
          </div>
          <span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm">
            متاح للحجز
          </span>
        </div>

        <button 
          type="button"
          (click)="$event.stopPropagation(); book.emit(doctor)"
          class="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-700 hover:to-emerald-900 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer">
          <span>حجز كشف مع الطبيب</span>
          <span>←</span>
        </button>
      </div>

    </div>
  `
})
export class DoctorCardComponent {
  @Input({ required: true }) doctor!: Doctor;
  @Output() book = new EventEmitter<Doctor>();
  @Output() viewDetails = new EventEmitter<Doctor>();
}
