namespace MedicalClinic.Core.Entities;

public class Prescription
{
    public int Id { get; set; }

    // Relations
    public int MedicalRecordId { get; set; }

    // Medication Info
    public string MedicationName { get; set; } = string.Empty;  // ??? ??????
    public string Dosage { get; set; } = string.Empty;          // ?????? (500mg)
    public string Frequency { get; set; } = string.Empty;       // ??? ?????? (3 times daily)
    public int Duration { get; set; }                           // ????? (???????)
    public string Instructions { get; set; } = string.Empty;    // ??????? (After meals)

    // Tracking
    public DateTime CreatedAt { get; set; }
    public bool IsDeleted { get; set; } = false;

    // Navigation
    public MedicalRecord MedicalRecord { get; set; } = default!;
}