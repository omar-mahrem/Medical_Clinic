export enum AppointmentType {
  FirstVisit = 1,
  FollowUp = 2,
  Emergency = 3,
  Consultation = 4
}

export enum AppointmentStatus {
  Pending = 1,
  Confirmed = 2,
  InProgress = 3,
  Completed = 4,
  Cancelled = 5,
  NoShow = 6
}

export enum PaymentStatus {
  Unpaid = 1,
  Paid = 2,
  Refunded = 3
}

export interface Appointment {
  id: number;
  patientId: number;
  patientName: string;
  patientPhone?: string;
  doctorId: number;
  doctorName: string;
  doctorSpecialization: string;
  type: AppointmentType;
  appointmentDate: string; // "YYYY-MM-DD"
  appointmentTime: string; // "HH:mm:ss"
  reason?: string;
  status: AppointmentStatus;
  isOnline?: boolean;
  meetingUrl?: string;
  paymentStatus?: PaymentStatus | number | string;
  consultationFee?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateAppointmentRequest {
  doctorId: number;
  type: AppointmentType;
  appointmentDate: string; // "YYYY-MM-DD"
  appointmentTime: string; // "HH:mm"
  reason?: string;
  isOnline?: boolean;
  consultationFee?: number;
  isPaid?: boolean;
  patientId?: number;
}
