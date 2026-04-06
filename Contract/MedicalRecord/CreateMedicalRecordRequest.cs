namespace MedicalClinic.Api.Contract.MedicalRecord;

public record CreateMedicalRecordRequest(
    int AppointmentId,
    string Diagnosis,
    string Symptoms,
    string Treatment,
    string Notes,
    decimal? Temperature,
    string? BloodPressure,
    int? HeartRate,
    decimal? Weight,
    decimal? Height,
    List<PrescriptionRequest>? Prescriptions
);
