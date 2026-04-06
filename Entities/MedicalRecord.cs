namespace MedicalClinic.Api.Entities;

public class MedicalRecord
{
    public int Id { get; set; }

    // Relations
    public int AppointmentId { get; set; }
    public int PatientId { get; set; }
    public int DoctorId { get; set; }

    // Medical Info
    public string Diagnosis { get; set; } = string.Empty;  // التشخيص
    public string Symptoms { get; set; } = string.Empty;   // الأعراض
    public string Treatment { get; set; } = string.Empty;  // العلاج
    public string Notes { get; set; } = string.Empty;      // ملاحظات الطبيب

    // Vital Signs
    public decimal? Temperature { get; set; }       // درجة الحرارة (Celsius)
    public string? BloodPressure { get; set; }     // ضغط الدم (120/80)
    public int? HeartRate { get; set; }            // نبضات القلب
    public decimal? Weight { get; set; }           // الوزن (kg)
    public decimal? Height { get; set; }           // الطول (cm)

    // Tracking
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public bool IsDeleted { get; set; } = false;

    // Navigation
    public Appointment Appointment { get; set; } = default!;
    public Patient Patient { get; set; } = default!;
    public Doctor Doctor { get; set; } = default!;

    // Collections
    public ICollection<Prescription> Prescriptions { get; set; } = [];
}
