using Microsoft.EntityFrameworkCore.Infrastructure;

namespace MedicalClinic.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<Doctor> Doctors { get; set; }
    DbSet<Patient> Patients { get; set; }
    DbSet<Appointment> Appointments { get; set; }
    DbSet<MedicalRecord> MedicalRecords { get; set; }
    DbSet<Prescription> Prescriptions { get; set; }

    DbSet<ApplicationUser> Users { get; set; }
    DbSet<ApplicationRole> Roles { get; set; }
    DbSet<IdentityRoleClaim<string>> RoleClaims { get; set; }
    DbSet<IdentityUserRole<string>> UserRoles { get; set; }

    DatabaseFacade Database { get; }

    Task AddRangeAsync(IEnumerable<object> entities, CancellationToken cancellationToken = default);
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
