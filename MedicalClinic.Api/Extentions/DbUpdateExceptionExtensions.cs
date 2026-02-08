namespace MedicalClinic.Api.Extentions;

public static class DbUpdateExceptionExtensions
{
    public static bool IsUniqueConstraintViolation(this DbUpdateException ex)
    {
        return ex.InnerException?.Message.Contains("UNIQUE") == true
            || ex.InnerException?.Message.Contains("IX_Patients_UserId") == true;
    }
}
