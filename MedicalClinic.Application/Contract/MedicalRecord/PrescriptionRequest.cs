namespace MedicalClinic.Application.Contract.MedicalRecord;

public record PrescriptionRequest(
    string MedicationName,
    string Dosage,
    string Frequency,
    int Duration,
    string Instructions
);