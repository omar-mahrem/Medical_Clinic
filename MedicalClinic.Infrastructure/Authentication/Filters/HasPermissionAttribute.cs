using Microsoft.AspNetCore.Authorization;

namespace MedicalClinic.Infrastructure.Authentication.Filters;

public class HasPermissionAttribute(string permission) : AuthorizeAttribute(permission)
{
}