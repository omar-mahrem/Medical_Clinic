using MedicalClinic.Api.Contract.Doctor;

namespace MedicalClinic.Api.Services;

public interface IDoctorServices
{
    Task<IEnumerable<DoctorResponse>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<DoctorResponse>> GetAvailableAsync(CancellationToken cancellationToken = default);
    Task<Result<DoctorResponse>> GetAsync(int id, CancellationToken cancellationToken = default);
    Task<Result<DoctorResponse>> AddAsync(DoctorRequest request, CancellationToken cancellationToken = default);
    Task<Result> UpdateAsync(int id, DoctorRequest request, CancellationToken cancellationToken = default);
    Task<Result> DeleteAsync(int id, CancellationToken cancellationToken = default);
    Task<Result> ToggleAvailableAsync(int id, CancellationToken cancellationToken = default);
}
