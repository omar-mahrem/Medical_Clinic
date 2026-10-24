
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
    [Authorize]
    public async Task<IActionResult> GetById([FromRoute] int id, CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        var result = await _medicalRecordServices.GetByIdAsync(id, userId!, cancellationToken);

        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpGet("{id}/prescription/pdf")]
    [Authorize]
    public async Task<IActionResult> DownloadPrescriptionPdf([FromRoute] int id, CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        var result = await _medicalRecordServices.GetByIdAsync(id, userId!, cancellationToken);

        if (!result.IsSuccess)
            return result.ToProblem();

        var pdfBytes = PrescriptionPdfGenerator.Generate(result.Value);
        return File(pdfBytes, "application/pdf", $"Prescription-{id}.pdf");
    }

    [HttpGet("by-appointment/{appointmentId}")]
    [Authorize]
    public async Task<IActionResult> GetByAppointmentId([FromRoute] int appointmentId, CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        var result = await _medicalRecordServices.GetByAppointmentIdAsync(appointmentId, userId!, cancellationToken);

        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpGet("by-appointment/{appointmentId}/prescription/pdf")]
    [Authorize]
    public async Task<IActionResult> DownloadPrescriptionByAppointmentPdf([FromRoute] int appointmentId, CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        var result = await _medicalRecordServices.GetByAppointmentIdAsync(appointmentId, userId!, cancellationToken);

        if (!result.IsSuccess)
            return result.ToProblem();

        var pdfBytes = PrescriptionPdfGenerator.Generate(result.Value);
        return File(pdfBytes, "application/pdf", $"Prescription-App-{appointmentId}.pdf");
    }

    [HttpGet("sample-prescription/pdf")]
    [AllowAnonymous]
    public IActionResult DownloadSamplePrescriptionPdf([FromQuery] string? patientName = null)
    {
        var sampleRecord = new MedicalClinic.Application.Contract.MedicalRecord.MedicalRecordResponse
        {
            Id = 101,
            AppointmentId = 1,
            AppointmentDate = DateOnly.FromDateTime(DateTime.Today),
            PatientName = string.IsNullOrWhiteSpace(patientName) ? "أحمد محمد محمود" : patientName.Trim(),
            DoctorName = "د. محمود السيد عبد الفتاح",
            DoctorSpecialization = "استشاري امراض الصدر",
            Diagnosis = "التهاب حاد في الجيوب الأنفية مع إجهاد عام",
            Symptoms = "صداع نصفي متكرر، انسداد واحتقان بالأنف، إرهاق",
            Treatment = "الراحة التامة لمدة 3 أيام، الإكثار من السوائل الدافئة، واستخدام البخاخ بانتظام",
            Temperature = 37.2m,
            BloodPressure = "120/80",
            HeartRate = 74,
            Weight = 72m,
            Height = 175m,
            Prescriptions = new List<MedicalClinic.Application.Contract.MedicalRecord.PrescriptionResponse>
            {
                new() { Id = 1, MedicationName = "Augmentin 1g", Dosage = "قرص واحد", Frequency = "كل 12 ساعة بعد الأكل", Duration = 7, Instructions = "يؤخذ بعد الوجبة مع كوب ماء وفير" },
                new() { Id = 2, MedicationName = "Panadol Extra", Dosage = "قرصين عند اللزوم", Frequency = "كل 8 ساعات", Duration = 5, Instructions = "عند الشعور بالصداع الشديد" },
                new() { Id = 3, MedicationName = "Otrivin Nasal Spray", Dosage = "بخة في كل فتحة أنف", Frequency = "مرتين يومياً", Duration = 5, Instructions = "لا يستخدم لأكثر من 5 أيام متتالية" }
            },
            CreatedAt = DateTime.UtcNow
        };

        var pdfBytes = PrescriptionPdfGenerator.Generate(sampleRecord);
        return File(pdfBytes, "application/pdf", "Sample-Prescription-NordicClinic.pdf");
    }

    [HttpGet("patient/{patientId}")]
    [Authorize]
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
