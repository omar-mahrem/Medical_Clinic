namespace MedicalClinic.Application.Contract.Authentication;

public class ResendEmailConfirmationRequestValidator : AbstractValidator<ResendEmailConfirmationRequest>
{
    public ResendEmailConfirmationRequestValidator()
    {
        RuleFor(u => u.Email)
            .NotEmpty()
            .EmailAddress();
    }
}
