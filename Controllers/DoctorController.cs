namespace MedicalClinic.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class DoctorsController(IDoctorServices doctorServices, IAppointmentServices appointmentServices) : ControllerBase
{
    private readonly IDoctorServices _doctorServices = doctorServices;
    private readonly IAppointmentServices _appointmentServices = appointmentServices;

    [HttpPost("")]
    [HasPermission(Permissions.AddDoctors)]
    public async Task<IActionResult> Add([FromBody] CreateDoctorRequest request, CancellationToken cancellationToken)
    {
        var result = await _doctorServices.AddAsync(request, cancellationToken);

        return result.IsSuccess ? Ok() : result.ToProblem();

    }

    [HttpGet("")]
    [HasPermission(Permissions.GetDoctors)]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        return Ok(await _doctorServices.GetAllAsync(cancellationToken));
    }

    [HttpGet("available")]
    public async Task<IActionResult> GetAvailable(CancellationToken cancellationToken)
    {
        return Ok(await _doctorServices.GetAvailableAsync(cancellationToken));
    }

    [HttpGet("deleted")]
    [HasPermission(Permissions.GetDoctors)]
    public async Task<IActionResult> GetDeleted(CancellationToken cancellationToken)
    {
        return Ok(await _doctorServices.GetDeletedAsync(cancellationToken));
    }

    [HttpGet("{id:int}")]
    [HasPermission(Permissions.GetDoctors)]
    public async Task<IActionResult> Get([FromRoute] int id, CancellationToken cancellationToken)
    {
        var result = await _doctorServices.GetAsync(id, cancellationToken);

        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }


    [HttpPut("{id}")]
    [HasPermission(Permissions.UpdateDoctors)]
    public async Task<IActionResult> Update([FromRoute] int id, [FromBody] UpdateDoctorRequest request, CancellationToken cancellationToken)
    {
        var result = await _doctorServices.UpdateAsync(id, request, cancellationToken);

        return result.IsSuccess
            ? NoContent()
            : result.ToProblem();
    }

    [HttpDelete("{id}")]
    [HasPermission(Permissions.DeleteDoctors)]
    public async Task<IActionResult> Delete([FromRoute] int id, CancellationToken cancellationToken)
    {
        var result = await _doctorServices.DeleteAsync(id, cancellationToken);

        return result.IsSuccess
            ? NoContent()
            : result.ToProblem();
    }

    [HttpPut("{id}/restore")]
    [HasPermission(Permissions.ResetDoctors)]
    public async Task<IActionResult> Restore([FromRoute] int id, CancellationToken cancellationToken)
    {
        var result = await _doctorServices.RestoreAsync(id, cancellationToken);

        return result.IsSuccess
            ? NoContent()
            : result.ToProblem();
    }

    [HttpPut("{id}/toggle-availability")]
    [HasPermission(Permissions.UpdateDoctors)]
    public async Task<IActionResult> ToggleAvailability([FromRoute] int id, CancellationToken cancellationToken)
    {
        var result = await _doctorServices.ToggleAvailabilityAsync(id, cancellationToken);

        return result.IsSuccess
            ? NoContent()
            : result.ToProblem();
    }

    [HttpGet("specializations")]
    [AllowAnonymous]
    public async Task<IActionResult> GetSpecializations(CancellationToken cancellationToken)
    {
        var specializations = await _doctorServices.GetSpecializationsAsync(cancellationToken);
        return Ok(specializations);
    }

    [HttpGet("doctors-in-specialization")]
    [AllowAnonymous]
    public async Task<IActionResult> GetAllBySpecialization([FromQuery] string specialization, CancellationToken cancellationToken)
    {
        var doctors = await _doctorServices.GetBySpecializationAsync(specialization, cancellationToken);
        return Ok(doctors);
    }

    [HttpGet("{id}/availability")]
    [AllowAnonymous]
    public async Task<IActionResult> GetAvailability(
    [FromRoute] int id,
    [FromQuery] DateOnly date,
    CancellationToken cancellationToken)
    {
        var result = await _appointmentServices.GetDoctorAvailabilityAsync(id, date, cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }
}
