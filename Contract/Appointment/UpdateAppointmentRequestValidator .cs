namespace MedicalClinic.Api.Contract.Appointment;

public class UpdateAppointmentRequestValidator : AbstractValidator<UpdateAppointmentRequest>
{
    public UpdateAppointmentRequestValidator()
    {

        RuleFor(x => x.AppointmentDate)
            .GreaterThanOrEqualTo(DateOnly.FromDateTime(DateTime.Today))
            .WithMessage("Appointment date cannot be in the past.")
            .When(x => x.AppointmentDate is not null);

        RuleFor(x => x.AppointmentTime)
            .Must(time => time >= new TimeOnly(16, 0) && time < new TimeOnly(23, 0))
            .WithMessage("Appointments are available from 4:00 PM to 11:00 PM.")
            .When(x => x.AppointmentTime is not null);

        RuleFor(x => x.Reason)
            .MaximumLength(500)
            .WithMessage("Reason cannot exceed 500 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.Reason));

        RuleFor(x => x.Type)
            .IsInEnum()
            .WithMessage("Invalid appointment type.")
            .When(x => x.Type.HasValue);

        // At least one field must be provided
        RuleFor(x => x)
            .Must(x => x.AppointmentDate != null ||
                      x.AppointmentTime != null ||
                      x.Reason != null ||
                      x.Type.HasValue)
            .WithMessage("At least one field must be provided for update.");
    }
}