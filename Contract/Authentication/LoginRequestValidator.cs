namespace MedicalClinic.Api.Contract.Authentication;

public class LoginRequestValidator : AbstractValidator<LoginRequest>
{
    public LoginRequestValidator()
    {

        RuleFor(d => d.Email)
            .NotEmpty()
            .EmailAddress();

        RuleFor(d => d.Password)
            .NotEmpty();

    }
}
