namespace MedicalClinic.Api.Errors;

public static class PatientErrors
{
    public static readonly Error PatientNotFound =
        new("Patient.PatientNotFound", "Patient not founded with this ID", StatusCodes.Status404NotFound);

    public static readonly Error DeletedPatient =
            new("Patient.DeletedPatient", "Patient is deleted before", StatusCodes.Status400BadRequest);

    public static readonly Error AlreadyDeleted =
        new("Patient.AlreadyDeleted", "Patient is already deleted", StatusCodes.Status400BadRequest);

    public static readonly Error NotDeleted =
        new("Patient.NotDeleted", "Patient is not deleted", StatusCodes.Status400BadRequest);

    public static readonly Error UnAuthorized =
        new("Patient.UnAuthorized", "You are not authorized to perform this action", StatusCodes.Status403Forbidden);

}
