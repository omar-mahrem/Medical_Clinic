namespace MedicalClinic.Api.Errors;

public static class PatientErrors
{
    public static readonly Error PatientNotFound =
        new("Patient.PatientNotFound", "Patient not founded with this ID", StatusCodes.Status404NotFound);
}
