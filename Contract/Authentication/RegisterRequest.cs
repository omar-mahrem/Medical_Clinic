namespace MedicalClinic.Api.Contract.Authentication;

public record RegisterRequest(
    string FirstName,
    string LastName,
    string Email,
    string Password,
    string PhoneNumber,
    DateOnly DateOfBirth
);
