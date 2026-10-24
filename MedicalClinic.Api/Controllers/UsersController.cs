
namespace MedicalClinic.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UsersController(IUserServices userServices) : ControllerBase
{
    private readonly IUserServices _userServices = userServices;

    [HttpGet("")]
    [HasPermission(Permissions.GetUsers)]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken) =>
        Ok(await _userServices.GetAllAsync(cancellationToken));

    [HttpGet("{id}")]
    [HasPermission(Permissions.GetUsers)]
    public async Task<IActionResult> Get([FromRoute] string id)
    {
        var result = await _userServices.GetAsync(id);

        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost("")]
    [HasPermission(Permissions.AddUsers)]
    public async Task<IActionResult> Add([FromBody] CreateUserRequest request, CancellationToken cancellationToken)
    {
        var result = await _userServices.AddAsync(request, cancellationToken);

        return result.IsSuccess ? CreatedAtAction(nameof(Get), new { result.Value.Id }, result.Value) : result.ToProblem();
    }

    [HttpPut("{id}")]
    [HasPermission(Permissions.UpdateUsers)]
    public async Task<IActionResult> Update([FromRoute] string id, [FromBody] UpdateUserRequest request, CancellationToken cancellationToken)
    {
        var result = await _userServices.UpdateAsync(id, request, cancellationToken);

        return result.IsSuccess ? NoContent() : result.ToProblem();
    }

    [HttpPut("{id}/toggle-status")]
    [HasPermission(Permissions.UpdateUsers)]
    public async Task<IActionResult> ToggleStatus([FromRoute] string id)
    {
        var result = await _userServices.ToggleStatus(id);
        return result.IsSuccess ? NoContent() : result.ToProblem();
    }

    [HttpPut("{id}/unlock")]
    [HasPermission(Permissions.UpdateUsers)]
    public async Task<IActionResult> Unlock([FromRoute] string id)
    {
        var result = await _userServices.Unlock(id);
        return result.IsSuccess ? NoContent() : result.ToProblem();
    }

    [HttpPut("{id}/reset-password")]
    [HasPermission(Permissions.UpdateUsers)]
    public async Task<IActionResult> ResetPassword([FromRoute] string id, [FromBody] ResetPasswordAdminRequest request)
    {
        var result = await _userServices.ResetPasswordByAdminAsync(id, request.NewPassword);
        return result.IsSuccess ? NoContent() : result.ToProblem();
    }
}
