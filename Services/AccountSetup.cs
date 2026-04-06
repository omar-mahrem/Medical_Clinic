using Microsoft.AspNetCore.WebUtilities;
using System.Text;

namespace MedicalClinic.Api.Services;

public class AccountSetup(
    UserManager<ApplicationUser> userManager,
    ILogger<DoctorServices> logger) : IAccountSetup
{
    private readonly UserManager<ApplicationUser> _userManager = userManager;
    private readonly ILogger<DoctorServices> _logger = logger;

    public async Task<Result<SetupValidationResponse>> ValidateSetupLink(string userId, string token)
    {
        var user = await _userManager.FindByIdAsync(userId);

        if (user is null)
            return Result.Failure<SetupValidationResponse>(UserErrors.UserNotFounded);

        if (user.EmailConfirmed)
            return Result.Failure<SetupValidationResponse>(UserErrors.DuplicatedConfirmation);

        // validation للـ token
        try
        {
            var decodedToken = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(token));

            var isValidToken = await _userManager.VerifyUserTokenAsync(
                user,
                _userManager.Options.Tokens.EmailConfirmationTokenProvider,
                "EmailConfirmation",
                decodedToken
            );

            if (!isValidToken)
                return Result.Failure<SetupValidationResponse>(UserErrors.InvalidCode);
        }
        catch (FormatException)
        {
            return Result.Failure<SetupValidationResponse>(UserErrors.InvalidCode);
        }

        var response = new SetupValidationResponse(
            IsValid: true,
            UserId: userId,
            Token: token,
            Email: user.Email!,
            FullName: $"{user.FirstName} {user.LastName}"
        );

        return Result.Success(response);
    }

    public async Task<Result> CompleteAccountSetup(SetupPasswordRequest request)
    {
        if (request.Password != request.ConfirmPassword)
            return Result.Failure(UserErrors.NotMatchedPassword);

        var user = await _userManager.FindByIdAsync(request.UserId);

        if (user is null)
            return Result.Failure<SetupValidationResponse>(UserErrors.UserNotFounded);

        if (user.EmailConfirmed)
            return Result.Failure<SetupValidationResponse>(UserErrors.DuplicatedConfirmation);

        // ✅ Validate password strength BEFORE confirming email
        var passwordValidator = new PasswordValidator<ApplicationUser>();
        var passwordValidation = await passwordValidator.ValidateAsync(_userManager, user, request.Password);

        if (!passwordValidation.Succeeded)
        {
            var error = passwordValidation.Errors.First();
            return Result.Failure(new Error(error.Code, error.Description, StatusCodes.Status400BadRequest));
        }

        var token = request.Token;

        try
        {
            token = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(token));
        }
        catch (FormatException)
        {
            return Result.Failure(UserErrors.InvalidCode);
        }

        var confirmResult = await _userManager.ConfirmEmailAsync(user, token);

        if (!confirmResult.Succeeded)
            return Result.Failure(UserErrors.ConfirmationFailed);


        var addPasswordResult = await _userManager.AddPasswordAsync(user, request.Password);

        if (!addPasswordResult.Succeeded)
        {
            user.EmailConfirmed = false;
            await _userManager.UpdateAsync(user);

            var error = addPasswordResult.Errors.First();
            return Result.Failure(new Error(error.Code, error.Description, StatusCodes.Status400BadRequest));
        }

        _logger.LogInformation("Account activated successfully. Email: {Email}", user.Email);

        return Result.Success();

    }
}
