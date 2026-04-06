namespace MedicalClinic.Api.Extentions;

public static class DoctorQueryExtensions
{
    public static IQueryable<DoctorResponse> ToDoctorResponse(this IQueryable<Doctor> query)
    {
        return query.Select(d => new DoctorResponse
        {
            Id = d.Id,
            FirstName = d.User.FirstName,
            MiddleName = d.User.MiddleName,
            LastName = d.User.LastName,
            Email = d.User.Email!,
            PhoneNumber = d.User.PhoneNumber!,
            Qualifications = d.Qualifications,
            Specialization = d.Specialization,
            LicenseNumber = d.LicenseNumber,
            YearsOfExperience = d.YearsOfExperience,
            DateOfBirth = d.User.DateOfBirth,
            IsAvailable = d.IsAvailable,
            UserId = d.UserId,
            CreatedById = d.CreatedById
        });
    }
}
