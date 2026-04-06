namespace MedicalClinic.Api.Entities;

public class Prescription
{
    public int Id { get; set; }

    // Relations
    public int MedicalRecordId { get; set; }

    // Medication Info
    public string MedicationName { get; set; } = string.Empty;  // اسم الدواء
    public string Dosage { get; set; } = string.Empty;          // الجرعة (500mg)
    public string Frequency { get; set; } = string.Empty;       // عدد المرات (3 times daily)
    public int Duration { get; set; }                           // المدة (بالأيام)
    public string Instructions { get; set; } = string.Empty;    // تعليمات (After meals)

    // Tracking
    public DateTime CreatedAt { get; set; }
    public bool IsDeleted { get; set; } = false;

    // Navigation
    public MedicalRecord MedicalRecord { get; set; } = default!;
}