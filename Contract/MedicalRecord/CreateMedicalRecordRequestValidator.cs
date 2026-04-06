namespace MedicalClinic.Api.Contract.MedicalRecord;

public class CreateMedicalRecordRequestValidator : AbstractValidator<CreateMedicalRecordRequest>
{
    public CreateMedicalRecordRequestValidator()
    {
        RuleFor(x => x.AppointmentId)
            .GreaterThan(0)
            .WithMessage("Valid appointment is required.");

        RuleFor(x => x.Diagnosis)
            .NotEmpty()
            .WithMessage("Diagnosis is required.")
            .MaximumLength(500)
            .WithMessage("Diagnosis cannot exceed 500 characters.");

        RuleFor(x => x.Symptoms)
            .NotEmpty()
            .WithMessage("Symptoms are required.")
            .MaximumLength(1000)
            .WithMessage("Symptoms cannot exceed 1000 characters.");

        RuleFor(x => x.Treatment)
            .NotEmpty()
            .WithMessage("Treatment is required.")
            .MaximumLength(1000)
            .WithMessage("Treatment cannot exceed 1000 characters.");

        RuleFor(x => x.Notes)
            .MaximumLength(2000)
            .WithMessage("Notes cannot exceed 2000 characters.")
            .When(x => !string.IsNullOrEmpty(x.Notes));

        RuleFor(x => x.Temperature)
            .InclusiveBetween(35, 45)
            .WithMessage("Temperature must be between 35 and 45 celsius.")
            .When(x => x.Temperature.HasValue);

        RuleFor(x => x.HeartRate)
            .InclusiveBetween(40, 200)
            .WithMessage("Heart rate must be between 40 and 200 BPM.")
            .When(x => x.HeartRate.HasValue);

        RuleFor(x => x.Weight)
            .GreaterThan(0)
            .WithMessage("Weight must be greater than 0.")
            .When(x => x.Weight.HasValue);

        RuleFor(x => x.Height)
            .GreaterThan(0)
            .WithMessage("Height must be greater than 0.")
            .When(x => x.Height.HasValue);

        RuleForEach(x => x.Prescriptions)
            .SetValidator(new PrescriptionRequestValidator())
            .When(x => x.Prescriptions is not null);
    }
}