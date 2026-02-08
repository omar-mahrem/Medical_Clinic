namespace MedicalClinic.Api.Contract.Patient;
public record PatientRequest(
    string FirstName,
    string? MiddleName,
    string LastName,
    string Address,
    string Email,
    string PhoneNumber,
    Gender Gender,
    string UserId,
    DateOnly DateOfBirth
);
