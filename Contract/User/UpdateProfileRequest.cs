namespace MedicalClinic.Api.Contract.User;

public record UpdateProfileRequest(
    string FirstName,
    string? MiddleName,
    string LastName
);
