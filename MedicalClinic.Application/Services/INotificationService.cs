namespace MedicalClinic.Application.Services;

public interface INotificationService
{
    Task SendAppointmentRemindersAsync();

    // Appointment Notifications
    Task SendAppointmentConfirmationAsync(int appointmentId);
    Task SendAppointmentCancellationAsync(int appointmentId);
}
