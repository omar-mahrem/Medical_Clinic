namespace MedicalClinic.Api.Contract.Roles;

public record RoleRequest(
    string Name,
    IList<string> Permissions
);