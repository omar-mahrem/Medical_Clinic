using MailKit.Net.Smtp;
using MailKit.Security;
using MedicalClinic.Infrastructure.Settings;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;

namespace MedicalClinic.Infrastructure.Mail;

public class EmailServices(IOptions<MailSettings> options, ILogger<EmailServices> logger) : IEmailSender
{
    private readonly MailSettings _mailSettings = options.Value;
    private readonly ILogger<EmailServices> _logger = logger;

    public async Task SendEmailAsync(string email, string subject, string htmlMessage)
    {
        if (string.IsNullOrWhiteSpace(_mailSettings.Host) || string.IsNullOrWhiteSpace(_mailSettings.Password))
        {
            _logger.LogWarning("Email sending skipped: SMTP Host or Password not configured in MailSettings. Target email: {Email}", email);
            return;
        }

        var password = _mailSettings.Password.Replace(" ", "").Trim();

        // 1. Try MailKit first with XOAUTH2 stripped
        try
        {
            var fromAddress = new MailboxAddress(_mailSettings.DisplayName ?? "Medical Clinic", _mailSettings.Mail);
            var message = new MimeMessage
            {
                Sender = fromAddress,
                Subject = subject
            };
            message.From.Add(fromAddress);
            message.To.Add(MailboxAddress.Parse(email));

            var builder = new BodyBuilder
            {
                HtmlBody = htmlMessage
            };
            message.Body = builder.ToMessageBody();

            using var smtp = new SmtpClient();
            await smtp.ConnectAsync(_mailSettings.Host, _mailSettings.Port, SecureSocketOptions.StartTls);
            smtp.AuthenticationMechanisms.Remove("XOAUTH2");
            await smtp.AuthenticateAsync(_mailSettings.Mail, password);
            await smtp.SendAsync(message);
            await smtp.DisconnectAsync(true);

            _logger.LogInformation("Email sent successfully via MailKit to {Email} with subject: {Subject}", email, subject);
            return;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "MailKit failed for {Email}, attempting fallback with System.Net.Mail", email);
        }

        // 2. Fallback to System.Net.Mail.SmtpClient
        try
        {
            using var sysClient = new System.Net.Mail.SmtpClient(_mailSettings.Host, _mailSettings.Port)
            {
                EnableSsl = true,
                Credentials = new System.Net.NetworkCredential(_mailSettings.Mail, password)
            };

            using var sysMsg = new System.Net.Mail.MailMessage(_mailSettings.Mail, email, subject, htmlMessage)
            {
                IsBodyHtml = true
            };

            await sysClient.SendMailAsync(sysMsg);
            _logger.LogInformation("Email sent successfully via System.Net.Mail fallback to {Email}", email);
        }
        catch (Exception fallbackEx)
        {
            _logger.LogError(fallbackEx, "Failed to send email to {Email} using both MailKit and System.Net.Mail fallback", email);
        }
    }
}
