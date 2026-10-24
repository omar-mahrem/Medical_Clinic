namespace MedicalClinic.Application.Contract.Roles;

public record RoleResponse(
    string Id,
    string Name,
    bool IsDeleted
);