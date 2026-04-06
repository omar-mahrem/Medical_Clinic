namespace MedicalClinic.Api.Contract.Appointment;

public class CreateAppointmentRequestValidator : AbstractValidator<CreateAppointmentRequest>
{
    public CreateAppointmentRequestValidator()
    {
        RuleFor(x => x.DoctorId)
            .GreaterThan(0)
            .WithMessage("Doctor is required.");

        RuleFor(x => x.Type)
            .IsInEnum()
            .WithMessage("Invalid appointment type.");

        RuleFor(x => x.AppointmentDate)
            .GreaterThanOrEqualTo(DateOnly.FromDateTime(DateTime.Today))
            .WithMessage("Appointment date cannot be in the past.");

        RuleFor(x => x.AppointmentTime)
            .NotEmpty()
            .WithMessage("Appointment time is required.")
            .Must(time => time >= new TimeOnly(16, 0) && time < new TimeOnly(23, 0))
            .WithMessage("Appointments are available from 4:00 PM to 11:00 PM.");

        RuleFor(x => x.Reason)
            .MaximumLength(500)
            .WithMessage("Reason cannot exceed 500 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.Reason));
    }
}
