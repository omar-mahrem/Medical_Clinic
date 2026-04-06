using MedicalClinic.Api.Contract.User;

namespace MedicalClinic.Api.Controllers;
[Route("me")]
[ApiController]
[Authorize]
public class AccountController(IUserServices userServices) : ControllerBase
{
    private readonly IUserServices _userServices = userServices;

    [HttpGet("")]
    [HasPermission(Permissions.GetUsers)]
    public async Task<IActionResult> Info()
    {
        var result = await _userServices.GetProfileAsync(User.GetUserId()!);

        return Ok(result.Value);
    }

    [HttpPut("info")]
    [HasPermission(Permissions.UpdateUsers)]
    public async Task<IActionResult> Info([FromBody] UpdateProfileRequest request)
    {
        var result = await _userServices.UpdateProfileAsync(User.GetUserId()!, request);

        return NoContent();
    }

    [HttpPut("change-password")]
    [HasPermission(Permissions.UpdateUsers)]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        var result = await _userServices.ChangePasswordAsync(User.GetUserId()!, request);

        return result.IsSuccess ? NoContent() : result.ToProblem();
    }
}
