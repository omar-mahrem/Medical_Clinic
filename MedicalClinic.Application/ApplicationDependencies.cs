using MedicalClinic.Application.Mapping;
using MedicalClinic.Application.Services;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;

namespace MedicalClinic.Application;

public static class ApplicationDependencies
{
    public static IServiceCollection AddApplicationDependencies(this IServiceCollection services)
    {
        // FluentValidation
        services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

        // Mapster
        var mappingConfig = TypeAdapterConfig.GlobalSettings;
        mappingConfig.Scan(Assembly.GetExecutingAssembly());
        services.AddSingleton<IMapper>(new Mapper(mappingConfig));

        // Application Services
        services.AddScoped<IAuthServices, AuthServices>();
        services.AddScoped<IAccountSetup, AccountSetup>();
        services.AddScoped<IAppointmentServices, AppointmentServices>();
        services.AddScoped<IMedicalRecordServices, MedicalRecordServices>();
        services.AddScoped<IRoleServices, RoleServices>();
        services.AddScoped<IDoctorServices, DoctorServices>();
        services.AddScoped<IPatientServices, PatientServices>();
        services.AddScoped<IUserServices, UserServices>();

        return services;
    }
}
