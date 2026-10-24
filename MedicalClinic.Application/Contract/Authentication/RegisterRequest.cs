namespace MedicalClinic.Application.Contract.Authentication;

public record RegisterRequest(
    string FirstName,
    string LastName,
    string Email,
    string Password,
    string PhoneNumber,
    DateOnly DateOfBirth,
    Gender Gender = Gender.Male
);
