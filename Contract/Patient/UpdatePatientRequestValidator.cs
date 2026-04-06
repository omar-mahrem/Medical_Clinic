namespace MedicalClinic.Api.Contract.Patient;

public class UpdatePatientRequestValidator : AbstractValidator<UpdatePatientRequest>
{
    public UpdatePatientRequestValidator()
    {
        RuleFor(d => d.FirstName)
            .Length(3, 50)
            .WithMessage("First name must be between 3 and 50 characters.")
            .When(d => d.FirstName is not null);

        RuleFor(d => d.MiddleName)
                .MaximumLength(50)
                .WithMessage("Middle name cannot exceed 50 characters.")
                .When(d => d.MiddleName is not null);

        RuleFor(d => d.LastName)
                .Length(3, 50)
                .WithMessage("Last name must be between 3 and 50 characters.")
                .When(d => d.LastName is not null);

        RuleFor(d => d.PhoneNumber)
                .Length(5, 30)
                .WithMessage("PhoneNumber length can not be exceded 30 number and cannot be less than 5 number")
                .When(d => d.PhoneNumber is not null);

        RuleFor(d => d.Address)
                .Length(2, 200)
                .WithMessage("Last name must be between 3 and 200 characters.")
                .When(d => d.Address is not null);


        RuleFor(d => d.DateOfBirth)
                .LessThan(DateOnly.FromDateTime(DateTime.Today))
                .WithMessage("Date of birth cannot be in the future.")
                .GreaterThan(DateOnly.FromDateTime(DateTime.Today.AddYears(-100)))
                .WithMessage("Age must be less than 100 years.")
                .When(d => d.DateOfBirth.HasValue);

        RuleFor(x => x)
                .Must(x => x.FirstName is not null ||
                          x.MiddleName is not null ||
                          x.LastName is not null ||
                          x.PhoneNumber is not null ||
                          x.Address is not null ||
                          x.DateOfBirth is not null)
                .WithMessage("At least one field must be provided for update.");
    }
}
