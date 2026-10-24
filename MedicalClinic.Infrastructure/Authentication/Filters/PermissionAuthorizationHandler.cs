using Microsoft.AspNetCore.Authorization;

namespace MedicalClinic.Infrastructure.Authentication.Filters;

public class PermissionAuthorizationHandler : AuthorizationHandler<PermissionRequirement>
{
    protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, PermissionRequirement requirement)
    {
        if (context.User.Identity is not { IsAuthenticated: true })
            return;

        // Admin has all permissions
        if (context.User.IsInRole("Admin") || context.User.Claims.Any(c => (c.Type == "roles" || c.Type == System.Security.Claims.ClaimTypes.Role) && c.Value.Contains("Admin")))
        {
            context.Succeed(requirement);
            return;
        }

        var hasPermission = context.User.Claims.Any(x =>
            (x.Type == Permissions.Type || x.Type == "permissions") &&
            (x.Value == requirement.Permission || x.Value.Contains($"\"{requirement.Permission}\"") || x.Value.Contains(requirement.Permission)));

        if (hasPermission)
        {
            context.Succeed(requirement);
        }

        await Task.CompletedTask;
    }
}