namespace MedicalClinic.Application.Contract.Authentication;

public class RefreshTokenRequestValidator : AbstractValidator<RefreshTokenRequest>
{
    public RefreshTokenRequestValidator()
    {

        RuleFor(d => d.Token)
            .NotEmpty();

        RuleFor(d => d.RefreshToken)
            .NotEmpty();

    }
}
