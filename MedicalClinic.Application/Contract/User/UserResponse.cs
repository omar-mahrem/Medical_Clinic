namespace MedicalClinic.Application.Contract.User;

public record UserResponse(
    string Id,
    string FirstName,
    string LastName,
    string Email,
    bool IsDeleted,
    bool IsLocked,
    IEnumerable<string> Roles
);
