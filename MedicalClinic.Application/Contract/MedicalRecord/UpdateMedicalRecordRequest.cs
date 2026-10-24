namespace MedicalClinic.Application.Contract.MedicalRecord;

public record UpdateMedicalRecordRequest(
    string? Diagnosis,
    string? Symptoms,
    string? Treatment,
    string? Notes,
    decimal? Temperature,
    string? BloodPressure,
    int? HeartRate,
    decimal? Weight,
    decimal? Height,
    List<PrescriptionRequest>? Prescriptions = null
);