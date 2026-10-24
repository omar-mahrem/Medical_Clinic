namespace MedicalClinic.Core.Entities;

public sealed class Doctor
{
    public int Id { get; set; }
    public string Qualifications { get; set; } = string.Empty;
    public string Specialization { get; set; } = string.Empty;
    public string LicenseNumber { get; set; } = string.Empty;
    public int YearsOfExperience { get; set; }
    public bool IsAvailable { get; set; }
    public bool IsDeleted { get; set; }
    public Gender Gender { get; set; }
    public TimeOnly? WorkStartTime { get; set; }
    public TimeOnly? WorkEndTime { get; set; }
    public TimeOnly? EveningStartTime { get; set; }
    public TimeOnly? EveningEndTime { get; set; }
    public int? SlotDurationMinutes { get; set; }
    public decimal? ConsultationFee { get; set; }

    public string UserId { get; set; } = default!;
    public string? CreatedById { get; set; }

    public ApplicationUser User { get; set; } = default!;
    public ApplicationUser? CreatedBy { get; set; }
}
