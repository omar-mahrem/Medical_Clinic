using MedicalClinic.Api.Extentions;

namespace MedicalClinic.Api.Contract.Doctor;
public record DoctorResponse(
    int Id,
    string FirstName,
    string? MiddleName,
    string LastName,
    string Email,
    string PhoneNumber,
    string Specialization,
    DateOnly DateOfBirth,
    string UserId
)
{
    public int Age => DateOfBirth.CalculateAge();
    public string FullName => string.IsNullOrEmpty(MiddleName)
        ? $"{FirstName} {LastName}"
        : $"{FirstName} {MiddleName} {LastName}";
};
