using MedicalClinic.Api.Contract.Appointment;

namespace MedicalClinic.Api.Extentions;

public static class AppointmentQueryExtensions
{
    public static IQueryable<AppointmentResponse> ToAppointmentResponse(this IQueryable<Appointment> query)
    {
        return query
            .AsNoTracking()
            .Select(a => new AppointmentResponse
            {
                Id = a.Id,
                PatientId = a.PatientId,
                PatientName = a.Patient.User.FullName,
                PatientPhone = a.Patient.User.PhoneNumber,
                DoctorId = a.DoctorId,
                DoctorName = a.Doctor.User.FullName,
                DoctorSpecialization = a.Doctor.Specialization,
                Type = a.Type,
                AppointmentDate = a.AppointmentDate,
                AppointmentTime = a.AppointmentTime,
                Status = a.Status,
                Reason = a.Reason,
                CreatedAt = a.CreatedAt,
                UpdatedAt = a.UpdatedAt
            });
    }
}
