namespace MedicalClinic.Api.Contract.Roles;

public record RoleResponse(
    string Id,
    string Name,
    bool IsDeleted
);