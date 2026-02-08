namespace MedicalClinic.Api.Contract.Doctor;

public class DoctorRequestValidator : AbstractValidator<DoctorRequest>
{

    public DoctorRequestValidator()
    {
        RuleFor(d => d.FirstName)
            .NotEmpty().WithMessage("First name is required.")
            .Length(3, 50).WithMessage("First name must be between 3 and 50 character.");

        RuleFor(d => d.MiddleName)
            .MaximumLength(50)
            .WithMessage("Middle name cannot exceed 50 characters.")
            .When(d => !string.IsNullOrEmpty(d.MiddleName));

        RuleFor(d => d.LastName)
            .NotEmpty().WithMessage("Last name is required.")
            .Length(3, 50).WithMessage("Last name must be between 3 and 50 character.");

        RuleFor(d => d.Email)
            .NotEmpty().WithMessage("Email address is required.")
            .EmailAddress()
            .WithMessage("Invalid email address.");

        RuleFor(d => d.PhoneNumber)
            .NotEmpty().WithMessage("Phone number is required.");
                 
        RuleFor(d => d.Specialization)
            .NotEmpty().WithMessage("Specialization is required.")
            .Length(2, 150).WithMessage("Specialization must be between 2 and 150 character.");

        RuleFor(d => d.UserId)
            .Cascade(CascadeMode.Stop)
            .NotEmpty()
            .WithMessage("User Id is required.")
            .Must(id => !string.IsNullOrWhiteSpace(id))
            .WithMessage("UserId cannot be empty or whitespace");

        RuleFor(d => d.DateOfBirth)
            .LessThan(DateOnly.FromDateTime(DateTime.Today))
            .WithMessage("Date of birth cannot be in the future.")
            .GreaterThan(DateOnly.FromDateTime(DateTime.Today.AddYears(-100)))
            .WithMessage("ge must be less than 100 years.");
    }
}
