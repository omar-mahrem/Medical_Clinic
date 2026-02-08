namespace MedicalClinic.Api.Contract.Authentication;

public record ConfirmEmailRequest(
    string UserId,
    string Code
);