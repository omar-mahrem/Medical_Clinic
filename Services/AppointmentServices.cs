using Hangfire;
using MedicalClinic.Api.Contract.Appointment;
using MedicalClinic.Api.Contract.Common;
using System.Linq.Dynamic.Core;

namespace MedicalClinic.Api.Services;

public class AppointmentServices(
    ApplicationDbContext context,
    ILogger<AppointmentServices> logger) : IAppointmentServices
{
    private readonly ApplicationDbContext _context = context;
    private readonly ILogger<AppointmentServices> _logger = logger;


    public async Task<Result<AppointmentResponse>> GetByIdAsync(int id, string patientUserId, CancellationToken cancellationToken = default)
    {
        var patient = await _context.Patients
            .FirstOrDefaultAsync(d => d.UserId == patientUserId, cancellationToken);

        if (patient is null)
            return Result.Failure<AppointmentResponse>(PatientErrors.PatientNotFound);

        var appointment = await _context.Appointments
            .Where(a => a.Id == id && !a.IsDeleted)
            .ToAppointmentResponse()
            .FirstOrDefaultAsync(cancellationToken);

        if (appointment is null)
            return Result.Failure<AppointmentResponse>(AppointmentErrors.AppointmentNotFound);

        if (appointment.PatientId != patient!.Id)
            return Result.Failure<AppointmentResponse>(PatientErrors.UnAuthorized);

        return Result.Success(appointment);
    }
    public async Task<IEnumerable<AppointmentResponse>> GetMyAppointmentsAsync(string patientUserId, CancellationToken cancellationToken = default)
    {
        var patient = await _context.Patients
            .FirstOrDefaultAsync(d => d.UserId == patientUserId);

        if (patient is null)
            return Enumerable.Empty<AppointmentResponse>();

        var appointments = await _context.Appointments
            .Where(a => a.PatientId == patient!.Id && !a.IsDeleted)
            .OrderByDescending(a => a.AppointmentDate)
            .ThenByDescending(a => a.AppointmentTime)
            .ToAppointmentResponse()
            .ToListAsync();

        return appointments;
    }

    public async Task<IEnumerable<AppointmentResponse>> GetDoctorAppointmentsAsync(string doctorUserId, DateOnly? date, CancellationToken cancellationToken = default)
    {
        var doctor = await _context.Doctors
            .FirstOrDefaultAsync(d => d.UserId == doctorUserId, cancellationToken);

        if (doctor is null)
            return Enumerable.Empty<AppointmentResponse>();

        var query = _context.Appointments
            .Where(a => a.DoctorId == doctor.Id && !a.IsDeleted);

        if (date.HasValue)
            query = query.Where(a => a.AppointmentDate == date.Value);

        var appointments = await query
            .OrderBy(a => a.AppointmentDate)
            .ThenBy(a => a.AppointmentTime)
            .ToAppointmentResponse()
            .ToListAsync(cancellationToken);

        return appointments;
    }
    public async Task<Result<DoctorAvailabilityResponse>> GetDoctorAvailabilityAsync(int doctorId, DateOnly date, CancellationToken cancellationToken = default)
    {
        var doctor = await _context.Doctors
        .Include(d => d.User)
        .FirstOrDefaultAsync(d => d.Id == doctorId, cancellationToken);

        if (doctor is null)
            return Result.Failure<DoctorAvailabilityResponse>(DoctorErrors.DoctorNotFound);

        if (!doctor.IsAvailable)
            return Result.Failure<DoctorAvailabilityResponse>(DoctorErrors.DoctorNotAvailable);


        if (date < DateOnly.FromDateTime(DateTime.Today))
            return Result.Failure<DoctorAvailabilityResponse>(
                new Error("Appointment.PastDate", "Cannot book appointments in the past", StatusCodes.Status400BadRequest));

        // 3. Get existing appointments for this doctor on this date
        var bookedTimes = await _context.Appointments
            .Where(a =>
                a.DoctorId == doctorId &&
                a.AppointmentDate == date &&
                a.Status != AppointmentStatus.Cancelled &&
                !a.IsDeleted)
            .Select(a => a.AppointmentTime)
            .ToListAsync(cancellationToken);

        // 4. Generate time slots (4:00 PM to 11:00 PM, every 20 minutes)
        var timeSlots = new List<AvailableTimeSlot>();
        var startTime = new TimeOnly(16, 0);  // 4:00 PM
        var endTime = new TimeOnly(23, 0);    // 11:00 PM
        var slotDuration = 20; // minutes

        var currentTime = startTime;
        while (currentTime < endTime)
        {
            var isAvailable = !bookedTimes.Contains(currentTime);

            timeSlots.Add(new AvailableTimeSlot(currentTime, isAvailable));

            currentTime = currentTime.AddMinutes(slotDuration);
        }

        // 5. Build response
        var response = new DoctorAvailabilityResponse(
            DoctorId: doctor.Id,
            DoctorName: $"{doctor.User.FirstName} {doctor.User.LastName}",
            Specialization: doctor.Specialization,
            Date: date,
            TimeSlots: timeSlots
        );

        return Result.Success(response);
    }

    public async Task<Result<int>> BookAppointmentAsync(CreateAppointmentRequest request, string patientUserId, CancellationToken cancellationToken = default)
    {

        var patient = await _context.Patients
            .FirstOrDefaultAsync(p => p.UserId == patientUserId, cancellationToken);

        if (patient is null)
            return Result.Failure<int>(PatientErrors.PatientNotFound);

        var doctor = await _context.Doctors
            .FirstOrDefaultAsync(d => d.Id == request.DoctorId, cancellationToken);

        if (doctor is null)
            return Result.Failure<int>(DoctorErrors.DoctorNotFound);

        if (!doctor.IsAvailable)
            return Result.Failure<int>(DoctorErrors.DoctorNotAvailable);

        // 3. Check if time slot is available
        var isSlotTaken = await _context.Appointments
            .AnyAsync(a =>
                a.DoctorId == request.DoctorId &&
                a.AppointmentDate == request.AppointmentDate &&
                a.AppointmentTime == request.AppointmentTime &&
                a.Status != AppointmentStatus.Cancelled &&
                !a.IsDeleted,
                cancellationToken);

        if (isSlotTaken)
            return Result.Failure<int>(AppointmentErrors.TimeSlotNotAvailable);

        var appointment = new Appointment
        {
            PatientId = patient.Id,
            DoctorId = doctor.Id,
            Type = request.Type,
            AppointmentDate = request.AppointmentDate,
            AppointmentTime = request.AppointmentTime,
            Reason = request.Reason,
            Status = AppointmentStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };
        await _context.Appointments.AddAsync(appointment, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);


        _logger.LogInformation(
            "Appointment booked. AppointmentId: {Id}, Patient: {PatientId}, Doctor: {DoctorId}, Date: {Date}, Time: {Time}",
            appointment.Id, patient.Id, request.DoctorId, request.AppointmentDate, request.AppointmentTime);

        BackgroundJob.Enqueue<INotificationService>(
            service => service.SendAppointmentConfirmationAsync(appointment.Id));

        return Result.Success(appointment.Id);
    }

    public async Task<Result> UpdateAsync(int id, UpdateAppointmentRequest request, string patientUserId, CancellationToken cancellationToken = default)
    {
        // 1. Get patient
        var patient = await _context.Patients
            .FirstOrDefaultAsync(p => p.UserId == patientUserId, cancellationToken);

        if (patient is null)
            return Result.Failure(PatientErrors.PatientNotFound);

        // 2. Get appointment
        var appointment = await _context.Appointments
            .FirstOrDefaultAsync(a => a.Id == id && !a.IsDeleted, cancellationToken);

        if (appointment is null)
            return Result.Failure(AppointmentErrors.AppointmentNotFound);

        // 3. Check authorization
        if (appointment.PatientId != patient.Id)
            return Result.Failure(PatientErrors.UnAuthorized);

        // 4. Check if cancelled or completed
        if (appointment.Status == AppointmentStatus.Cancelled)
            return Result.Failure(AppointmentErrors.AlreadyCancelled);

        if (appointment.Status == AppointmentStatus.Completed)
            return Result.Failure(AppointmentErrors.CannotCancel);

        // 5. If updating date or time, check availability
        if (request.AppointmentDate.HasValue || request.AppointmentTime.HasValue)
        {
            var newDate = request.AppointmentDate ?? appointment.AppointmentDate;
            var newTime = request.AppointmentTime ?? appointment.AppointmentTime;

            // Check if slot is available (excluding current appointment)
            var isSlotTaken = await _context.Appointments
                .AnyAsync(a =>
                    a.Id != id &&
                    a.DoctorId == appointment.DoctorId &&
                    a.AppointmentDate == newDate &&
                    a.AppointmentTime == newTime &&
                    a.Status != AppointmentStatus.Cancelled &&
                    !a.IsDeleted,
                    cancellationToken);

            if (isSlotTaken)
                return Result.Failure(AppointmentErrors.TimeSlotNotAvailable);
        }

        // 6. Update fields (Partial Update)
        if (request.Type.HasValue)
            appointment.Type = request.Type.Value;

        if (request.AppointmentDate.HasValue)
            appointment.AppointmentDate = request.AppointmentDate.Value;

        if (request.AppointmentTime.HasValue)
            appointment.AppointmentTime = request.AppointmentTime.Value;

        if (request.Reason is not null)
            appointment.Reason = request.Reason;

        appointment.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Appointment updated. AppointmentId: {Id}, PatientId: {PatientId}", appointment.Id, patient.Id);

        return Result.Success();
    }

    public async Task<Result> CancelAppointmentAsync(int id, string patientUserId, CancellationToken cancellationToken = default)
    {
        var patient = await _context.Patients
            .FirstOrDefaultAsync(d => d.UserId == patientUserId);

        if (patient is null)
            return Result.Failure(PatientErrors.PatientNotFound);

        var appointment = await _context.Appointments
            .FirstOrDefaultAsync(a => a.Id == id && !a.IsDeleted, cancellationToken);

        if (appointment is null)
            return Result.Failure(AppointmentErrors.AppointmentNotFound);

        if (appointment.PatientId != patient!.Id)
            return Result.Failure(PatientErrors.UnAuthorized);

        if (appointment.Status == AppointmentStatus.Cancelled)
            return Result.Failure(AppointmentErrors.AlreadyCancelled);


        if (appointment.Status == AppointmentStatus.Completed)
            return Result.Failure(AppointmentErrors.CannotCancel);


        appointment.Status = AppointmentStatus.Cancelled;
        appointment.IsDeleted = true;
        appointment.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Appointment cancelled. AppointmentId: {Id}, PatientId: {PatientId}", appointment.Id, patient.Id);
        BackgroundJob.Enqueue<INotificationService>(
            service => service.SendAppointmentCancellationAsync(id));

        return Result.Success();
    }

    public async Task<Result> ChangeStatusAsync(int id, ChangeStatusRequest request, CancellationToken cancellationToken = default)
    {
        // 1. Get appointment
        var appointment = await _context.Appointments
            .FirstOrDefaultAsync(a => a.Id == id && !a.IsDeleted, cancellationToken);

        if (appointment is null)
            return Result.Failure(AppointmentErrors.AppointmentNotFound);

        // 2. Check if already cancelled
        if (appointment.Status == AppointmentStatus.Cancelled)
            return Result.Failure(AppointmentErrors.AlreadyCancelled);

        // 3. Validate status transition
        if (!IsValidStatusTransition(appointment.Status, request.Status))
            return Result.Failure(AppointmentErrors.InvalidStatusTransition);

        // 4. Update status
        appointment.Status = request.Status;
        appointment.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Appointment status changed. AppointmentId: {Id}, OldStatus: {OldStatus}, NewStatus: {NewStatus}",
            appointment.Id, appointment.Status, request.Status);

        return Result.Success();
    }

    public async Task<PaginatedList<AppointmentResponse>> GetAllAsync(AppointmentFilterRequest filter, RequestFilters paginationFilter, CancellationToken cancellationToken = default)
    {
        var query = _context.Appointments
            .Where(a => !a.IsDeleted);

        // Apply filters
        if (filter.DoctorId.HasValue)
            query = query.Where(a => a.DoctorId == filter.DoctorId);

        if (filter.PatientId.HasValue)
            query = query.Where(a => a.PatientId == filter.PatientId);

        if (filter.FromDate.HasValue)
            query = query.Where(a => a.AppointmentDate >= filter.FromDate.Value);

        if (filter.ToDate.HasValue)
            query = query.Where(a => a.AppointmentDate <= filter.ToDate.Value);

        if (filter.Type.HasValue)
            query = query.Where(a => a.Type == filter.Type);

        if (filter.Status.HasValue)
            query = query.Where(a => a.Status == filter.Status);

        if (!string.IsNullOrEmpty(paginationFilter.SortColumn))
        {
            query = query.OrderBy($"{paginationFilter.SortColumn} {paginationFilter.SortDirection}");
        }

        var source = query
           .OrderByDescending(a => a.AppointmentDate)
           .ThenByDescending(a => a.AppointmentTime)
           .ToAppointmentResponse();

        var response = await PaginatedList<AppointmentResponse>.CreateAsync(source, paginationFilter.PageNumber, paginationFilter.PageSize, cancellationToken);

        return response;
    }
    //public async Task<IEnumerable<AppointmentResponse>> GetAllAsync(AppointmentFilterRequest filter, CancellationToken cancellationToken = default)
    //{
    //    var query = _context.Appointments
    //        .Where(a => !a.IsDeleted);

    //    // Apply filters
    //    if (filter.DoctorId.HasValue)
    //        query = query.Where(a => a.DoctorId == filter.DoctorId);

    //    if (filter.PatientId.HasValue)
    //        query = query.Where(a => a.PatientId == filter.PatientId);

    //    if (filter.FromDate.HasValue)
    //        query = query.Where(a => a.AppointmentDate >= filter.FromDate.Value);

    //    if (filter.ToDate.HasValue)
    //        query = query.Where(a => a.AppointmentDate <= filter.ToDate.Value);

    //    if (filter.Type.HasValue)
    //        query = query.Where(a => a.Type == filter.Type);

    //    if (filter.Status.HasValue)
    //        query = query.Where(a => a.Status == filter.Status);

    //    return await query
    //        .OrderByDescending(a => a.AppointmentDate)
    //        .ThenByDescending(a => a.AppointmentTime)
    //        .ToAppointmentResponse()
    //        .ToListAsync(cancellationToken);
    //}

    private static bool IsValidStatusTransition(AppointmentStatus current, AppointmentStatus next)
    {
        return (current, next) switch
        {
            // From Pending
            (AppointmentStatus.Pending, AppointmentStatus.Confirmed) => true,
            (AppointmentStatus.Pending, AppointmentStatus.Cancelled) => true,

            // From Confirmed
            (AppointmentStatus.Confirmed, AppointmentStatus.InProgress) => true,
            (AppointmentStatus.Confirmed, AppointmentStatus.Cancelled) => true,
            (AppointmentStatus.Confirmed, AppointmentStatus.NoShow) => true,

            // From InProgress
            (AppointmentStatus.InProgress, AppointmentStatus.Completed) => true,

            // Invalid transitions
            _ => false
        };
    }
}
