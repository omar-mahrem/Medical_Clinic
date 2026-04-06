namespace MedicalClinic.Api.Errors;

public static class MedicalRecordErrors
{
    public static readonly Error MedicalRecordNotFound =
        new("MedicalRecord.NotFound", "Medical record not found", StatusCodes.Status404NotFound);

    public static readonly Error AppointmentNotCompleted =
        new("MedicalRecord.AppointmentNotCompleted", "Cannot create medical record for incomplete appointment", StatusCodes.Status400BadRequest);

    public static readonly Error RecordAlreadyExists =
        new("MedicalRecord.AlreadyExists", "Medical record already exists for this appointment", StatusCodes.Status409Conflict);

    public static readonly Error NotAuthorized =
        new("MedicalRecord.NotAuthorized", "You are not authorized to access this medical record", StatusCodes.Status403Forbidden);
}

