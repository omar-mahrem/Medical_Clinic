using Hangfire;
using Microsoft.AspNetCore.WebUtilities;
using System.Text;

namespace MedicalClinic.Api.Services;

public class DoctorServices(
    ApplicationDbContext context,
    UserManager<ApplicationUser> userManager,
    ILogger<DoctorServices> logger,
    IHttpContextAccessor httpContextAccessor,
    IEmailSender emailSender) : IDoctorServices
{
    private readonly ApplicationDbContext _context = context;
    private readonly UserManager<ApplicationUser> _userManager = userManager;
    private readonly ILogger<DoctorServices> _logger = logger;
    private readonly IHttpContextAccessor _httpContextAccessor = httpContextAccessor;
    private readonly IEmailSender _emailSender = emailSender;


    public async Task<Result> AddAsync(CreateDoctorRequest request, CancellationToken cancellationToken = default)
    {
        var existingUser = await _userManager.FindByEmailAsync(request.Email);

        if (existingUser is not null)
        {
            return Result.Failure(existingUser.IsDeleted
            ? UserErrors.DeletedUser
            : UserErrors.DuplicatedEmail);
        }

        #region  // User Deleted Check
        //// Check if user exists
        //var existingUser = await _userManager.FindByEmailAsync(request.Email);

        //if (existingUser is not null)
        //{
        //    // Check if user is deleted
        //    if (existingUser.IsDeleted)
        //    {
        //        // Check if doctor profile exists
        //        var existingDoctor = await _context.Doctors
        //            .IgnoreQueryFilters() // ✅ Important: to get deleted doctors
        //            .FirstOrDefaultAsync(d => d.UserId == existingUser.Id, cancellationToken);

        //        if (existingDoctor is not null)
        //        {
        //            // Both User and Doctor are deleted - suggest reactivation
        //            return Result.Failure(UserErrors.DeletedUserWithProfile);
        //        }

        //        // User deleted but no doctor profile
        //        return Result.Failure(UserErrors.DeletedUser);
        //    }

        //    // User is active - check if doctor profile exists
        //    var activeDoctor = await _context.Doctors
        //        .FirstOrDefaultAsync(d => d.UserId == existingUser.Id, cancellationToken);

        //    if (activeDoctor is not null)
        //    {
        //        // Check if doctor profile is deleted
        //        if (activeDoctor.IsDeleted)
        //        {
        //            // User active, Doctor deleted - suggest reactivation
        //            return Result.Failure(DoctorErrors.DeletedDoctorProfile);
        //        }

        //        // Both active - duplicate
        //        return Result.Failure(UserErrors.DuplicatedEmail);
        //    }

        //    // User exists and active, but no doctor profile
        //    // This shouldn't happen in normal flow, but handle it
        //    return Result.Failure(UserErrors.UserExistsWithoutDoctorProfile);
        //}
        #endregion

        var licenseExists = await _context.Doctors.AnyAsync(d => d.LicenseNumber == request.LicenseNumber);

        if (licenseExists)
            return Result.Failure(DoctorErrors.DuplicatedLicenceNumber);


        var user = request.Adapt<ApplicationUser>();


        await using var transaction = await _context.Database
            .BeginTransactionAsync(cancellationToken);

        Doctor doctor;
        string currentUserId;
        try
        {
            var createUserResult = await _userManager.CreateAsync(user);

            if (!createUserResult.Succeeded)
            {
                var error = createUserResult.Errors.First();
                return Result.Failure(new Error(error.Code, error.Description, StatusCodes.Status400BadRequest));
            }

            await _userManager.AddToRoleAsync(user, DefaultRoles.Doctor);

            currentUserId = _httpContextAccessor.HttpContext?.User.GetUserId()!;


            doctor = request.Adapt<Doctor>();

            doctor.UserId = user.Id;
            doctor.CreatedById = currentUserId;

            await _context.Doctors.AddAsync(doctor, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);


            var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            token = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));

            await SendSetupEmail(user, token);

            _logger.LogInformation("Sending setup email. Email: {Email}, Token:{token}", user.Email, token);

            await transaction.CommitAsync(cancellationToken);

        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync(cancellationToken);
            _logger.LogError(ex, "Failed to create doctor. Email: {Email}", request.Email);
            return Result.Failure(UserErrors.CreationFailed);
        }

        _logger.LogInformation("Doctor account created successfully. Email: {Email}, DoctorId: {DoctorId}, CreatedBy: {CreatedBy}", user.Email, doctor.Id, currentUserId);

        return Result.Success();
    }

    public async Task<IEnumerable<DoctorResponse>> GetAllAsync(CancellationToken cancellationToken = default) =>
        await _context.Doctors
            .AsNoTracking()
            .ToDoctorResponse()
            .ToListAsync(cancellationToken);

    public async Task<IEnumerable<DoctorResponse>> GetAvailableAsync(CancellationToken cancellationToken = default) =>
        await _context.Doctors
            .AsNoTracking()
            .Where(d => d.IsAvailable)
            .ToDoctorResponse()
            .ToListAsync(cancellationToken);

    public async Task<IEnumerable<DoctorResponse>> GetDeletedAsync(CancellationToken cancellationToken = default) =>
        await _context.Doctors
            .AsNoTracking()
            .IgnoreQueryFilters()
            .Where(d => d.IsDeleted)
            .ToDoctorResponse()
            .ToListAsync(cancellationToken);

    public async Task<Result<DoctorResponse>> GetAsync(int id, CancellationToken cancellationToken = default)
    {
        var doctor = await _context.Doctors
            .AsNoTracking()
            .IgnoreQueryFilters()
            .Include(d => d.User)
            .SingleOrDefaultAsync(d => d.Id == id, cancellationToken);


        if (doctor is null)
            return Result.Failure<DoctorResponse>(DoctorErrors.DoctorNotFound);


        if (doctor.IsDeleted)
            return Result.Failure<DoctorResponse>(DoctorErrors.DeletedDoctor);

        return Result.Success(doctor.Adapt<DoctorResponse>());
    }

    public async Task<Result> UpdateAsync(int id, UpdateDoctorRequest request, CancellationToken cancellationToken = default)
    {
        var doctor = await _context.Doctors
            .IgnoreQueryFilters()
            .Include(d => d.User)
            .FirstOrDefaultAsync(d => d.Id == id, cancellationToken);

        if (doctor is null)
            return Result.Failure(DoctorErrors.DoctorNotFound);

        if (doctor.IsDeleted)
            return Result.Failure(DoctorErrors.DeletedDoctor);

        if (request.FirstName is not null)
            doctor.User.FirstName = request.FirstName;

        if (request.MiddleName is not null)
            doctor.User.MiddleName = request.MiddleName;

        if (request.LastName is not null)
            doctor.User.LastName = request.LastName;

        if (request.PhoneNumber is not null)
            doctor.User.PhoneNumber = request.PhoneNumber;

        if (request.DateOfBirth.HasValue)
            doctor.User.DateOfBirth = request.DateOfBirth;

        if (request.Qualifications is not null)
            doctor.Qualifications = request.Qualifications;

        if (request.Specialization is not null)
            doctor.Specialization = request.Specialization;

        if (request.YearsOfExperience.HasValue)
            doctor.YearsOfExperience = request.YearsOfExperience.Value;

        doctor.User.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Doctor updated. DoctorId: {DoctorId}, UpdatedFields: {UpdatedFields}, UpdatedBy: {UpdatedBy}",
            doctor.Id,
            GetUpdatedFields(request),
            _httpContextAccessor.HttpContext?.User.GetUserId());

        return Result.Success();
    }

    public async Task<Result> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var doctor = await _context.Doctors
            .IgnoreQueryFilters()
            .Include(d => d.User)
            .FirstOrDefaultAsync(d => d.Id == id, cancellationToken);

        if (doctor is null)
            return Result.Failure(DoctorErrors.DoctorNotFound);

        if (doctor.IsDeleted)
            return Result.Failure(DoctorErrors.AlreadyDeleted);

        doctor.IsDeleted = true;
        doctor.User.IsDeleted = true;
        doctor.User.UpdatedAt = DateTime.UtcNow;


        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Doctor soft deleted. DoctorId: {DoctorId}, UserId: {UserId}, Email: {Email}", doctor.Id, doctor.UserId, doctor.User.Email);
        return Result.Success();
    }

    public async Task<Result> RestoreAsync(int id, CancellationToken cancellationToken = default)
    {
        var doctor = await _context.Doctors
            .IgnoreQueryFilters()
            .Include(d => d.User)
            .FirstOrDefaultAsync(d => d.Id == id, cancellationToken);

        if (doctor is null)
            return Result.Failure(DoctorErrors.DoctorNotFound);

        if (!doctor.IsDeleted)
            return Result.Failure(DoctorErrors.NotDeleted);

        doctor.IsDeleted = false;
        doctor.User.IsDeleted = false;
        doctor.User.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Doctor is restored. DoctorId: {DoctorId}, UserId: {UserId}, Email: {Email}", doctor.Id, doctor.UserId, doctor.User.Email);
        return Result.Success();

    }


    public async Task<Result> ToggleAvailabilityAsync(int id, CancellationToken cancellationToken = default)
    {
        var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.Id == id);

        if (doctor is null)
            return Result.Failure(DoctorErrors.DoctorNotFound);

        doctor.IsAvailable = !doctor.IsAvailable;


        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }

    public async Task<IEnumerable<string>> GetSpecializationsAsync(CancellationToken cancellationToken = default) =>
        await _context.Doctors
            .Select(d => d.Specialization)
            .Distinct()
            .OrderBy(s => s)
            .ToListAsync(cancellationToken);

    public async Task<IEnumerable<DoctorResponse>> GetBySpecializationAsync(string specialization, CancellationToken cancellationToken = default) =>
        await _context.Doctors
            .AsNoTracking()
            .Where(d => d.Specialization == specialization)
            .ToDoctorResponse()
            .ToListAsync(cancellationToken);



    private async Task SendSetupEmail(ApplicationUser user, string token)
    {
        var origin = _httpContextAccessor.HttpContext?.Request.Headers.Origin;

        var setupLink = $"{origin}/account-setup?" +
                        $"userId={user.Id}&" +
                        $"token={Uri.EscapeDataString(token)}";

        var emailBody = EmailBodyBuilder.GenerateEmailBody("ClientSetup",
            templateModel: new Dictionary<string, string>
            {
            { "{{name}}", $"{user.FirstName} {user.LastName}" },
            { "{{setup_url}}", setupLink },
            { "{{email}}", user.Email! },
            { "{{expiry}}", "24 hours" },
            { "{{login_url}}", $"{origin}/auth/login" },
            { "{{support_email}}", "support@medical-clinic.com" }
        });

        BackgroundJob.Enqueue(() => _emailSender.SendEmailAsync(user.Email!, "🏥 Complete Your Medical Clinic Account Setup", emailBody));

        _logger.LogInformation("Setup email sent to {Email}", user.Email);
        await Task.CompletedTask;
    }

    private static string GetUpdatedFields(UpdateDoctorRequest request)
    {
        var fields = new List<string>();

        if (request.FirstName != null) fields.Add(nameof(request.FirstName));
        if (request.MiddleName != null) fields.Add(nameof(request.MiddleName));
        if (request.LastName != null) fields.Add(nameof(request.LastName));
        if (request.PhoneNumber != null) fields.Add(nameof(request.PhoneNumber));
        if (request.DateOfBirth != null) fields.Add(nameof(request.DateOfBirth));
        if (request.Qualifications != null) fields.Add(nameof(request.Qualifications));
        if (request.Specialization != null) fields.Add(nameof(request.Specialization));
        if (request.YearsOfExperience != null) fields.Add(nameof(request.YearsOfExperience));

        return string.Join(", ", fields);
    }

}