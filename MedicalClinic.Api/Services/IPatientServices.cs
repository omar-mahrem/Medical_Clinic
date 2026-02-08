namespace MedicalClinic.Api.Services;

public interface IPatientServices
{
    Task<IEnumerable<PatientResponse>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<PatientResponse>> GetCurrentAsync(CancellationToken cancellationToken = default);
    Task<Result<PatientResponse>> GetAsync(int id, CancellationToken cancellationToken = default);
    Task<Result<PatientResponse>> AddAsync(PatientRequest request, CancellationToken cancellationToken = default);
    Task<Result> UpdateAsync(int id, PatientRequest request, CancellationToken cancellationToken = default);
}
