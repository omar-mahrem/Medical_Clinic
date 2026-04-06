namespace MedicalClinic.Api.Contract.Patient;

public record PatientResponse
{
    public int Id { get; init; }
    public string FirstName { get; init; } = string.Empty;
    public string? MiddleName { get; init; }
    public string LastName { get; init; } = string.Empty;
    public string Address { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string PhoneNumber { get; init; } = string.Empty;
    public Gender Gender { get; init; }
    public DateOnly? DateOfBirth { get; init; }
    public string UserId { get; init; } = string.Empty;
    public string FullName => string.IsNullOrEmpty(MiddleName)
        ? $"{FirstName} {LastName}"
        : $"{FirstName} {MiddleName} {LastName}";
};

