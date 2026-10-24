using Hangfire;
using MedicalClinic.Application.Contract.Appointment;
using MedicalClinic.Application.Contract.Common;
using System.Linq.Dynamic.Core;

namespace MedicalClinic.Application.Services;

public class AppointmentServices(
    IApplicationDbContext context,
    ILogger<AppointmentServices> logger) : IAppointmentServices
{
    private readonly IApplicationDbContext _context = context;
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
            .OrderByDescending(a => a.CreatedAt)
            .ThenByDescending(a => a.Id)
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

        // 4. Generate time slots (9:00 AM to 11:00 PM, every 20 minutes -> 3 patients per hour)
        var today = DateOnly.FromDateTime(DateTime.Today);
        var isToday = date == today;
        var nowTime = TimeOnly.FromDateTime(DateTime.Now);

        var (startTime, endTime, slotDuration) = GetDoctorSchedule(doctor);
        var timeSlots = new List<AvailableTimeSlot>();

        void GenerateSlotsForInterval(TimeOnly start, TimeOnly end)
        {
            var cur = start;
            while (cur < end)
            {
                var isPastTime = isToday && cur <= nowTime;
                var isAvailable = !isPastTime && !bookedTimes.Contains(cur);
                if (!timeSlots.Any(s => s.Time == cur))
                {
                    timeSlots.Add(new AvailableTimeSlot(cur, isAvailable));
                }
                cur = cur.AddMinutes(slotDuration);
            }
        }

        // 1. First / Morning shift
        GenerateSlotsForInterval(startTime, endTime);

        // 2. Second / Evening shift (if configured)
        if (doctor.EveningStartTime.HasValue && doctor.EveningEndTime.HasValue && doctor.EveningStartTime.Value < doctor.EveningEndTime.Value)
        {
            GenerateSlotsForInterval(doctor.EveningStartTime.Value, doctor.EveningEndTime.Value);
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

    private static (TimeOnly StartTime, TimeOnly EndTime, int SlotDurationMinutes) GetDoctorSchedule(Doctor doctor)
    {
        // 1. If manual configuration was set from the web dashboard, use it directly
        if (doctor.WorkStartTime.HasValue && doctor.WorkEndTime.HasValue && doctor.SlotDurationMinutes.HasValue && doctor.SlotDurationMinutes.Value > 0)
        {
            return (doctor.WorkStartTime.Value, doctor.WorkEndTime.Value, doctor.SlotDurationMinutes.Value);
        }

        var spec = doctor.Specialization?.Trim().ToLowerInvariant() ?? string.Empty;

        // 2. Specialty-based templates
        if (spec.Contains("أسنان") || spec.Contains("dent") || spec.Contains("dental"))
        {
            return (doctor.WorkStartTime ?? new TimeOnly(10, 0), doctor.WorkEndTime ?? new TimeOnly(21, 0), doctor.SlotDurationMinutes ?? 30);
        }

        if (spec.Contains("عظام") || spec.Contains("ortho"))
        {
            return (doctor.WorkStartTime ?? new TimeOnly(11, 0), doctor.WorkEndTime ?? new TimeOnly(22, 0), doctor.SlotDurationMinutes ?? 30);
        }

        if (spec.Contains("قلب") || spec.Contains("cardio"))
        {
            return (doctor.WorkStartTime ?? new TimeOnly(9, 30), doctor.WorkEndTime ?? new TimeOnly(20, 30), doctor.SlotDurationMinutes ?? 30);
        }

        return (doctor.WorkStartTime ?? new TimeOnly(9, 0), doctor.WorkEndTime ?? new TimeOnly(23, 0), doctor.SlotDurationMinutes ?? 20);
    }

    public async Task<Result<int>> BookAppointmentAsync(CreateAppointmentRequest request, string patientUserId, CancellationToken cancellationToken = default)
    {

        Patient? patient = null;
        if (request.PatientId.HasValue && request.PatientId.Value > 0)
        {
            patient = await _context.Patients
                .IgnoreQueryFilters()
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.Id == request.PatientId.Value, cancellationToken);
        }
        else
        {
            patient = await _context.Patients
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.UserId == patientUserId, cancellationToken);
        }

        if (patient is null)
            return Result.Failure<int>(PatientErrors.PatientNotFound);

        var doctor = await _context.Doctors
            .FirstOrDefaultAsync(d => d.Id == request.DoctorId, cancellationToken);

        if (doctor is null)
            return Result.Failure<int>(DoctorErrors.DoctorNotFound);

        if (!doctor.IsAvailable)
            return Result.Failure<int>(DoctorErrors.DoctorNotAvailable);

        var today = DateOnly.FromDateTime(DateTime.Today);
        var nowTime = TimeOnly.FromDateTime(DateTime.Now);

        if (request.AppointmentDate < today)
            return Result.Failure<int>(AppointmentErrors.PastAppointment);

        if (!request.PatientId.HasValue && request.AppointmentDate == today && request.AppointmentTime <= nowTime)
            return Result.Failure<int>(AppointmentErrors.PastAppointment);

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

        var isOnline = request.IsOnline;
        var isPaid = request.IsPaid || isOnline;
        var appointment = new Appointment
        {
            PatientId = patient.Id,
            DoctorId = doctor.Id,
            Type = request.Type,
            AppointmentDate = request.AppointmentDate,
            AppointmentTime = request.AppointmentTime,
            Reason = string.IsNullOrWhiteSpace(request.Reason) ? null : (request.Reason.Length > 2000 ? request.Reason[..2000] : request.Reason),
            IsOnline = isOnline,
            MeetingUrl = isOnline ? $"https://meet.jit.si/MedicalClinic-Consultation-{Guid.NewGuid():N}" : null,
            PaymentStatus = isPaid ? PaymentStatus.Paid : PaymentStatus.Unpaid,
            ConsultationFee = request.ConsultationFee > 0 ? request.ConsultationFee : (isOnline ? 350m : 250m),
            Status = isPaid ? AppointmentStatus.Confirmed : AppointmentStatus.Pending,
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

        var today = DateOnly.FromDateTime(DateTime.Today);
        var nowTime = TimeOnly.FromDateTime(DateTime.Now);

        if (appointment.AppointmentDate < today || (appointment.AppointmentDate == today && appointment.AppointmentTime <= nowTime))
            return Result.Failure(AppointmentErrors.PastAppointment);

        // 5. If updating date or time, check availability
        if (request.AppointmentDate.HasValue || request.AppointmentTime.HasValue)
        {
            var newDate = request.AppointmentDate ?? appointment.AppointmentDate;
            var newTime = request.AppointmentTime ?? appointment.AppointmentTime;

            if (newDate < today || (newDate == today && newTime <= nowTime))
                return Result.Failure(AppointmentErrors.PastAppointment);

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
            appointment.Reason = string.IsNullOrWhiteSpace(request.Reason) ? null : (request.Reason.Length > 2000 ? request.Reason[..2000] : request.Reason);

        appointment.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        if (request.AppointmentDate.HasValue || request.AppointmentTime.HasValue)
        {
            BackgroundJob.Enqueue<INotificationService>(
                service => service.SendAppointmentConfirmationAsync(appointment.Id));
        }

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
        if (appointment.Status == AppointmentStatus.Cancelled && request.Status == AppointmentStatus.Cancelled)
            return Result.Failure(AppointmentErrors.AlreadyCancelled);

        // 3. Validate status transition
        if (!IsValidStatusTransition(appointment.Status, request.Status))
            return Result.Failure(AppointmentErrors.InvalidStatusTransition);

        // 4. Update status
        appointment.Status = request.Status;
        appointment.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        if (request.Status == AppointmentStatus.Confirmed)
        {
            BackgroundJob.Enqueue<INotificationService>(
                service => service.SendAppointmentConfirmationAsync(appointment.Id));
        }
        else if (request.Status == AppointmentStatus.Cancelled)
        {
            BackgroundJob.Enqueue<INotificationService>(
                service => service.SendAppointmentCancellationAsync(appointment.Id));
        }

        _logger.LogInformation(
            "Appointment status changed. AppointmentId: {Id}, OldStatus: {OldStatus}, NewStatus: {NewStatus}",
            appointment.Id, appointment.Status, request.Status);

        return Result.Success();
    }

    public async Task<Result> ChangePaymentStatusAsync(int id, PaymentStatus paymentStatus, CancellationToken cancellationToken = default)
    {
        var appointment = await _context.Appointments
            .FirstOrDefaultAsync(a => a.Id == id && !a.IsDeleted, cancellationToken);

        if (appointment is null)
            return Result.Failure(AppointmentErrors.AppointmentNotFound);

        appointment.PaymentStatus = paymentStatus;
        appointment.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Appointment payment status changed. AppointmentId: {Id}, NewPaymentStatus: {Status}",
            appointment.Id, paymentStatus);

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

        var response = await source.ToPaginatedListAsync(paginationFilter.PageNumber, paginationFilter.PageSize, cancellationToken);

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
        if (current == next) return true;

        return (current, next) switch
        {
            // From Pending
            (AppointmentStatus.Pending, AppointmentStatus.Confirmed) => true,
            (AppointmentStatus.Pending, AppointmentStatus.Cancelled) => true,
            (AppointmentStatus.Pending, AppointmentStatus.InProgress) => true,
            (AppointmentStatus.Pending, AppointmentStatus.NoShow) => true,

            // From Confirmed
            (AppointmentStatus.Confirmed, AppointmentStatus.InProgress) => true,
            (AppointmentStatus.Confirmed, AppointmentStatus.Completed) => true,
            (AppointmentStatus.Confirmed, AppointmentStatus.Cancelled) => true,
            (AppointmentStatus.Confirmed, AppointmentStatus.NoShow) => true,
            (AppointmentStatus.Confirmed, AppointmentStatus.Pending) => true,

            // From InProgress
            (AppointmentStatus.InProgress, AppointmentStatus.Completed) => true,
            (AppointmentStatus.InProgress, AppointmentStatus.Confirmed) => true,
            (AppointmentStatus.InProgress, AppointmentStatus.Cancelled) => true,

            // Reopening / correcting mistakes
            (AppointmentStatus.NoShow, AppointmentStatus.Confirmed) => true,
            (AppointmentStatus.Cancelled, AppointmentStatus.Confirmed) => true,
            (AppointmentStatus.Cancelled, AppointmentStatus.Pending) => true,

            _ => true
        };
    }
}

