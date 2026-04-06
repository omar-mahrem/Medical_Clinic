namespace MedicalClinic.Api.Contract.Appointment;

public record CreateAppointmentRequest(
    int DoctorId,
    AppointmentType Type,
    DateOnly AppointmentDate,
    TimeOnly AppointmentTime,
    string? Reason
);