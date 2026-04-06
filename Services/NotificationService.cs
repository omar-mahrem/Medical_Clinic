using Hangfire;

namespace MedicalClinic.Api.Services;

public class NotificationService(
    ApplicationDbContext context,
    IEmailSender emailSender,
    ILogger<NotificationService> logger) : INotificationService
{
    private readonly ApplicationDbContext _context = context;
    private readonly IEmailSender _emailSender = emailSender;
    private readonly ILogger<NotificationService> _logger = logger;

    public async Task SendAppointmentRemindersAsync()
    {
        var now = DateTime.UtcNow;
        var tomorrow = now.AddHours(24);
        var oneHourLater = now.AddHours(1);

        // Get appointments that need reminders
        var appointments = await _context.Appointments
            .Include(a => a.Patient)
            .ThenInclude(p => p.User)
            .Include(a => a.Doctor)
            .ThenInclude(d => d.User)
            .Where(a => !a.IsDeleted && a.Status == AppointmentStatus.Confirmed &&
                (a.AppointmentDate == DateOnly.FromDateTime(tomorrow.Date) || a.AppointmentDate == DateOnly.FromDateTime(oneHourLater.Date)))
            .ToListAsync();

        foreach (var appointment in appointments)
        {
            var appointmentDateTime = appointment.AppointmentDate.ToDateTime(appointment.AppointmentTime);
            var timeDifference = appointmentDateTime - now;

            // 24-hour reminder
            if (timeDifference.TotalHours >= 23.5 && timeDifference.TotalHours <= 24.5)
            {
                await Send24HourReminderAsync(appointment);
            }
            // 1-hour reminder
            else if (timeDifference.TotalHours >= 0.5 && timeDifference.TotalHours <= 1.5)
            {
                await Send1HourReminderAsync(appointment);
            }
        }
    }

    public async Task SendAppointmentConfirmationAsync(int appointmentId)
    {
        var appointment = await _context.Appointments
            .Include(a => a.Patient)
                .ThenInclude(p => p.User)
            .Include(a => a.Doctor)
                .ThenInclude(d => d.User)
            .FirstOrDefaultAsync(a => a.Id == appointmentId);

        if (appointment is null)
            return;

        var emailBody = EmailBodyBuilder.GenerateEmailBody("AppointmentConfirmation",
            templateModel: new Dictionary<string, string>
            {
                { "{{patient_name}}", appointment.Patient.User.FullName },
                { "{{doctor_name}}", appointment.Doctor.User.FullName },
                { "{{appointment_date}}", appointment.AppointmentDate.ToString("dddd, MMMM dd, yyyy") },
                { "{{appointment_time}}", appointment.AppointmentTime.ToString("hh:mm tt") },
                { "{{specialization}}", appointment.Doctor.Specialization },
                { "{{appointment_type}}", appointment.Type.ToString() }
            });

        await _emailSender.SendEmailAsync(appointment.Patient.User.Email!, "✅ Appointment Booked Successfully", emailBody);

        _logger.LogInformation("Confirmation email sent. AppointmentId: {Id}", appointmentId);

        await Task.CompletedTask;
    }

    public async Task SendAppointmentCancellationAsync(int appointmentId)
    {
        var appointment = await _context.Appointments
            .Include(a => a.Patient)
                .ThenInclude(p => p.User)
            .Include(a => a.Doctor)
                .ThenInclude(d => d.User)
            .FirstOrDefaultAsync(a => a.Id == appointmentId);

        if (appointment is null)
            return;

        var emailBody = EmailBodyBuilder.GenerateEmailBody("AppointmentCancellation",
            templateModel: new Dictionary<string, string>
            {
                { "{{patient_name}}", appointment.Patient.User.FullName },
                { "{{doctor_name}}", appointment.Doctor.User.FullName },
                { "{{appointment_date}}", appointment.AppointmentDate.ToString("dddd, MMMM dd, yyyy") },
                { "{{appointment_time}}", appointment.AppointmentTime.ToString("hh:mm tt") },
                { "{{specialization}}", appointment.Doctor.Specialization }
            });

        await _emailSender.SendEmailAsync(appointment.Patient.User.Email!, "❌ Appointment Cancelled", emailBody);

        _logger.LogInformation("Cancellation email sent. AppointmentId: {Id}", appointmentId);
        await Task.CompletedTask;
    }
    private async Task Send24HourReminderAsync(Appointment appointment)
    {
        var emailBody = EmailBodyBuilder.GenerateEmailBody("AppointmentReminder24h",
            templateModel: new Dictionary<string, string>
            {
                { "{{patient_name}}", appointment.Patient.User.FullName },
                { "{{doctor_name}}", appointment.Doctor.User.FullName },
                { "{{appointment_date}}", appointment.AppointmentDate.ToString("dddd, MMMM dd, yyyy") },
                { "{{appointment_time}}", appointment.AppointmentTime.ToString("hh:mm tt") },
                { "{{specialization}}", appointment.Doctor.Specialization }
            });

        BackgroundJob.Enqueue(() => _emailSender.SendEmailAsync(appointment.Patient.User.Email!, "🔔 Reminder: Your appointment is tomorrow", emailBody));

        _logger.LogInformation("24-hour reminder sending. AppointmentId: {Id}, Patient: {Email}", appointment.Id, appointment.Patient.User.Email);
        await Task.CompletedTask;
    }

    private async Task Send1HourReminderAsync(Appointment appointment)
    {
        var emailBody = EmailBodyBuilder.GenerateEmailBody("AppointmentReminder1h",
            templateModel: new Dictionary<string, string>
            {
                { "{{patient_name}}", appointment.Patient.User.FullName },
                { "{{doctor_name}}", appointment.Doctor.User.FullName },
                { "{{appointment_time}}", appointment.AppointmentTime.ToString("hh:mm tt") },
                { "{{specialization}}", appointment.Doctor.Specialization }
            });

        BackgroundJob.Enqueue(() => _emailSender.SendEmailAsync(appointment.Patient.User.Email!, "⏰ Reminder: Your appointment is in 1 hour", emailBody));

        _logger.LogInformation(
            "1-hour reminder sending. AppointmentId: {Id}, Patient: {Email}",
            appointment.Id, appointment.Patient.User.Email);
        await Task.CompletedTask;
    }
}
