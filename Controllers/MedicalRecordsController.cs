using MedicalClinic.Api.Contract.MedicalRecord;

namespace MedicalClinic.Api.Controllers;
[Route("api/[controller]")]
[ApiController]
public class MedicalRecordsController(IMedicalRecordServices medicalRecordServices) : ControllerBase
{
    private readonly IMedicalRecordServices _medicalRecordServices = medicalRecordServices;

    [HttpPost]
    [HasPermission(Permissions.AddMedicalRecords)]
    public async Task<IActionResult> Create([FromBody] CreateMedicalRecordRequest request, CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        var result = await _medicalRecordServices.CreateAsync(request, userId!, cancellationToken);

        return result.IsSuccess
            ? Ok(new { medicalRecordId = result.Value, message = "Medical record created successfully" })
            : result.ToProblem();
    }

    [HttpGet("{id}")]
    [HasPermission(Permissions.GetMedicalRecords)]
    public async Task<IActionResult> GetById([FromRoute] int id, CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        var result = await _medicalRecordServices.GetByIdAsync(id, userId!, cancellationToken);

        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpGet("patient/{patientId}")]
    [HasPermission(Permissions.GetMedicalRecordsHistory)]
    public async Task<IActionResult> GetPatientHistory([FromRoute] int patientId, CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        var records = await _medicalRecordServices.GetPatientHistoryAsync(patientId, userId!, cancellationToken);

        return Ok(records);
    }


    [HttpPut("{id}")]
    [HasPermission(Permissions.UpdateMedicalRecords)]
    public async Task<IActionResult> Update([FromRoute] int id, [FromBody] UpdateMedicalRecordRequest request, CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        var result = await _medicalRecordServices.UpdateAsync(id, request, userId!, cancellationToken);

        return result.IsSuccess
            ? Ok(new { message = "Medical record updated successfully" })
            : result.ToProblem();
    }

    [HttpDelete("{id}")]
    [HasPermission(Permissions.DeleteMedicalRecords)]
    public async Task<IActionResult> Delete([FromRoute] int id, CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        var result = await _medicalRecordServices.DeleteAsync(id, userId!, cancellationToken);

        return result.IsSuccess
            ? Ok(new { message = "Medical record deleted successfully" })
            : result.ToProblem();
    }
}
