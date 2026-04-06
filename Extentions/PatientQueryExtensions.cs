namespace MedicalClinic.Api.Extentions;

public static class PatientQueryExtensions
{
    public static IQueryable<PatientResponse> ToPatientResponse(this IQueryable<Patient> query)
    {
        return query.Select(p => new PatientResponse
        {
            Id = p.Id,
            FirstName = p.User.FirstName,
            MiddleName = p.User.MiddleName,
            LastName = p.User.LastName,
            Address = p.Address,
            Email = p.User.Email!,
            PhoneNumber = p.User.PhoneNumber!,
            Gender = p.Gender,
            DateOfBirth = p.User.DateOfBirth,
            UserId = p.UserId
        });
    }
}
