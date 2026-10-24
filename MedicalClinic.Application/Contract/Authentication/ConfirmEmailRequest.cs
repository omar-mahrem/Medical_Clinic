namespace MedicalClinic.Application.Contract.Authentication;

public record ConfirmEmailRequest(
    string UserId,
    string Code
);