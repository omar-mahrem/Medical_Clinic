namespace MedicalClinic.Api.Contract.MedicalRecord;

public record MedicalRecordResponse
{
    public int Id { get; init; }
    public int AppointmentId { get; init; }
    public DateOnly AppointmentDate { get; init; }

    // Patient
    public int PatientId { get; init; }
    public string PatientName { get; init; } = string.Empty;

    // Doctor
    public int DoctorId { get; init; }
    public string DoctorName { get; init; } = string.Empty;
    public string DoctorSpecialization { get; init; } = string.Empty;

    // Medical Info
    public string Diagnosis { get; init; } = string.Empty;
    public string Symptoms { get; init; } = string.Empty;
    public string Treatment { get; init; } = string.Empty;
    public string? Notes { get; init; }

    // Vital Signs
    public decimal? Temperature { get; init; }
    public string? BloodPressure { get; init; }
    public int? HeartRate { get; init; }
    public decimal? Weight { get; init; }
    public decimal? Height { get; init; }

    // Prescriptions
    public List<PrescriptionResponse> Prescriptions { get; init; } = [];

    // Tracking
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
}