using MedicalClinic.Api.Contract.MedicalRecord;

namespace MedicalClinic.Api.Services;

public class MedicalRecordServices(
    ApplicationDbContext context,
    ILogger<MedicalRecordServices> logger) : IMedicalRecordServices
{
    private readonly ApplicationDbContext _context = context;
    private readonly ILogger<MedicalRecordServices> _logger = logger;

    public async Task<Result<int>> CreateAsync(CreateMedicalRecordRequest request, string doctorUserId, CancellationToken cancellationToken = default)
    {
        // 1. Get doctor
        var doctor = await _context.Doctors
            .FirstOrDefaultAsync(d => d.UserId == doctorUserId, cancellationToken);

        if (doctor is null)
            return Result.Failure<int>(DoctorErrors.DoctorNotFound);

        // 2. Get appointment
        var appointment = await _context.Appointments
            .Include(a => a.Patient)
            .FirstOrDefaultAsync(a => a.Id == request.AppointmentId && !a.IsDeleted, cancellationToken);

        if (appointment is null)
            return Result.Failure<int>(AppointmentErrors.AppointmentNotFound);

        // 3. Check if appointment is completed
        if (appointment.Status != AppointmentStatus.Completed)
            return Result.Failure<int>(MedicalRecordErrors.AppointmentNotCompleted);

        // 4. Check if appointment belongs to this doctor
        if (appointment.DoctorId != doctor.Id)
            return Result.Failure<int>(MedicalRecordErrors.NotAuthorized);

        // 5. Check if medical record already exists
        var exists = await _context.MedicalRecords
            .AnyAsync(m => m.AppointmentId == request.AppointmentId, cancellationToken);

        if (exists)
            return Result.Failure<int>(MedicalRecordErrors.RecordAlreadyExists);

        // 6. Create medical record
        var medicalRecord = new MedicalRecord
        {
            AppointmentId = request.AppointmentId,
            PatientId = appointment.PatientId,
            DoctorId = doctor.Id,
            Diagnosis = request.Diagnosis,
            Symptoms = request.Symptoms,
            Treatment = request.Treatment,
            Notes = request.Notes,
            Temperature = request.Temperature,
            BloodPressure = request.BloodPressure,
            HeartRate = request.HeartRate,
            Weight = request.Weight,
            Height = request.Height,
            CreatedAt = DateTime.UtcNow
        };

        // 7. Add prescriptions if any
        if (request.Prescriptions is not null && request.Prescriptions.Count > 0)
        {
            foreach (var prescriptionRequest in request.Prescriptions)
            {
                var prescription = new Prescription
                {
                    MedicationName = prescriptionRequest.MedicationName,
                    Dosage = prescriptionRequest.Dosage,
                    Frequency = prescriptionRequest.Frequency,
                    Duration = prescriptionRequest.Duration,
                    Instructions = prescriptionRequest.Instructions!,
                    CreatedAt = DateTime.UtcNow
                };

                medicalRecord.Prescriptions.Add(prescription);
            }
        }

        await _context.MedicalRecords.AddAsync(medicalRecord, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Medical record created. MedicalRecordId: {Id}, AppointmentId: {AppointmentId}, DoctorId: {DoctorId}",
            medicalRecord.Id, request.AppointmentId, doctor.Id);

        return Result.Success(medicalRecord.Id);
    }

    public async Task<Result<MedicalRecordResponse>> GetByIdAsync(int id, string userId, CancellationToken cancellationToken = default)
    {
        var medicalRecord = await _context.MedicalRecords  //ToDo => ToResponse
            .Where(m => m.Id == id)
            .Select(m => new MedicalRecordResponse
            {
                Id = m.Id,
                AppointmentId = m.AppointmentId,
                AppointmentDate = m.Appointment.AppointmentDate,
                PatientId = m.PatientId,
                PatientName = m.Patient.User.FullName,
                DoctorId = m.DoctorId,
                DoctorName = m.Doctor.User.FullName,
                DoctorSpecialization = m.Doctor.Specialization,
                Diagnosis = m.Diagnosis,
                Symptoms = m.Symptoms,
                Treatment = m.Treatment,
                Notes = m.Notes,
                Temperature = m.Temperature,
                BloodPressure = m.BloodPressure,
                HeartRate = m.HeartRate,
                Weight = m.Weight,
                Height = m.Height,
                Prescriptions = m.Prescriptions.Select(p => new PrescriptionResponse
                {
                    Id = p.Id,
                    MedicationName = p.MedicationName,
                    Dosage = p.Dosage,
                    Frequency = p.Frequency,
                    Duration = p.Duration,
                    Instructions = p.Instructions,
                    CreatedAt = p.CreatedAt
                }).ToList(),
                CreatedAt = m.CreatedAt,
                UpdatedAt = m.UpdatedAt
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (medicalRecord is null)
            return Result.Failure<MedicalRecordResponse>(MedicalRecordErrors.MedicalRecordNotFound);

        // Check authorization: patient can view their own records, doctor can view their records
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
        if (user is null)
            return Result.Failure<MedicalRecordResponse>(UserErrors.UserNotFounded);

        var isPatient = await _context.Patients.AnyAsync(p => p.UserId == userId && p.Id == medicalRecord.PatientId, cancellationToken);
        var isDoctor = await _context.Doctors.AnyAsync(d => d.UserId == userId && d.Id == medicalRecord.DoctorId, cancellationToken);
        var isAdmin = await _context.UserRoles.AnyAsync(ur => ur.UserId == userId && ur.RoleId == DefaultRoles.AdminRoleId, cancellationToken);

        if (!isPatient && !isDoctor && !isAdmin)
            return Result.Failure<MedicalRecordResponse>(MedicalRecordErrors.NotAuthorized);

        return Result.Success(medicalRecord);
    }

    public async Task<IEnumerable<MedicalRecordResponse>> GetPatientHistoryAsync(int patientId, string userId, CancellationToken cancellationToken = default)
    {
        // Check authorization
        var isPatient = await _context.Patients.AnyAsync(p => p.UserId == userId && p.Id == patientId, cancellationToken);
        var isDoctor = await _context.Doctors.AnyAsync(d => d.UserId == userId, cancellationToken);
        var isAdmin = await _context.UserRoles.AnyAsync(ur => ur.UserId == userId && ur.RoleId == DefaultRoles.AdminRoleId, cancellationToken);

        if (!isPatient && !isDoctor && !isAdmin)
            return Enumerable.Empty<MedicalRecordResponse>();

        var records = await _context.MedicalRecords
            .Where(m => m.PatientId == patientId)
            .OrderByDescending(m => m.CreatedAt)
            .Select(m => new MedicalRecordResponse
            {
                Id = m.Id,
                AppointmentId = m.AppointmentId,
                AppointmentDate = m.Appointment.AppointmentDate,
                PatientId = m.PatientId,
                PatientName = m.Patient.User.FullName,
                DoctorId = m.DoctorId,
                DoctorName = m.Doctor.User.FullName,
                DoctorSpecialization = m.Doctor.Specialization,
                Diagnosis = m.Diagnosis,
                Symptoms = m.Symptoms,
                Treatment = m.Treatment,
                Notes = m.Notes,
                Temperature = m.Temperature,
                BloodPressure = m.BloodPressure,
                HeartRate = m.HeartRate,
                Weight = m.Weight,
                Height = m.Height,
                Prescriptions = m.Prescriptions.Select(p => new PrescriptionResponse
                {
                    Id = p.Id,
                    MedicationName = p.MedicationName,
                    Dosage = p.Dosage,
                    Frequency = p.Frequency,
                    Duration = p.Duration,
                    Instructions = p.Instructions,
                    CreatedAt = p.CreatedAt
                }).ToList(),
                CreatedAt = m.CreatedAt,
                UpdatedAt = m.UpdatedAt
            })
            .ToListAsync(cancellationToken);

        return records;
    }

    public async Task<Result> UpdateAsync(int id, UpdateMedicalRecordRequest request, string doctorUserId, CancellationToken cancellationToken = default)
    {
        var doctor = await _context.Doctors
            .FirstOrDefaultAsync(d => d.UserId == doctorUserId, cancellationToken);

        if (doctor is null)
            return Result.Failure(DoctorErrors.DoctorNotFound);

        var medicalRecord = await _context.MedicalRecords
            .FirstOrDefaultAsync(m => m.Id == id, cancellationToken);

        if (medicalRecord is null)
            return Result.Failure(MedicalRecordErrors.MedicalRecordNotFound);

        if (medicalRecord.DoctorId != doctor.Id)
            return Result.Failure(MedicalRecordErrors.NotAuthorized);

        // Update fields
        if (request.Diagnosis is not null)
            medicalRecord.Diagnosis = request.Diagnosis;

        if (request.Symptoms is not null)
            medicalRecord.Symptoms = request.Symptoms;

        if (request.Treatment is not null)
            medicalRecord.Treatment = request.Treatment;

        if (request.Notes is not null)
            medicalRecord.Notes = request.Notes;

        if (request.Temperature.HasValue)
            medicalRecord.Temperature = request.Temperature;

        if (request.BloodPressure is not null)
            medicalRecord.BloodPressure = request.BloodPressure;

        if (request.HeartRate.HasValue)
            medicalRecord.HeartRate = request.HeartRate;

        if (request.Weight.HasValue)
            medicalRecord.Weight = request.Weight;

        if (request.Height.HasValue)
            medicalRecord.Height = request.Height;

        medicalRecord.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Medical record updated. MedicalRecordId: {Id}, DoctorId: {DoctorId}",
            id, doctor.Id);

        return Result.Success();
    }

    public async Task<Result> DeleteAsync(int id, string doctorUserId, CancellationToken cancellationToken = default)
    {
        var doctor = await _context.Doctors
            .FirstOrDefaultAsync(d => d.UserId == doctorUserId, cancellationToken);

        if (doctor is null)
            return Result.Failure(DoctorErrors.DoctorNotFound);

        var medicalRecord = await _context.MedicalRecords
            .Include(m => m.Prescriptions)
            .FirstOrDefaultAsync(m => m.Id == id, cancellationToken);

        if (medicalRecord is null)
            return Result.Failure(MedicalRecordErrors.MedicalRecordNotFound);

        if (medicalRecord.DoctorId != doctor.Id)
            return Result.Failure(MedicalRecordErrors.NotAuthorized);

        // Soft delete
        medicalRecord.IsDeleted = true;
        medicalRecord.UpdatedAt = DateTime.UtcNow;

        foreach (var prescription in medicalRecord.Prescriptions)
        {
            prescription.IsDeleted = true;
        }

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Medical record deleted. MedicalRecordId: {Id}, DoctorId: {DoctorId}",
            id, doctor.Id);

        return Result.Success();
    }
}