namespace MedicalClinic.Api.Errors;

public static class DoctorErrors
{
    public static readonly Error DoctorNotFound =
        new("Doctor.DoctorNotFound", "Doctor not founded with this ID", StatusCodes.Status404NotFound);
}
