namespace MedicalClinic.Api.Contract.Appointment;

public record AppointmentResponse
{
    public int Id { get; init; }

    // Patient Info
    public int PatientId { get; init; }
    public string PatientName { get; init; } = string.Empty;
    public string? PatientPhone { get; init; }

    // Doctor Info
    public int DoctorId { get; init; }
    public string DoctorName { get; init; } = string.Empty;
    public string DoctorSpecialization { get; init; } = string.Empty;

    // Appointment Details
    public AppointmentType Type { get; init; }
    public DateOnly AppointmentDate { get; init; }
    public TimeOnly AppointmentTime { get; init; }
    public string? Reason { get; init; }

    // Status
    public AppointmentStatus Status { get; init; }

    // Tracking
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
}