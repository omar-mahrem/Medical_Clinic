namespace MedicalClinic.Api.Services;

public interface IDoctorServices
{
    Task<Result> AddAsync(CreateDoctorRequest request, CancellationToken cancellationToken = default);
    Task<IEnumerable<DoctorResponse>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<DoctorResponse>> GetAvailableAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<DoctorResponse>> GetDeletedAsync(CancellationToken cancellationToken = default);
    Task<Result<DoctorResponse>> GetAsync(int id, CancellationToken cancellationToken = default);
    Task<Result> UpdateAsync(int id, UpdateDoctorRequest request, CancellationToken cancellationToken = default);
    Task<Result> DeleteAsync(int id, CancellationToken cancellationToken = default);
    Task<Result> RestoreAsync(int id, CancellationToken cancellationToken = default);
    Task<Result> ToggleAvailabilityAsync(int id, CancellationToken cancellationToken = default);
    Task<IEnumerable<string>> GetSpecializationsAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<DoctorResponse>> GetBySpecializationAsync(string specialization, CancellationToken cancellationToken = default);

}
