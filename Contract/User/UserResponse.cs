namespace MedicalClinic.Api.Contract.User;

public record UserResponse(
    string Id,
    string FirstName,
    string LastName,
    string Email,
    bool IsDeleted,
    IEnumerable<string> Roles
);
