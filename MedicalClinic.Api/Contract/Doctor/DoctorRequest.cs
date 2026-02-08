namespace MedicalClinic.Api.Contract.Doctor;
public record DoctorRequest(
    string FirstName,
    string? MiddleName,
    string LastName,
    string Email,
    string PhoneNumber,
    string Specialization,
    string UserId,
    DateOnly DateOfBirth
);
