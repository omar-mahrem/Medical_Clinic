namespace MedicalClinic.Application.Contract.Doctor;

public record UpdateDoctorRequest(
    string? FirstName,
    string? MiddleName,
    string? LastName,
    string? PhoneNumber,
    DateOnly? DateOfBirth,
    string? Qualifications,
    string? Specialization,
    int? YearsOfExperience,
    TimeOnly? WorkStartTime = null,
    TimeOnly? WorkEndTime = null,
    TimeOnly? EveningStartTime = null,
    TimeOnly? EveningEndTime = null,
    int? SlotDurationMinutes = null,
    decimal? ConsultationFee = null
);