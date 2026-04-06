namespace MedicalClinic.Api.Contract.Authentication;

public record RefreshTokenRequest(
    string Token,
    string RefreshToken
);
