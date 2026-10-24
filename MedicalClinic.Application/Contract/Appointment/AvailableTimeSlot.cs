namespace MedicalClinic.Application.Contract.Appointment;

public record AvailableTimeSlot(
    TimeOnly Time,
    bool IsAvailable
);