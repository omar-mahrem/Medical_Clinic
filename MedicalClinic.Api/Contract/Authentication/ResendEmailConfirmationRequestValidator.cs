namespace MedicalClinic.Api.Contract.Authentication;

public class ResendEmailConfirmationRequestValidator : AbstractValidator<ResendEmailConfirmationRequest>
{
    public ResendEmailConfirmationRequestValidator()
    {
        RuleFor(u => u.Email)
            .NotEmpty()
            .EmailAddress();
    }
}
