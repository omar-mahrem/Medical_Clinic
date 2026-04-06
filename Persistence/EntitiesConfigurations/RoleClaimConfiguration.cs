namespace MedicalClinic.Api.Persistence.EntitiesConfigurations;

public class RoleClaimConfiguration : IEntityTypeConfiguration<IdentityRoleClaim<string>>
{
    public void Configure(EntityTypeBuilder<IdentityRoleClaim<string>> builder)
    {
        // ========== Admin Claims ==========
        var permissions = Permissions.GetAllPermissions();
        var adminClaims = new List<IdentityRoleClaim<string>>();
        for (int i = 0; i < permissions.Count; i++)
        {
            adminClaims.Add(new IdentityRoleClaim<string>
            {
                Id = i + 1,
                ClaimType = Permissions.Type,
                ClaimValue = permissions[i],
                RoleId = DefaultRoles.AdminRoleId
            });
        }

        // ========== Doctor Claims ==========
        var startDId = 1000;
        var doctorPermissions = new[]
        {
            Permissions.AddDoctors,
            Permissions.UpdateDoctors,
            Permissions.GetDoctors,
            Permissions.DeleteDoctors,
            Permissions.GetAppointments,
            Permissions.ChangeAppointmentsStatus,
            Permissions.GetMedicalRecords,
            Permissions.GetMedicalRecordsHistory,
            Permissions.AddMedicalRecords,
            Permissions.UpdateMedicalRecords,
            Permissions.DeleteMedicalRecords,
            Permissions.GetPatients
        };
        var doctorClaims = new List<IdentityRoleClaim<string>>();
        for (int i = 0; i < doctorPermissions.Length; i++)
        {
            doctorClaims.Add(new IdentityRoleClaim<string>
            {
                Id = startDId + i + 1,
                ClaimType = Permissions.Type,
                ClaimValue = doctorPermissions[i],
                RoleId = DefaultRoles.DoctorRoleId
            });
        }

        // ========== Patient Claims ==========
        var startPId = 2000;
        var patientPermissions = new[]
        {
            Permissions.AddPatients,
            Permissions.UpdatePatients,
            Permissions.GetPatients,
            Permissions.DeletePatients,
            Permissions.AddAppointments,
            Permissions.GetAppointments,
            Permissions.UpdateAppointments,
            Permissions.CancelAppointments
        };
        var patientClaims = new List<IdentityRoleClaim<string>>();
        for (int i = 0; i < patientPermissions.Length; i++)
        {
            patientClaims.Add(new IdentityRoleClaim<string>
            {
                Id = startPId + i + 1,
                ClaimType = Permissions.Type,
                ClaimValue = patientPermissions[i],
                RoleId = DefaultRoles.PatientRoleId
            });
        }

        // ========== Receptionist Claims ==========
        var startRId = 3000;
        var receptionistPermissions = new[]
        {
            Permissions.GetDoctors,
            Permissions.GetPatients,
            Permissions.GetAppointments,
            Permissions.GetAllUsersAppointments,
            Permissions.AddAppointments,
            Permissions.ChangeAppointmentsStatus,
            Permissions.GetMedicalRecords,
            Permissions.GetMedicalRecordsHistory
        };
        var receptionistClaims = new List<IdentityRoleClaim<string>>();
        for (int i = 0; i < receptionistPermissions.Length; i++)
        {
            receptionistClaims.Add(new IdentityRoleClaim<string>
            {
                Id = startRId + i + 1,
                ClaimType = Permissions.Type,
                ClaimValue = receptionistPermissions[i],
                RoleId = DefaultRoles.ReceptionistRoleId
            });
        }

        // ========== Seed All Claims ==========
        builder.HasData(adminClaims);
        builder.HasData(doctorClaims);
        builder.HasData(patientClaims);
        builder.HasData(receptionistClaims);
    }
}