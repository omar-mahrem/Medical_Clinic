namespace MedicalClinic.Api.Contract.MedicalRecord;

public record PrescriptionResponse
{
    public int Id { get; init; }
    public string MedicationName { get; init; } = string.Empty;
    public string Dosage { get; init; } = string.Empty;
    public string Frequency { get; init; } = string.Empty;
    public int Duration { get; init; }
    public string? Instructions { get; init; }
    public DateTime CreatedAt { get; init; }
}