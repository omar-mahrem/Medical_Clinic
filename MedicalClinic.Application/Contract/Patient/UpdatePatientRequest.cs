namespace MedicalClinic.Application.Contract.Patient;

public record UpdatePatientRequest(
    string? FirstName,
    string? MiddleName,
    string? LastName,
    string? PhoneNumber,
    string? Address,
    DateOnly? DateOfBirth
);
