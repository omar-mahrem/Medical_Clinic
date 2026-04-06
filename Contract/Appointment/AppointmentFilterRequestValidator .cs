namespace MedicalClinic.Api.Contract.Appointment;

public class AppointmentFilterRequestValidator : AbstractValidator<AppointmentFilterRequest>
{
    public AppointmentFilterRequestValidator()
    {
        RuleFor(x => x.Type)
            .IsInEnum()
            .WithMessage("Invalid appointment type.")
            .When(x => x.Type.HasValue);

        RuleFor(x => x.Status)
            .IsInEnum()
            .WithMessage("Invalid appointment status.")
            .When(x => x.Status.HasValue);

        RuleFor(x => x.ToDate)
            .GreaterThanOrEqualTo(x => x.FromDate!.Value)
            .WithMessage("ToDate must be greater than or equal to FromDate.")
            .When(x => x.FromDate.HasValue && x.ToDate.HasValue);

        RuleFor(x => x.DoctorId)
            .GreaterThan(0)
            .WithMessage("Invalid doctor ID.")
            .When(x => x.DoctorId.HasValue);

        RuleFor(x => x.PatientId)
            .GreaterThan(0)
            .WithMessage("Invalid patient ID.")
            .When(x => x.PatientId.HasValue);
    }
}