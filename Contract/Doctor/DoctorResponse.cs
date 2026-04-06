namespace MedicalClinic.Api.Contract.Doctor;
public record DoctorResponse
{
    public int Id { get; init; }
    public string FirstName { get; init; } = string.Empty;
    public string? MiddleName { get; init; }
    public string LastName { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string PhoneNumber { get; init; } = string.Empty;
    public DateOnly? DateOfBirth { get; init; }
    public Gender Gender { get; init; }
    public string Qualifications { get; init; } = string.Empty;
    public string Specialization { get; init; } = string.Empty;
    public string LicenseNumber { get; init; } = string.Empty;
    public int YearsOfExperience { get; init; }
    public bool IsAvailable { get; init; }
    public string UserId { get; init; } = string.Empty;
    public string? CreatedById { get; init; }

    public string FullName => string.IsNullOrEmpty(MiddleName)
        ? $"{FirstName} {LastName}"
        : $"{FirstName} {MiddleName} {LastName}";
}