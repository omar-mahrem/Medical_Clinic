namespace MedicalClinic.Application.Contract.Doctor;
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
    int YearsOfExperience,
    TimeOnly? WorkStartTime = null,
    TimeOnly? WorkEndTime = null,
    TimeOnly? EveningStartTime = null,
    TimeOnly? EveningEndTime = null,
    int? SlotDurationMinutes = null,
    decimal? ConsultationFee = null,
    string? Password = null
);
