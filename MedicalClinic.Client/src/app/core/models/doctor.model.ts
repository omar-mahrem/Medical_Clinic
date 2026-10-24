export interface Doctor {
  id: number;
  firstName: string;
  middleName?: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth?: string;
  gender?: number;
  qualifications: string;
  specialization: string;
  licenseNumber?: string;
  yearsOfExperience: number;
  isAvailable: boolean;
  userId?: string;
  createdById?: string;
  // UI helper fields
  avatarInitial?: string;
  consultationFee?: number;
  workStartTime?: string;
  workEndTime?: string;
  eveningStartTime?: string;
  eveningEndTime?: string;
  slotDurationMinutes?: number;
  rating?: number;
  reviewsCount?: number;
}
