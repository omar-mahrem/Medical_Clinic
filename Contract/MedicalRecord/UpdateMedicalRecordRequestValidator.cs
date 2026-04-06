namespace MedicalClinic.Api.Contract.MedicalRecord;

public class UpdateMedicalRecordRequestValidator : AbstractValidator<UpdateMedicalRecordRequest>
{
    public UpdateMedicalRecordRequestValidator()
    {
        RuleFor(x => x.Diagnosis)
            .MaximumLength(500)
            .WithMessage("Diagnosis cannot exceed 500 characters.")
            .When(x => !string.IsNullOrEmpty(x.Diagnosis));

        RuleFor(x => x.Symptoms)
            .MaximumLength(1000)
            .WithMessage("Symptoms cannot exceed 1000 characters.")
            .When(x => !string.IsNullOrEmpty(x.Symptoms));

        RuleFor(x => x.Treatment)
            .MaximumLength(1000)
            .WithMessage("Treatment cannot exceed 1000 characters.")
            .When(x => !string.IsNullOrEmpty(x.Treatment));

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
    }
}