namespace MedicalClinic.Api.Controllers;

[Route("api/account-setup")]
[ApiController]
public class AccountSetupController(IAccountSetup accountSetup) : ControllerBase
{
    private readonly IAccountSetup _accountSetup = accountSetup;

    [HttpGet("validate")]
    [AllowAnonymous]
    public async Task<ActionResult> ValidateSetupLink([FromQuery] string userId, [FromQuery] string token)
    {
        var result = await _accountSetup.ValidateSetupLink(userId, token);

        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost("complete")]
    [AllowAnonymous]
    public async Task<ActionResult> SetupPassword(SetupPasswordRequest request)
    {
        var result = await _accountSetup.CompleteAccountSetup(request);

        return result.IsSuccess ? Ok() : result.ToProblem();
    }
}
