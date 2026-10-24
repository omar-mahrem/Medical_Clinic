namespace MedicalClinic.Application.Contract.User;

public record UpdateProfileRequest(
    string FirstName,
    string? MiddleName,
    string LastName,
    string? PhoneNumber,
    DateOnly? DateOfBirth
);
