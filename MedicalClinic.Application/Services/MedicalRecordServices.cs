using MedicalClinic.Application.Contract.MedicalRecord;

namespace MedicalClinic.Application.Services;

public class MedicalRecordServices(
    IApplicationDbContext context,
    ILogger<MedicalRecordServices> logger) : IMedicalRecordServices
{
    private readonly IApplicationDbContext _context = context;
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

        // 3. Check if appointment is cancelled
        if (appointment.Status == AppointmentStatus.Cancelled)
            return Result.Failure<int>(AppointmentErrors.AlreadyCancelled);

        // Auto mark appointment as Completed when medical record/prescription is created
        appointment.Status = AppointmentStatus.Completed;
        appointment.UpdatedAt = DateTime.UtcNow;

        // 4. Check if appointment belongs to this doctor
        if (appointment.DoctorId != doctor.Id)
            return Result.Failure<int>(MedicalRecordErrors.NotAuthorized);

        // 5. Check if medical record already exists - if so, update it seamlessly (Upsert)
        var existingRecord = await _context.MedicalRecords
            .Include(m => m.Prescriptions)
            .FirstOrDefaultAsync(m => m.AppointmentId == request.AppointmentId, cancellationToken);

        if (existingRecord != null)
        {
            if (existingRecord.DoctorId != doctor.Id)
                return Result.Failure<int>(MedicalRecordErrors.NotAuthorized);

            existingRecord.Diagnosis = request.Diagnosis;
            existingRecord.Symptoms = request.Symptoms ?? string.Empty;
            existingRecord.Treatment = request.Treatment ?? string.Empty;
            existingRecord.Notes = request.Notes ?? string.Empty;
            existingRecord.Temperature = request.Temperature;
            existingRecord.BloodPressure = request.BloodPressure;
            existingRecord.HeartRate = request.HeartRate;
            existingRecord.Weight = request.Weight;
            existingRecord.Height = request.Height;
            existingRecord.UpdatedAt = DateTime.UtcNow;

            _context.Prescriptions.RemoveRange(existingRecord.Prescriptions);
            if (request.Prescriptions is not null && request.Prescriptions.Count > 0)
            {
                foreach (var prescriptionRequest in request.Prescriptions)
                {
                    existingRecord.Prescriptions.Add(new Prescription
                    {
                        MedicationName = prescriptionRequest.MedicationName,
                        Dosage = prescriptionRequest.Dosage,
                        Frequency = prescriptionRequest.Frequency,
                        Duration = prescriptionRequest.Duration,
                        Instructions = prescriptionRequest.Instructions ?? string.Empty,
                        CreatedAt = DateTime.UtcNow
                    });
                }
            }

            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation(
                "Medical record updated via upsert. MedicalRecordId: {Id}, AppointmentId: {AppointmentId}, DoctorId: {DoctorId}",
                existingRecord.Id, request.AppointmentId, doctor.Id);

            return Result.Success(existingRecord.Id);
        }

        // 6. Create medical record
        var medicalRecord = new MedicalRecord
        {
            AppointmentId = request.AppointmentId,
            PatientId = appointment.PatientId,
            DoctorId = doctor.Id,
            Diagnosis = request.Diagnosis,
            Symptoms = request.Symptoms ?? string.Empty,
            Treatment = request.Treatment ?? string.Empty,
            Notes = request.Notes ?? string.Empty,
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
        var isStaff = await _context.UserRoles.AnyAsync(ur => ur.UserId == userId && (ur.RoleId == DefaultRoles.AdminRoleId || ur.RoleId == DefaultRoles.ReceptionistRoleId), cancellationToken);

        if (!isPatient && !isDoctor && !isStaff)
            return Result.Failure<MedicalRecordResponse>(MedicalRecordErrors.NotAuthorized);

        return Result.Success(medicalRecord);
    }

    public async Task<Result<MedicalRecordResponse>> GetByAppointmentIdAsync(int appointmentId, string userId, CancellationToken cancellationToken = default)
    {
        var recordId = await _context.MedicalRecords
            .Where(m => m.AppointmentId == appointmentId)
            .Select(m => (int?)m.Id)
            .FirstOrDefaultAsync(cancellationToken);

        if (recordId is null)
            return Result.Failure<MedicalRecordResponse>(new Error("MedicalRecord.NotFound", "لم يتم إصدار روشتة طبية لهذا الموعد بعد. سيقوم الطبيب بإصدارها فور إتمام الفحص.", StatusCodes.Status404NotFound));

        return await GetByIdAsync(recordId.Value, userId, cancellationToken);
    }

    public async Task<IEnumerable<MedicalRecordResponse>> GetPatientHistoryAsync(int patientId, string userId, CancellationToken cancellationToken = default)
    {
        // Check authorization
        var isPatient = await _context.Patients.AnyAsync(p => p.UserId == userId && p.Id == patientId, cancellationToken);
        var isDoctor = await _context.Doctors.AnyAsync(d => d.UserId == userId, cancellationToken);
        var isStaff = await _context.UserRoles.AnyAsync(ur => ur.UserId == userId && (ur.RoleId == DefaultRoles.AdminRoleId || ur.RoleId == DefaultRoles.ReceptionistRoleId), cancellationToken);

        if (!isPatient && !isDoctor && !isStaff)
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
            .Include(m => m.Prescriptions)
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

        if (request.Prescriptions is not null)
        {
            _context.Prescriptions.RemoveRange(medicalRecord.Prescriptions);
            foreach (var p in request.Prescriptions)
            {
                medicalRecord.Prescriptions.Add(new Prescription
                {
                    MedicationName = p.MedicationName,
                    Dosage = p.Dosage,
                    Frequency = p.Frequency,
                    Duration = p.Duration,
                    Instructions = p.Instructions ?? string.Empty,
                    CreatedAt = DateTime.UtcNow
                });
            }
        }

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