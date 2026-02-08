using Microsoft.AspNetCore.Authorization;

namespace MedicalClinic.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class DoctorsController(IDoctorServices doctorServices) : ControllerBase
{
    private readonly IDoctorServices _doctorServices = doctorServices;

    [HttpGet("")]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        return Ok(await _doctorServices.GetAllAsync(cancellationToken));
    }

    [HttpGet("available")]
    public async Task<IActionResult> GetAvailable(CancellationToken cancellationToken)
    {
        return Ok(await _doctorServices.GetAvailableAsync(cancellationToken));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get([FromRoute] int id, CancellationToken cancellationToken)
    {
        var result = await _doctorServices.GetAsync(id, cancellationToken);

        return result.IsSuccess
            ? Ok(result.Value)
            : result.ToProblem();
            //: result.ToProblem(StatusCodes.Status404NotFound);
            //: Problem(statusCode: StatusCodes.Status404NotFound, title: result.Error.Code, detail: result.Error.Description);
            //: NotFound(result.Error);
    }
    
    [HttpPost("")]
    public async Task<IActionResult> Add([FromBody] DoctorRequest request, CancellationToken cancellationToken)
    {
        var result = await _doctorServices.AddAsync(request, cancellationToken);

        return result.IsSuccess
            ? CreatedAtAction(nameof(Get), new { id = result.Value.Id }, result.Value)
            : result.ToProblem();
    }
    
    [HttpPut("{id}")]
    public async Task<IActionResult> Update([FromRoute] int id, [FromBody] DoctorRequest request, CancellationToken cancellationToken)
    {
        var result = await _doctorServices.UpdateAsync(id, request, cancellationToken);

        return result.IsSuccess
            ? NoContent()
            : result.ToProblem();
            //: Problem(statusCode: StatusCodes.Status404NotFound, title: result.Error.Code, detail: result.Error.Description);
            //: NotFound(result.Error);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete([FromRoute] int id, CancellationToken cancellationToken)
    {
        var result = await _doctorServices.DeleteAsync(id, cancellationToken);

        return result.IsSuccess
            ? NoContent()
            : result.ToProblem();
            //: Problem(statusCode: StatusCodes.Status404NotFound, title: result.Error.Code, detail: result.Error.Description);
            //: NotFound(result.Error);
    }

    [HttpPut("{id}/toggle-availability")]
    public async Task<IActionResult> ToggleAvailability([FromRoute] int id, CancellationToken cancellationToken)
    {
        var result = await _doctorServices.ToggleAvailableAsync(id, cancellationToken);

        return result.IsSuccess
            ? NoContent()
            : result.ToProblem();
        //: Problem(statusCode: StatusCodes.Status404NotFound, title: result.Error.Code, detail: result.Error.Description);
        //: NotFound(result.Error);
    }
}
