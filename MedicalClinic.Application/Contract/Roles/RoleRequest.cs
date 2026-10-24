namespace MedicalClinic.Application.Contract.Roles;

public record RoleRequest(
    string Name,
    IList<string> Permissions
);