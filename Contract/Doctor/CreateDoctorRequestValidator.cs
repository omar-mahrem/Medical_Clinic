namespace MedicalClinic.Api.Contract.Doctor;

public class CreateDoctorRequestValidator : AbstractValidator<CreateDoctorRequest>
{

    public CreateDoctorRequestValidator()
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

        RuleFor(d => d.DateOfBirth)
                .LessThan(DateOnly.FromDateTime(DateTime.Today))
                .WithMessage("Date of birth cannot be in the future.")
                .GreaterThan(DateOnly.FromDateTime(DateTime.Today.AddYears(-100)))
                .WithMessage("Date of birth must be less than 100 years.");

        RuleFor(d => d.Gender)
            .IsInEnum()
            .WithMessage("Invalid gender value.");

        RuleFor(d => d.Specialization)
            .NotEmpty().WithMessage("Specialization is required.")
            .Length(2, 150).WithMessage("Specialization must be between 2 and 150 character.");

        RuleFor(d => d.Qualifications)
            .NotEmpty().WithMessage("Qualifications is required.")
            .Length(2, 150).WithMessage("Qualifications must be between 2 and 150 character.");

        RuleFor(d => d.LicenseNumber)
            .NotEmpty().WithMessage("License number is required.")
            .MaximumLength(30)
            .WithMessage("License number cannot exceed 30 characters.");

        RuleFor(x => x.YearsOfExperience)
            .InclusiveBetween(0, 100)
            .WithMessage("Years of experience must be between 0 and 100");


        //RuleFor(d => d.ApprovedById)
        //    .Cascade(CascadeMode.Stop)
        //    .NotEmpty()
        //    .WithMessage("Creation user Id is required.")
        //    .Must(id => !string.IsNullOrWhiteSpace(id))
        //    .WithMessage("CreatedById cannot be empty or whitespace");
    }
}
