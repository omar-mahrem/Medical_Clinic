namespace MedicalClinic.Application.Contract.Appointment;

public record CreateAppointmentRequest(
    int DoctorId,
    AppointmentType Type,
    DateOnly AppointmentDate,
    TimeOnly AppointmentTime,
    string? Reason,
    bool IsOnline = false,
    decimal ConsultationFee = 0,
    bool IsPaid = false,
    int? PatientId = null
);