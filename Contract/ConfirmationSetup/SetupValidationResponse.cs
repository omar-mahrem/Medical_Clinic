namespace MedicalClinic.Api.Contract.ConfirmationSetup;

public record SetupValidationResponse(
    bool IsValid,
    string UserId,
    string Token,
    string Email,
    string FullName
);
