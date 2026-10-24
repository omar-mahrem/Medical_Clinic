namespace MedicalClinic.Application.Contract.User;

public record CreateUserRequest(
    string FirstName,
    string LastName,
    string Email,
    string Password,
    IList<string> Roles,
    string? PhoneNumber = null
);