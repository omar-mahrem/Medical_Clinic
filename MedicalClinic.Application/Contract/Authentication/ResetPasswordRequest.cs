namespace MedicalClinic.Application.Contract.Authentication;

public record ResetPasswordRequest(
    string Email,
    string Code,
    string NewPassword
);
