using MedicalClinic.Api.Entities;
using Microsoft.AspNetCore.Identity;

namespace MedicalClinic.Api.Services;

public class DoctorServices(ApplicationDbContext context, UserManager<ApplicationUser> userManager) : IDoctorServices
{
    private readonly ApplicationDbContext _context = context;
    private readonly UserManager<ApplicationUser> _userManager = userManager;

    public async Task<IEnumerable<DoctorResponse>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var doctors =  await _context.Doctors
        .AsNoTracking()
        //.ProjectToType<DoctorResponse>()
        .ToListAsync(cancellationToken);

        return doctors.Adapt<IEnumerable<DoctorResponse>>();
    }

    public async Task<IEnumerable<DoctorResponse>> GetAvailableAsync(CancellationToken cancellationToken = default)
    {
        var doctors =  await _context.Doctors
        .AsNoTracking()
        //.ProjectToType<DoctorResponse>()
        .Where(x => x.IsAvailable)
        .ToListAsync(cancellationToken);

        return doctors.Adapt<IEnumerable<DoctorResponse>>();
    }

    public async Task<Result<DoctorResponse>> GetAsync(int id, CancellationToken cancellationToken = default)
    {
        var doctor = await _context.Doctors.FindAsync(id, cancellationToken);
        
        if (doctor is null)
            return Result.Failure<DoctorResponse>(DoctorErrors.DoctorNotFound);

        return Result.Success(doctor.Adapt<DoctorResponse>());
    }

    public async Task<Result<DoctorResponse>> AddAsync(DoctorRequest request, CancellationToken cancellationToken = default)
    {
        var userExists = await _userManager.FindByIdAsync(request.UserId);

        if (userExists is null)
            return Result.Failure<DoctorResponse>(UserErrors.UserNotFounded);


        Doctor doctor;

        try
        {
            doctor = request.Adapt<Doctor>();

            await _context.Doctors.AddAsync(doctor, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException ex) when (ex.IsUniqueConstraintViolation())
        {
            return Result.Failure<DoctorResponse>(UserErrors.DuplicatedUserId);
        }

        return Result.Success(doctor.Adapt<DoctorResponse>());
    }

    public async Task<Result> UpdateAsync(int id, DoctorRequest request, CancellationToken cancellationToken = default)
    {
        var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.Id == id, cancellationToken);

        if (doctor is null)
            return Result.Failure(DoctorErrors.DoctorNotFound);

        doctor.FirstName = request.FirstName;
        doctor.MiddleName = request.MiddleName;
        doctor.LastName = request.LastName;
        doctor.DateOfBirth = request.DateOfBirth;
        doctor.PhoneNumber = request.PhoneNumber;
        doctor.Specialization = request.Specialization;

        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }

    public async Task<Result> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.Id == id, cancellationToken);

        if (doctor is null)
            return Result.Failure(DoctorErrors.DoctorNotFound);

        _context.Remove(doctor);
        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }

    public async Task<Result> ToggleAvailableAsync(int id, CancellationToken cancellationToken = default)
    {
        var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.Id == id);

        if (doctor is null)
            return Result.Failure(DoctorErrors.DoctorNotFound);

        doctor.IsAvailable = !doctor.IsAvailable;


        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
