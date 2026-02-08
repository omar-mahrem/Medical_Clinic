using Microsoft.AspNetCore.Authorization;

namespace MedicalClinic.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class PatientsController(IPatientServices patientServices) : ControllerBase
{
    private readonly IPatientServices _patientServices = patientServices;

    [HttpGet("")]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        return Ok(await _patientServices.GetAllAsync(cancellationToken));
    }
    
    [HttpGet("current")]
    public async Task<IActionResult> GetCurrent(CancellationToken cancellationToken)
    {
        return Ok(await _patientServices.GetCurrentAsync(cancellationToken));
    }
    
    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id, CancellationToken cancellationToken)
    {
        var result = await _patientServices.GetAsync(id, cancellationToken);
        return result.IsSuccess
            ? Ok(result.Value)
            : result.ToProblem();
    }

    [HttpPost("")]
    public async Task<IActionResult> Add(PatientRequest request, CancellationToken cancellationToken)
    {
        var result = await _patientServices.AddAsync(request, cancellationToken);

        return result.IsSuccess
            ? CreatedAtAction(nameof(Get), new { result.Value.Id }, result.Value)
            : result.ToProblem();
    }


}
