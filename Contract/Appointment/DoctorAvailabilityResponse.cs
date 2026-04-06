namespace MedicalClinic.Api.Contract.Appointment;

public record DoctorAvailabilityResponse(
    int DoctorId,
    string DoctorName,
    string Specialization,
    DateOnly Date,
    List<AvailableTimeSlot> TimeSlots
);