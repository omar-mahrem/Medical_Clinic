namespace MedicalClinic.Api.Contract.User;

public class ChangePasswordRequestValidator : AbstractValidator<ChangePasswordRequest>
{
    public ChangePasswordRequestValidator()
    {
        RuleFor(u => u.CurrentPassword)
            .NotEmpty();

        RuleFor(u => u.NewPassword)
            .NotEmpty()
            .Matches(RegexPatterns.Password)
            .WithMessage("Password should be at least 8 digits and should contains Lowercase, NonAlphanumeric and Uppercase")
            .NotEqual(u => u.CurrentPassword)
            .WithMessage("New password cannot be equal to current password");

    }
}
