using MedicalClinic.Api.Contract.Appointment;
using MedicalClinic.Api.Contract.Common;
using Microsoft.AspNetCore.RateLimiting;

namespace MedicalClinic.Api.Controllers;

[Route("api/appointments")]
[ApiController]
[Authorize]
[EnableRateLimiting(RateLimiters.Concurrency)]
public class AppointmentsController(IAppointmentServices appointmentServices) : ControllerBase
{
    private readonly IAppointmentServices _appointmentServices = appointmentServices;

    [HttpGet("me")]
    [HasPermission(Permissions.GetAppointments)]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var appointments = await _appointmentServices.GetMyAppointmentsAsync(User.GetUserId()!, cancellationToken);

        return Ok(appointments);
    }

    [HttpGet("me/{id}")]
    [HasPermission(Permissions.GetAppointments)]
    public async Task<IActionResult> Get([FromRoute] int id, CancellationToken cancellationToken)
    {
        var result = await _appointmentServices.GetByIdAsync(id, User.GetUserId()!, cancellationToken);

        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost]
    [HasPermission(Permissions.AddAppointments)]
    public async Task<IActionResult> Book([FromBody] CreateAppointmentRequest request, CancellationToken cancellationToken)
    {
        var result = await _appointmentServices.BookAppointmentAsync(request, User.GetUserId()!, cancellationToken);

        return result.IsSuccess
            //? CreatedAtAction()
            ? Ok(new { appointmentId = result.Value, message = "Appointment booked successfully" })
            : result.ToProblem();
    }

    [HttpPut("me/{id}")]
    [HasPermission(Permissions.UpdateAppointments)]
    public async Task<IActionResult> Update([FromRoute] int id, [FromBody] UpdateAppointmentRequest request, CancellationToken cancellationToken)
    {
        var result = await _appointmentServices.UpdateAsync(id, request, User.GetUserId()!, cancellationToken);

        return result.IsSuccess ? NoContent() : result.ToProblem();
    }

    [HttpDelete("{id}")]
    [HasPermission(Permissions.CancelAppointments)]
    public async Task<IActionResult> Cancel([FromRoute] int id, CancellationToken cancellationToken)
    {
        var result = await _appointmentServices.CancelAppointmentAsync(id, User.GetUserId()!, cancellationToken);

        return result.IsSuccess ? NoContent() : result.ToProblem();
    }

    [HttpGet("doctor")]
    [HasPermission(Permissions.GetAppointments)]
    public async Task<IActionResult> GetDoctorAppointments([FromQuery] DateOnly? date, CancellationToken cancellationToken)
    {
        var appointments = await _appointmentServices.GetDoctorAppointmentsAsync(User.GetUserId()!, date, cancellationToken);

        return Ok(appointments);
    }

    [HttpPatch("{id}/status")]
    [HasPermission(Permissions.UpdateAppointments)]
    public async Task<IActionResult> ChangeStatus([FromRoute] int id, [FromBody] ChangeStatusRequest request, CancellationToken cancellationToken)
    {
        var result = await _appointmentServices.ChangeStatusAsync(id, request, cancellationToken);

        return result.IsSuccess ? NoContent() : result.ToProblem();
    }

    [HttpGet]
    [HasPermission(Permissions.GetAppointments)]
    public async Task<IActionResult> GetAllUsersAppointments([FromQuery] AppointmentFilterRequest filter, [FromQuery] RequestFilters paginationFilter, CancellationToken cancellationToken)
    {
        var appointments = await _appointmentServices.GetAllAsync(filter, paginationFilter, cancellationToken);
        return Ok(appointments);
    }
}