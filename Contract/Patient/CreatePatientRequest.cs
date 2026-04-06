namespace MedicalClinic.Api.Contract.Patient;
public record CreatePatientRequest(
    string FirstName,
    string? MiddleName,
    string LastName,
    string Email,
    string Password,
    string PhoneNumber,
    Gender Gender,
    DateOnly DateOfBirth,
    string Address
);
