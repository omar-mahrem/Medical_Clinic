namespace MedicalClinic.Api.Contract.Patient;

public class CreatePatientRequestValidator : AbstractValidator<CreatePatientRequest>
{

    public CreatePatientRequestValidator()
    {
        RuleFor(p => p.FirstName)
            .NotEmpty().WithMessage("First name is required.")
            .Length(3, 50).WithMessage("First name must be between 3 and 50 character.");

        RuleFor(p => p.MiddleName)
            .MaximumLength(50)
            .WithMessage("Middle name cannot exceed 50 characters.")
            .When(p => !string.IsNullOrEmpty(p.MiddleName));

        RuleFor(p => p.LastName)
            .NotEmpty().WithMessage("Last name is required.")
            .Length(3, 50).WithMessage("Last name must be between 3 and 50 character.");

        RuleFor(p => p.Email)
            .NotEmpty().WithMessage("Email address is required.")
            .EmailAddress()
            .WithMessage("Invalid email address.");

        RuleFor(p => p.Address)
            .NotEmpty().WithMessage("Address is required.")
            .Length(2, 400).WithMessage("Address must be between 3 and 400 character.");

        RuleFor(p => p.PhoneNumber)
            .NotEmpty().WithMessage("Phone number is required.");

        RuleFor(p => p.Gender)
            .IsInEnum()
            .WithMessage("Invalid gender value.");


        RuleFor(d => d.DateOfBirth)
        .LessThan(DateOnly.FromDateTime(DateTime.Today))
        .WithMessage("Date of birth cannot be in the future.")
        .GreaterThan(DateOnly.FromDateTime(DateTime.Today.AddYears(-100)))
        .WithMessage("Date of birth must be less than 100 years.");

    }
}
