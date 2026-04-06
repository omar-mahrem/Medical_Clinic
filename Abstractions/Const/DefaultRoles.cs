namespace MedicalClinic.Api.Abstractions.Const;

public static class DefaultRoles
{
    public const string Admin = nameof(Admin);
    public const string AdminRoleId = "019c80da-b12e-7b2c-96ef-911b36c89b54";
    public const string AdminConcurrencyStamp = "019c80da-b12e-7b2c-96ef-911cf800633a";

    public const string Doctor = nameof(Doctor);
    public const string DoctorRoleId = "019c80db-6095-71fe-80c1-cbf801d06a5a";
    public const string DoctorConcurrencyStamp = "019c80db-6095-71fe-80c1-cbf956e49587";

    public const string Patient = nameof(Patient);
    public const string PatientRoleId = "019c80dc-140f-73be-b6a1-cd26e6b1c0e3";
    public const string PatientConcurrencyStamp = "019c80db-c560-7fd7-8a45-d0ec138e9bac";

    public const string Receptionist = nameof(Receptionist);
    public const string ReceptionistRoleId = "019c80dc-140f-73be-b6a1-cd238cda114e";
    public const string ReceptionistConcurrencyStamp = "019c80dc-140f-73be-b6a1-cd24882c9d39";

}
