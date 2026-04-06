namespace MedicalClinic.Api.Errors;

public record UserErrors
{
    public static readonly Error InvalidCredentials =
    new("User.InvalidCredentials", "Invalid email/password", StatusCodes.Status401Unauthorized);

    public static readonly Error InvalidJwtToken =
        new("User.InvalidJwtToken", "Invalid Jwt token", StatusCodes.Status401Unauthorized);

    public static readonly Error InvalidRefreshToken =
        new("User.InvalidRefreshToken", "Invalid refresh token", StatusCodes.Status401Unauthorized);

    public static readonly Error DuplicatedEmail =
        new("User.DuplicatedEmail", "Email is already registered.", StatusCodes.Status409Conflict);

    public static readonly Error EmailNotConfirmed =
        new("User.EmailNotConfirmed", "Email is not confirmed", StatusCodes.Status401Unauthorized);

    public static readonly Error InvalidCode =
        new("User.InvalidCode", "Invalid code", StatusCodes.Status401Unauthorized);

    public static readonly Error InvalidRoles =
        new("User.InvalidRoles", "Invalid roles", StatusCodes.Status400BadRequest);

    public static readonly Error DuplicatedConfirmation =
        new("User.DuplicatedConfirmation", "Email already confirmed", StatusCodes.Status400BadRequest);

    public static readonly Error UserNotFounded =
        new("User.UserNotFounded", "User with id not founded", StatusCodes.Status404NotFound);

    public static readonly Error DuplicatedUserId =
        new("User.DuplicatedUserId", "This id had been already used", StatusCodes.Status409Conflict);

    public static readonly Error DeletedUser =
        new("User.Deleted", "This account has been deleted. Please contact administrator.", StatusCodes.Status401Unauthorized);


    public static readonly Error LockedUser =
        new("User.LockedUser", "Locked User. Please contact administrator.", StatusCodes.Status401Unauthorized);

    public static readonly Error UnAuthenticated =
        new("User.UnAuthenticated", "User not authenticated", StatusCodes.Status401Unauthorized);

    public static readonly Error NotMatchedPassword =
        new("User.NotMatchedPassword", "Passwords do not match", StatusCodes.Status400BadRequest);

    public static readonly Error ConfirmationFailed =
        new("User.ConfirmationFailed", "Invalid or expired token", StatusCodes.Status400BadRequest);

    public static readonly Error CreationFailed =
        new("User.CreationFailed", "Failed to create user", StatusCodes.Status400BadRequest);

    public static readonly Error SetupRequired =
        new("User.SetupRequired", "Please complete your account setup by setting a password first.", StatusCodes.Status400BadRequest);

}
