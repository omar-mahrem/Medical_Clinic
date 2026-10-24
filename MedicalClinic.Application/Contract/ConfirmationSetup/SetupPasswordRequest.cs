namespace MedicalClinic.Application.Contract.ConfirmationSetup;

public record SetupPasswordRequest(
    string UserId,
    string Token,
    string Password,
    string ConfirmPassword
);