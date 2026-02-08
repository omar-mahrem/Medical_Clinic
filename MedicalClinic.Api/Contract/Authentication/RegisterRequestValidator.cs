using MedicalClinic.Api.Abstractions.Const;

namespace MedicalClinic.Api.Contract.Authentication;

public class RegisterRequestValidator : AbstractValidator<RegisterRequest>
{
    public RegisterRequestValidator()
    {
        RuleFor(u => u.Email)
            .NotEmpty()
            .EmailAddress();

        RuleFor(u => u.Password)
            .Matches(RegexPatterns.Password)
            .WithMessage("Password should be at least 8 digits and should contains Lowercase, NonAlphanumeric and Uppercase");

        RuleFor(u => u.FirstName)
            .NotEmpty()
            .Length(3, 100);
        
        RuleFor(u => u.LastName)
            .NotEmpty()
            .Length(3, 100);
    }
}
