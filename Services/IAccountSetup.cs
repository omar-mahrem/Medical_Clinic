namespace MedicalClinic.Api.Services;

public interface IAccountSetup
{
    Task<Result<SetupValidationResponse>> ValidateSetupLink(string userId, string token);
    Task<Result> CompleteAccountSetup(SetupPasswordRequest request);
}
