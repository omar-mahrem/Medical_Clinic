namespace MedicalClinic.Api.Contract.User;

public class UpdateProfileRequestValidator : AbstractValidator<UpdateProfileRequest>
{
    public UpdateProfileRequestValidator()
    {
        RuleFor(u => u.FirstName)
            .NotEmpty()
            .Length(2, 100);


        RuleFor(u => u.MiddleName)
            .MaximumLength(50)
            .When(p => !string.IsNullOrEmpty(p.MiddleName));

        RuleFor(u => u.LastName)
            .NotEmpty()
            .Length(2, 100);
    }
}
