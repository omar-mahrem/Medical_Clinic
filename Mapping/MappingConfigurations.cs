using MedicalClinic.Api.Contract.User;

namespace MedicalClinic.Api.Mapping;

public class MappingConfigurations : IRegister
{
    public void Register(TypeAdapterConfig config)
    {

        // Register → ApplicationUser
        config.NewConfig<RegisterRequest, ApplicationUser>()
            .Map(dest => dest.UserName, src => src.Email)
            .Map(dest => dest.Email, src => src.Email)
            .Map(dest => dest.DateOfBirth, src => src.DateOfBirth)
            .Map(dest => dest.EmailConfirmed, _ => false)
            .Map(dest => dest.IsDeleted, _ => false)
            .Map(dest => dest.CreatedAt, _ => DateTime.UtcNow);

        // CreateDoctorRequest → ApplicationUser
        config.NewConfig<CreateDoctorRequest, ApplicationUser>()
            .Map(dest => dest.UserName, src => src.Email)
            .Map(dest => dest.Email, src => src.Email)
            .Map(dest => dest.FirstName, src => src.FirstName)
            .Map(dest => dest.MiddleName, src => src.MiddleName)
            .Map(dest => dest.LastName, src => src.LastName)
            .Map(dest => dest.PhoneNumber, src => src.PhoneNumber)
            .Map(dest => dest.DateOfBirth, src => src.DateOfBirth)
            .Map(dest => dest.EmailConfirmed, _ => false)
            .Map(dest => dest.IsDeleted, _ => false)
            .Map(dest => dest.CreatedAt, _ => DateTime.UtcNow);


        // CreateDoctorRequest → Doctor
        config.NewConfig<CreateDoctorRequest, Doctor>()
            .Map(dest => dest.Qualifications, src => src.Qualifications)
            .Map(dest => dest.Specialization, src => src.Specialization)
            .Map(dest => dest.LicenseNumber, src => src.LicenseNumber)
            .Map(dest => dest.YearsOfExperience, src => src.YearsOfExperience)
            .Map(dest => dest.IsAvailable, _ => true)
            .Map(dest => dest.Gender, src => src.Gender)
            .Map(dest => dest.IsDeleted, _ => false)
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.UserId)
            .Ignore(dest => dest.CreatedById!)
            .Ignore(dest => dest.User)
            .Ignore(dest => dest.CreatedBy!);

        // Doctor → DoctorResponse (with navigation properties)
        config.NewConfig<Doctor, DoctorResponse>()
            .Map(dest => dest.Id, src => src.Id)
            .Map(dest => dest.FirstName, src => src.User.FirstName)
            .Map(dest => dest.MiddleName, src => src.User.MiddleName)
            .Map(dest => dest.LastName, src => src.User.LastName)
            .Map(dest => dest.Email, src => src.User.Email)
            .Map(dest => dest.PhoneNumber, src => src.User.PhoneNumber)
            .Map(dest => dest.Gender, src => src.Gender)
            .Map(dest => dest.DateOfBirth, src => src.User.DateOfBirth)
            .Map(dest => dest.Qualifications, src => src.Qualifications)
            .Map(dest => dest.Specialization, src => src.Specialization)
            .Map(dest => dest.LicenseNumber, src => src.LicenseNumber)
            .Map(dest => dest.YearsOfExperience, src => src.YearsOfExperience)
            .Map(dest => dest.UserId, src => src.UserId)
            .Map(dest => dest.CreatedById, src => src.CreatedById)
            .Map(dest => dest.IsAvailable, src => src.IsAvailable);

        // CreatePatientRequest → ApplicationUser
        config.NewConfig<CreatePatientRequest, ApplicationUser>()
            .Map(dest => dest.UserName, src => src.Email)
            .Map(dest => dest.Email, src => src.Email)
            .Map(dest => dest.FirstName, src => src.FirstName)
            .Map(dest => dest.MiddleName, src => src.MiddleName)
            .Map(dest => dest.LastName, src => src.LastName)
            .Map(dest => dest.PhoneNumber, src => src.PhoneNumber)
            .Map(dest => dest.DateOfBirth, src => src.DateOfBirth)
            .Map(dest => dest.EmailConfirmed, _ => false)
            .Map(dest => dest.IsDeleted, _ => false)
            .Map(dest => dest.CreatedAt, _ => DateTime.UtcNow);

        // CreatePatientRequest → Patient
        config.NewConfig<CreatePatientRequest, Patient>()
            .Map(dest => dest.Address, src => src.Address)
            .Map(dest => dest.Gender, src => src.Gender)
            .Map(dest => dest.IsDeleted, _ => false)
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.UserId)
            .Ignore(dest => dest.User);

        // Patient → PatientResponse
        config.NewConfig<Patient, PatientResponse>()
            .Map(dest => dest.Id, src => src.Id)
            .Map(dest => dest.FirstName, src => src.User.FirstName)
            .Map(dest => dest.MiddleName, src => src.User.MiddleName)
            .Map(dest => dest.LastName, src => src.User.LastName)
            .Map(dest => dest.Address, src => src.Address)
            .Map(dest => dest.Email, src => src.User.Email)
            .Map(dest => dest.PhoneNumber, src => src.User.PhoneNumber)
            .Map(dest => dest.Gender, src => src.Gender)
            .Map(dest => dest.DateOfBirth, src => src.User.DateOfBirth)
            .Map(dest => dest.UserId, src => src.UserId);

        // ApplicationRole → RoleResponse
        config.NewConfig<ApplicationRole, RoleResponse>()
            .Map(dest => dest.Id, src => src.Id)
            .Map(dest => dest.IsDeleted, src => src.IsDeleted)
            .Map(dest => dest.Name, src => src.Name);

        /////////////////
        config.NewConfig<(ApplicationUser user, IList<string> roles), UserResponse>()
            .Map(dest => dest, src => src.user)
            .Map(dest => dest.Roles, src => src.roles);

        config.NewConfig<CreateUserRequest, ApplicationUser>()
            .Map(dest => dest.UserName, src => src.Email)
            .Map(dest => dest.EmailConfirmed, src => true);

        config.NewConfig<UpdateUserRequest, ApplicationUser>()
            .Map(dest => dest.UserName, src => src.Email)
            .Map(dest => dest.NormalizedUserName, src => src.Email.ToUpper());

    }
}
