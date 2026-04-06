using MedicalClinic.Api.Contract.Appointment;
using MedicalClinic.Api.Contract.Common;

namespace MedicalClinic.Api.Services;

public interface IAppointmentServices
{
    Task<Result<AppointmentResponse>> GetByIdAsync(int id, string patientUserId, CancellationToken cancellationToken = default);
    Task<IEnumerable<AppointmentResponse>> GetMyAppointmentsAsync(string patientUserId, CancellationToken cancellationToken = default);
    Task<IEnumerable<AppointmentResponse>> GetDoctorAppointmentsAsync(string doctorUserId, DateOnly? date, CancellationToken cancellationToken = default);
    Task<Result<int>> BookAppointmentAsync(CreateAppointmentRequest request, string patientUserId, CancellationToken cancellationToken = default);
    Task<Result> UpdateAsync(int id, UpdateAppointmentRequest request, string patientUserId, CancellationToken cancellationToken = default);
    Task<Result<DoctorAvailabilityResponse>> GetDoctorAvailabilityAsync(int doctorId, DateOnly date, CancellationToken cancellationToken = default);
    Task<Result> CancelAppointmentAsync(int id, string patientUserId, CancellationToken cancellationToken = default);
    Task<Result> ChangeStatusAsync(int id, ChangeStatusRequest request, CancellationToken cancellationToken = default);

    Task<PaginatedList<AppointmentResponse>> GetAllAsync(AppointmentFilterRequest filter, RequestFilters paginationFilter, CancellationToken cancellationToken = default);
    //Task<IEnumerable<AppointmentResponse>> GetAllAsync(AppointmentFilterRequest filter, CancellationToken cancellationToken = default);
}
