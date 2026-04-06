namespace MedicalClinic.Api.Contract.Appointment;

public record UpdateAppointmentRequest(
    DateOnly? AppointmentDate,
    TimeOnly? AppointmentTime,
    AppointmentType? Type,
    string? Reason
);