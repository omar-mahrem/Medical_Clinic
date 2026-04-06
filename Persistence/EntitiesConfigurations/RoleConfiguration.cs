namespace MedicalClinic.Api.Persistence.EntitiesConfigurations;

public class RoleConfiguration : IEntityTypeConfiguration<ApplicationRole>
{
    public void Configure(EntityTypeBuilder<ApplicationRole> builder)
    {
        // Seed Data

        builder.HasData([
            new ApplicationRole
            {
                Id = DefaultRoles.AdminRoleId,
                Name = DefaultRoles.Admin,
                NormalizedName = DefaultRoles.Admin.ToUpper(),
                ConcurrencyStamp = DefaultRoles.AdminConcurrencyStamp
            },
            new ApplicationRole
            {
                Id = DefaultRoles.DoctorRoleId,
                Name = DefaultRoles.Doctor,
                NormalizedName = DefaultRoles.Doctor.ToUpper(),
                ConcurrencyStamp = DefaultRoles.DoctorConcurrencyStamp
            },
            new ApplicationRole
            {
                Id = DefaultRoles.PatientRoleId,
                Name = DefaultRoles.Patient,
                NormalizedName = DefaultRoles.Patient.ToUpper(),
                ConcurrencyStamp = DefaultRoles.PatientConcurrencyStamp,
                IsDefault = true
            },
            new ApplicationRole
            {
                Id = DefaultRoles.ReceptionistRoleId,
                Name = DefaultRoles.Receptionist,
                NormalizedName = DefaultRoles.Receptionist.ToUpper(),
                ConcurrencyStamp = DefaultRoles.ReceptionistConcurrencyStamp
            },
        ]);

    }
}
