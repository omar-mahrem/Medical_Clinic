using MedicalClinic.Api.Contract.MedicalRecord;

namespace MedicalClinic.Api.Services;

public interface IMedicalRecordServices
{
    Task<Result<int>> CreateAsync(CreateMedicalRecordRequest request, string doctorUserId, CancellationToken cancellationToken = default);
    Task<Result<MedicalRecordResponse>> GetByIdAsync(int id, string userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<MedicalRecordResponse>> GetPatientHistoryAsync(int patientId, string userId, CancellationToken cancellationToken = default);
    Task<Result> UpdateAsync(int id, UpdateMedicalRecordRequest request, string doctorUserId, CancellationToken cancellationToken = default);
    Task<Result> DeleteAsync(int id, string doctorUserId, CancellationToken cancellationToken = default);
}