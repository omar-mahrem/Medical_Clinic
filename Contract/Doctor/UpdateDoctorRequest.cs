namespace MedicalClinic.Api.Contract.Doctor;

public record UpdateDoctorRequest(
    string? FirstName,
    string? MiddleName,
    string? LastName,
    string? PhoneNumber,
    DateOnly? DateOfBirth,
    string? Qualifications,
    string? Specialization,
    int? YearsOfExperience
);