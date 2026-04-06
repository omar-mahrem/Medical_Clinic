namespace MedicalClinic.Api.Contract.MedicalRecord;

public class PrescriptionRequestValidator : AbstractValidator<PrescriptionRequest>
{
    public PrescriptionRequestValidator()
    {
        RuleFor(x => x.MedicationName)
            .NotEmpty()
            .WithMessage("Medication name is required.")
            .MaximumLength(200)
            .WithMessage("Medication name cannot exceed 200 characters.");

        RuleFor(x => x.Dosage)
            .NotEmpty()
            .WithMessage("Dosage is required.")
            .MaximumLength(100)
            .WithMessage("Dosage cannot exceed 100 characters.");

        RuleFor(x => x.Frequency)
            .NotEmpty()
            .WithMessage("Frequency is required.")
            .MaximumLength(200)
            .WithMessage("Frequency cannot exceed 200 characters.");

        RuleFor(x => x.Duration)
            .GreaterThan(0)
            .WithMessage("Duration must be greater than 0 days.");

        RuleFor(x => x.Instructions)
            .MaximumLength(500)
            .WithMessage("Instructions cannot exceed 500 characters.")
            .When(x => !string.IsNullOrEmpty(x.Instructions));
    }
}