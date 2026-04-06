namespace MedicalClinic.Api.Contract.Authentication;

public record ResetPasswordRequest(
    string Email,
    string Code,
    string NewPassword
);
