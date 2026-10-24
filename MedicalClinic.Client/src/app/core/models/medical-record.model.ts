export interface Prescription {
  id?: number;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface MedicalRecord {
  id: number;
  appointmentId: number;
  appointmentDate: string;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  doctorSpecialization: string;
  diagnosis: string;
  symptoms: string;
  treatment: string;
  notes?: string;
  temperature?: number;
  bloodPressure?: string;
  heartRate?: number;
  weight?: number;
  height?: number;
  prescriptions: Prescription[];
  createdAt: string;
  updatedAt?: string;
}
