namespace MedicalClinic.Api.Contract.Doctor;
public record CreateDoctorRequest(
    string FirstName,
    string? MiddleName,
    string LastName,
    string Email,
    string PhoneNumber,
    DateOnly DateOfBirth,
    Gender Gender,
    string Qualifications,
    string Specialization,
    string LicenseNumber,
    int YearsOfExperience

);
