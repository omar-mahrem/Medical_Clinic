namespace MedicalClinic.Api.Contract.MedicalRecord;

public record PrescriptionRequest(
    string MedicationName,
    string Dosage,
    string Frequency,
    int Duration,
    string Instructions
);