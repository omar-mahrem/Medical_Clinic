namespace MedicalClinic.Api.Contract.User;

public record UserProfileResponse(
    string Email,
    string UserName,
    string FirstName,
    string? MiddleName,
    string LastName
);
