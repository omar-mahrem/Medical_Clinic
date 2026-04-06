namespace MedicalClinic.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
//[Authorize]
public class PatientsController(IPatientServices patientServices) : ControllerBase
{
    private readonly IPatientServices _patientServices = patientServices;

    [HttpPost("register")]
    [HasPermission(Permissions.AddPatients)]
    public async Task<IActionResult> Add([FromBody] CreatePatientRequest request, CancellationToken cancellationToken)
    {
        var result = await _patientServices.RegisterAsync(request, cancellationToken);

        return result.IsSuccess ? Ok() : result.ToProblem();
    }

    [HttpGet("")]
    [HasPermission(Permissions.GetPatients)]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        return Ok(await _patientServices.GetAllAsync(cancellationToken));
    }

    [HttpGet("deleted")]
    [HasPermission(Permissions.GetPatients)]
    public async Task<IActionResult> GetDeleted(CancellationToken cancellationToken)
    {
        return Ok(await _patientServices.GetDeletedAsync(cancellationToken));
    }


    [HttpGet("{id}")]
    [HasPermission(Permissions.GetPatients)]
    public async Task<IActionResult> Get(int id, CancellationToken cancellationToken)
    {
        var result = await _patientServices.GetAsync(id, cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPut("{id}")]
    [HasPermission(Permissions.UpdatePatients)]
    public async Task<IActionResult> Update([FromRoute] int id, [FromBody] UpdatePatientRequest request, CancellationToken cancellationToken)
    {
        var result = await _patientServices.UpdateAsync(id, request, cancellationToken);

        return result.IsSuccess ? NoContent() : result.ToProblem();
    }

    [HttpDelete("{id}")]
    [HasPermission(Permissions.DeletePatients)]
    public async Task<IActionResult> Delete([FromRoute] int id, CancellationToken cancellationToken)
    {
        var result = await _patientServices.DeleteAsync(id, cancellationToken);

        return result.IsSuccess ? NoContent() : result.ToProblem();
    }

    [HttpPut("{id}/restore")]
    [HasPermission(Permissions.ResetPatients)]
    public async Task<IActionResult> Restore([FromRoute] int id, CancellationToken cancellationToken)
    {
        var result = await _patientServices.RestoreAsync(id, cancellationToken);

        return result.IsSuccess ? NoContent() : result.ToProblem();
    }


}
