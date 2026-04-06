namespace MedicalClinic.Api.Contract.Appointment;

public record AvailableTimeSlot(
    TimeOnly Time,
    bool IsAvailable
);