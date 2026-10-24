namespace MedicalClinic.Application.Contract.Roles;

public record RoleDetailResponse(
    string Id,
    string Name,
    bool IsDeleted,
    IEnumerable<string> Permissions
);