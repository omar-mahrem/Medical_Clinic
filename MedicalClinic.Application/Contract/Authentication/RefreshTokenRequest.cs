namespace MedicalClinic.Application.Contract.Authentication;

public record RefreshTokenRequest(
    string Token,
    string RefreshToken
);
