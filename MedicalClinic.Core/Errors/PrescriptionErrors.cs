namespace MedicalClinic.Core.Errors;

public static class PrescriptionErrors
{
    public static readonly Error PrescriptionNotFound =
        new("Prescription.NotFound", "Prescription not found", StatusCodes.Status404NotFound);
}