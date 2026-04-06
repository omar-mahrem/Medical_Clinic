namespace MedicalClinic.Api.Abstractions.Const;

public static class Permissions
{
    public static string Type { get; } = "permissions";

    public const string GetDoctors = "doctors:read";
    public const string AddDoctors = "doctors:add";
    public const string UpdateDoctors = "doctors:update";
    public const string DeleteDoctors = "doctors:delete";
    public const string ResetDoctors = "doctors:reset";

    public const string GetPatients = "patients:read";
    public const string AddPatients = "patients:add";
    public const string UpdatePatients = "patients:update";
    public const string DeletePatients = "patients:delete";
    public const string ResetPatients = "patients:reset";

    public const string GetMedicalRecords = "MedicalRecords:read";
    public const string GetMedicalRecordsHistory = "MedicalRecords:readHistory";
    public const string AddMedicalRecords = "MedicalRecords:add";
    public const string UpdateMedicalRecords = "MedicalRecords:update";
    public const string DeleteMedicalRecords = "MedicalRecords:delete";

    public const string GetAppointments = "appointments:read";
    public const string AddAppointments = "appointments:add";
    public const string UpdateAppointments = "appointments:update";
    public const string CancelAppointments = "appointments:cancel";
    public const string ChangeAppointmentsStatus = "appointments:status";
    public const string GetAllUsersAppointments = "appointments:manage";

    public const string GetUsers = "users:read";
    public const string AddUsers = "users:add";
    public const string UpdateUsers = "users:update";

    public const string GetRoles = "roles:read";
    public const string AddRoles = "roles:add";
    public const string UpdateRoles = "roles:update";

    public static IList<string?> GetAllPermissions() =>
        typeof(Permissions).GetFields().Select(f => f.GetValue(f) as string).ToList();
}
