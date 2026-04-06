using Microsoft.AspNetCore.Identity.EntityFrameworkCore;

namespace MedicalClinic.Api.Persistence;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> option) :
    IdentityDbContext<ApplicationUser, ApplicationRole, string>(option)
{

    public DbSet<Doctor> Doctors { get; set; }
    public DbSet<Patient> Patients { get; set; }
    public DbSet<Appointment> Appointments { get; set; }
    public DbSet<MedicalRecord> MedicalRecords { get; set; }
    public DbSet<Prescription> Prescriptions { get; set; }


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

        var cascadeFKs = modelBuilder.Model
            .GetEntityTypes()
            .SelectMany(t => t.GetForeignKeys())
            .Where(fk => fk.DeleteBehavior == DeleteBehavior.Cascade && !fk.IsOwnership);

        foreach (var fk in cascadeFKs)
            fk.DeleteBehavior = DeleteBehavior.Restrict;

        // Global query filter for soft delete
        modelBuilder.Entity<ApplicationUser>()
            .HasQueryFilter(u => !u.IsDeleted);

        modelBuilder.Entity<Doctor>()
            .HasQueryFilter(d => !d.IsDeleted);

        modelBuilder.Entity<Patient>()
            .HasQueryFilter(p => !p.IsDeleted);

        base.OnModelCreating(modelBuilder);
    }

}
