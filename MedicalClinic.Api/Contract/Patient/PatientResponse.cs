namespace MedicalClinic.Api.Contract.Patient;

public record PatientResponse(
    int Id,
    string FirstName,
    string? MiddleName,
    string LastName,
    string Address,
    string Email,
    string PhoneNumber,
    Gender Gender,
    DateOnly DateOfBirth,
    string UserId
)
{
    public int Age => DateOfBirth.CalculateAge();
    public string FullName => string.IsNullOrEmpty(MiddleName)
        ? $"{FirstName} {LastName}"
        : $"{FirstName} {MiddleName} {LastName}";
};

