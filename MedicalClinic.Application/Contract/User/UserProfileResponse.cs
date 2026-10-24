namespace MedicalClinic.Application.Contract.User;

public record UserProfileResponse(
    string Email,
    string UserName,
    string FirstName,
    string? MiddleName,
    string LastName,
    string? PhoneNumber,
    DateOnly? DateOfBirth
);
