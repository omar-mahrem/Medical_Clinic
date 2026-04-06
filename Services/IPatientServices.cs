namespace MedicalClinic.Api.Services;

public interface IPatientServices
{
    Task<Result> RegisterAsync(CreatePatientRequest request, CancellationToken cancellationToken = default);
    Task<IEnumerable<PatientResponse>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<PatientResponse>> GetDeletedAsync(CancellationToken cancellationToken = default);
    Task<Result<PatientResponse>> GetAsync(int id, CancellationToken cancellationToken = default);
    Task<Result> UpdateAsync(int id, UpdatePatientRequest request, CancellationToken cancellationToken = default);
    Task<Result> DeleteAsync(int id, CancellationToken cancellationToken = default);
    Task<Result> RestoreAsync(int id, CancellationToken cancellationToken = default);

}
