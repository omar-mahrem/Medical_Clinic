namespace MedicalClinic.Api.Contract.Doctor;

public class UpdateDoctorRequestValidator : AbstractValidator<UpdateDoctorRequest>
{
    public UpdateDoctorRequestValidator()
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
            .WithMessage("PhoneNumber length can not be exceeded 30 number and cannot be less than 5")
            .When(d => d.PhoneNumber is not null);

        RuleFor(d => d.Specialization)
            .Length(2, 150)
            .WithMessage("Specialization must be between 2 and 150 characters.")
            .When(d => d.Specialization is not null);

        RuleFor(d => d.Qualifications)
            .Length(2, 500)
            .WithMessage("Qualifications must be between 2 and 500 characters.")
            .When(d => d.Qualifications is not null);

        RuleFor(x => x.YearsOfExperience)
            .InclusiveBetween(0, 100)
            .WithMessage("Years of experience must be between 0 and 100")
            .When(x => x.YearsOfExperience.HasValue);

        RuleFor(d => d.DateOfBirth)
            .LessThan(DateOnly.FromDateTime(DateTime.Today))
            .WithMessage("Date of birth cannot be in the future.")
            .GreaterThan(DateOnly.FromDateTime(DateTime.Today.AddYears(-100)))
            .WithMessage("Age must be less than 100 years.")
            .When(d => d.DateOfBirth.HasValue);

        RuleFor(x => x)
            .Must(x => x.FirstName is not null ||
                      x.LastName is not null ||
                      x.PhoneNumber is not null ||
                      x.DateOfBirth is not null ||
                      x.Qualifications is not null ||
                      x.Specialization is not null ||
                      x.YearsOfExperience is not null ||
                      x.MiddleName is not null)
            .WithMessage("At least one field must be provided for update.");
    }
}