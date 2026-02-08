using MedicalClinic.Api.Extentions;

namespace MedicalClinic.Api.Mapping;

public class MappingConfigurations : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        config.NewConfig<Doctor, DoctorResponse>()
            .Map(dest => dest.Age, src => src.DateOfBirth.CalculateAge());

        config.NewConfig<RegisterRequest, ApplicationUser>()
            .Map(dest => dest.UserName, src => src.Email);
    }
}
