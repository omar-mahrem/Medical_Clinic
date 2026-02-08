
namespace MedicalClinic.Api.Services;

public class PatientServices(ApplicationDbContext context, UserManager<ApplicationUser> userManager) : IPatientServices
{
    private readonly ApplicationDbContext _context = context;
    private readonly UserManager<ApplicationUser> _userManager = userManager;

    public async Task<IEnumerable<PatientResponse>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var patients = await _context.Patients
            .AsNoTracking()
            //.ProjectToType<DoctorResponse>()
            .ToListAsync(cancellationToken);

        //return patients;
        return patients.Adapt<IEnumerable<PatientResponse>>();
    }


    public async Task<IEnumerable<PatientResponse>> GetCurrentAsync(CancellationToken cancellationToken = default)
    {
        var patients = await _context.Patients
            .AsNoTracking()
            //.ProjectToType<DoctorResponse>()
            .Where(p => !p.IsDeleted)
            .ToListAsync(cancellationToken);

        //return patients;
        return patients.Adapt<IEnumerable<PatientResponse>>();
    }
    
    public async Task<Result<PatientResponse>> GetAsync(int id, CancellationToken cancellationToken = default)
    {
        var patient = await _context.Patients.FindAsync(id, cancellationToken);

        if (patient is null)
            return Result.Failure<PatientResponse>(PatientErrors.PatientNotFound);

        return Result.Success(patient.Adapt<PatientResponse>());
    }

    public async Task<Result<PatientResponse>> AddAsync(PatientRequest request, CancellationToken cancellationToken = default)
    {
        var userExists = await _userManager.FindByIdAsync(request.UserId);

        if (userExists is null)
            return Result.Failure<PatientResponse>(UserErrors.UserNotFounded);

        Patient patient;

        try
        {
            patient = request.Adapt<Patient>();

            await _context.Patients.AddAsync(patient, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException ex) when (ex.IsUniqueConstraintViolation())
        {
                return Result.Failure<PatientResponse>(UserErrors.DuplicatedUserId);
        }

        return Result.Success(patient.Adapt<PatientResponse>());
    }

    public async Task<Result> UpdateAsync(int id, PatientRequest request, CancellationToken cancellationToken = default)
    {
        var patient = await _context.Patients.FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
        if (patient is null)
            return Result.Failure(UserErrors.UserNotFounded);


    }
}
