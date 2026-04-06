namespace MedicalClinic.Api.Contract.Appointment;

public record AppointmentFilterRequest(
    int? DoctorId,
    int? PatientId,
    DateOnly? FromDate,
    DateOnly? ToDate,
    AppointmentType? Type,
    AppointmentStatus? Status
);