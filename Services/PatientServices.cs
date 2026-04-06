using Hangfire;
using Microsoft.AspNetCore.WebUtilities;
using System.Text;

namespace MedicalClinic.Api.Services;

public class PatientServices(
    ApplicationDbContext context,
    UserManager<ApplicationUser> userManager,
    ILogger<PatientServices> logger,
    IHttpContextAccessor httpContextAccessor,
    IEmailSender emailSender) : IPatientServices
{
    private readonly ApplicationDbContext _context = context;
    private readonly UserManager<ApplicationUser> _userManager = userManager;
    private readonly ILogger<PatientServices> _logger = logger;
    private readonly IHttpContextAccessor _httpContextAccessor = httpContextAccessor;
    private readonly IEmailSender _emailSender = emailSender;

    public async Task<Result> RegisterAsync(CreatePatientRequest request, CancellationToken cancellationToken = default)
    {
        var existingUser = await _userManager.FindByEmailAsync(request.Email);

        if (existingUser is not null)
        {
            return Result.Failure(existingUser.IsDeleted
            ? UserErrors.DeletedUser
            : UserErrors.DuplicatedEmail);
        }

        var user = request.Adapt<ApplicationUser>();

        await using var transaction = await _context.Database
            .BeginTransactionAsync(cancellationToken);

        Patient patient;
        try
        {
            var createUserResult = await _userManager.CreateAsync(user, request.Password);

            if (!createUserResult.Succeeded)
            {
                var error = createUserResult.Errors.First();
                return Result.Failure(new Error(error.Code, error.Description, StatusCodes.Status400BadRequest));
            }

            await _userManager.AddToRoleAsync(user, DefaultRoles.Patient);

            patient = request.Adapt<Patient>();
            patient.UserId = user.Id;

            await _context.Patients.AddAsync(patient, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);

            var code = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            code = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(code));

            await SendConfirmationEmail(user, code);

            await transaction.CommitAsync(cancellationToken);
            _logger.LogInformation(
                "Patient registered successfully. Email: {Email}, PatientId: {PatientId}", user.Email, patient.Id);
            _logger.LogInformation("Code But just in development only {code}", code);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync(cancellationToken);
            _logger.LogError(ex, "Failed to create patient. Email: {Email}", request.Email);
            return Result.Failure(UserErrors.CreationFailed);
        }

        _logger.LogInformation("Patient account created successfully. Email: {Email}, PatientId: {PatientId}, UserId: {UserId}", user.Email, patient.Id, user.Id);

        return Result.Success();
    }

    public async Task<IEnumerable<PatientResponse>> GetAllAsync(CancellationToken cancellationToken = default) =>
        await _context.Patients
            .AsNoTracking()
            .ToPatientResponse()
            .ToListAsync(cancellationToken);

    public async Task<IEnumerable<PatientResponse>> GetDeletedAsync(CancellationToken cancellationToken = default) =>
        await _context.Patients
        .AsNoTracking()
        .IgnoreQueryFilters()
        .Where(p => p.IsDeleted)
        .ToPatientResponse()
        .ToListAsync(cancellationToken);

    public async Task<Result<PatientResponse>> GetAsync(int id, CancellationToken cancellationToken = default)
    {
        var patient = await _context.Patients
            .AsNoTracking()
            .IgnoreQueryFilters()
            .Include(p => p.User)
            .SingleOrDefaultAsync(p => p.Id == id, cancellationToken);


        if (patient is null)
            return Result.Failure<PatientResponse>(PatientErrors.PatientNotFound);


        if (patient.IsDeleted)
            return Result.Failure<PatientResponse>(PatientErrors.DeletedPatient);

        return Result.Success(patient.Adapt<PatientResponse>());
    }

    public async Task<Result> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var patient = await _context.Patients
            .IgnoreQueryFilters()
            .Include(p => p.User)
            .SingleOrDefaultAsync(p => p.Id == id, cancellationToken);


        if (patient is null)
            return Result.Failure(PatientErrors.PatientNotFound);


        if (patient.IsDeleted)
            return Result.Failure(PatientErrors.AlreadyDeleted);

        patient.IsDeleted = true;
        patient.User.IsDeleted = true;
        patient.User.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Patient soft deleted. PatientId: {PatientId}, UserId: {UserId}, Email: {Email}", patient.Id, patient.UserId, patient.User.Email);

        return Result.Success();
    }

    public async Task<Result> RestoreAsync(int id, CancellationToken cancellationToken = default)
    {
        var patient = await _context.Patients
            .IgnoreQueryFilters()
            .Include(p => p.User)
            .SingleOrDefaultAsync(p => p.Id == id, cancellationToken);


        if (patient is null)
            return Result.Failure(PatientErrors.PatientNotFound);


        if (!patient.IsDeleted)
            return Result.Failure(PatientErrors.NotDeleted);

        patient.IsDeleted = false;
        patient.User.IsDeleted = false;
        patient.User.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Patient is restored. PatientId: {PatientId}, UserId: {UserId}, Email: {Email}", patient.Id, patient.UserId, patient.User.Email);
        return Result.Success();
    }

    public async Task<Result> UpdateAsync(int id, UpdatePatientRequest request, CancellationToken cancellationToken = default)
    {
        var patient = await _context.Patients
            .IgnoreQueryFilters()
            .Include(p => p.User)
            .SingleOrDefaultAsync(p => p.Id == id, cancellationToken);

        if (patient is null)
            return Result.Failure(PatientErrors.PatientNotFound);

        if (patient.IsDeleted)
            return Result.Failure(PatientErrors.AlreadyDeleted);

        if (request.FirstName is not null)
            patient.User.FirstName = request.FirstName;

        if (request.MiddleName is not null)
            patient.User.MiddleName = request.MiddleName;

        if (request.LastName is not null)
            patient.User.LastName = request.LastName;

        if (request.PhoneNumber is not null)
            patient.User.PhoneNumber = request.PhoneNumber;         // Add ExecuteUpdateAsync, in doctor update too

        if (request.Address is not null)
            patient.Address = request.Address;

        if (request.DateOfBirth.HasValue)
            patient.User.DateOfBirth = request.DateOfBirth;

        patient.User.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Patient updated. PatientId: {PatientId}, UpdatedBy: {UpdatedBy}",
            patient.Id,
            _httpContextAccessor.HttpContext?.User.GetUserId());

        return Result.Success();
    }

    private async Task SendConfirmationEmail(ApplicationUser user, string code)
    {
        var origin = _httpContextAccessor.HttpContext?.Request.Headers.Origin;

        var confirmationLink = $"{origin}/auth/confirm-email?" +
                          $"userId={user.Id}&" +
                          $"code={Uri.EscapeDataString(code)}";


        var emailBody = EmailBodyBuilder.GenerateEmailBody("EmailConfirmation",
            templateModel: new Dictionary<string, string>
            {
                { "{{name}}", $"{user.FirstName} {user.LastName}" },
                { "{{confirmation_url}}", confirmationLink },
                { "{{email}}", user.Email! },
                { "{{support_email}}", "support@medical-clinic.com" }
            });

        BackgroundJob.Enqueue(() => _emailSender.SendEmailAsync(user.Email!, "🏥 Welcome to Medical Clinic - Confirm Your Email", emailBody));

        _logger.LogInformation("Confirmation email sent to {Email}", user.Email);

        await Task.CompletedTask;
    }

}
