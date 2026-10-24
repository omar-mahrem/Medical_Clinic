namespace MedicalClinic.Application.Contract.User;

public record ChangePasswordRequest(
    string CurrentPassword,
    string NewPassword
);
