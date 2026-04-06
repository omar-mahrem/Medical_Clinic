namespace MedicalClinic.Api.Errors;

public static class DoctorErrors
{
    public static readonly Error DoctorNotFound =
        new("Doctor.DoctorNotFound", "Doctor not founded with this ID", StatusCodes.Status404NotFound);

    public static readonly Error AlreadyDeleted =
        new("Doctor.AlreadyDeleted", "Doctor is already deleted", StatusCodes.Status400BadRequest);

    public static readonly Error DeletedDoctor =
        new("Doctor.DeletedDoctor", "Doctor is deleted before", StatusCodes.Status400BadRequest);


    public static readonly Error NotDeleted =
        new("Doctor.NotDeleted", "Doctor is not deleted", StatusCodes.Status400BadRequest);

    public static readonly Error DuplicatedLicenceNumber =
        new("Doctor.DuplicatedLicenceNumber", "Licence number is alrady used by another doctor", StatusCodes.Status409Conflict);

    public static readonly Error DoctorNotAvailable =
            new("Doctor.NotAvailable", "Doctor is not available", StatusCodes.Status400BadRequest);

}
