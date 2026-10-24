using Hangfire;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.AspNetCore.Mvc;

namespace MedicalClinic.Api.Controllers;

public record ContactMessageRequest(
    string FullName,
    string Email,
    string? PhoneNumber,
    string Department,
    string Subject,
    string Message
);

[Route("api/[controller]")]
[ApiController]
public class ContactController(IEmailSender emailSender, ILogger<ContactController> logger) : ControllerBase
{
    private readonly IEmailSender _emailSender = emailSender;
    private readonly ILogger<ContactController> _logger = logger;

    [HttpPost]
    public IActionResult SendMessage([FromBody] ContactMessageRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.FullName) ||
            string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Message))
        {
            return BadRequest(new { detail = "يرجى تعبئة الحقول الإلزامية: الاسم، البريد، ونص الرسالة." });
        }

        _logger.LogInformation("Contact message received from {Name} ({Email}) regarding {Subject} for {Department}",
            request.FullName, request.Email, request.Subject, request.Department);

        var emailBody = $@"
            <div dir='rtl' style='font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; color: #1e293b;'>
                <h2 style='color: #047857;'>رسالة استفسار وتواصل جديدة - المركز الطبي</h2>
                <p><strong>المرسل:</strong> {request.FullName}</p>
                <p><strong>البريد الإلكتروني:</strong> {request.Email}</p>
                <p><strong>الهاتف:</strong> {request.PhoneNumber ?? "غير محدد"}</p>
                <p><strong>القسم المعني:</strong> {request.Department}</p>
                <p><strong>الموضوع:</strong> {request.Subject}</p>
                <hr style='border: none; border-top: 1px solid #e2e8f0; margin: 15px 0;' />
                <p><strong>نص الرسالة:</strong></p>
                <div style='background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;'>
                    {request.Message.Replace("\n", "<br/>")}
                </div>
            </div>
        ";

        try
        {
            BackgroundJob.Enqueue(() => _emailSender.SendEmailAsync("omarmahrem910@gmail.com", $"استفسار جديد: {request.Subject} ({request.Department})", emailBody));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to enqueue contact message email");
        }

        return Ok(new { message = "تم إرسال رسالتكم بنجاح وسيتواصل معكم فريق الاستقبال والإدارة في أقرب وقت." });
    }
}
