using MedicalClinic.Api.Errors;
using Microsoft.AspNetCore.RateLimiting;
using System.Text.Json.Serialization;
using System.Threading.RateLimiting;

namespace MedicalClinic.Api;

public static class DependencyInjection
{
    public static IServiceCollection AddDependencies(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddControllers()
            .AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.Converters.Add(
                    new JsonStringEnumConverter()
                );
            });

        services.AddOpenApi();

        // Application Layer Dependencies (Services, Mapping, Validation)
        services.AddApplicationDependencies();

        // Infrastructure Layer Dependencies (DbContext, Identity, Auth, Hangfire, Mail)
        services.AddInfrastructureDependencies(configuration);

        // API Layer Configuration
        services
            .AddCorsConfiguration(configuration)
            .AddRateLimitingConfiguration();

        services.AddHealthChecks()
            .AddDbContextCheck<ApplicationDbContext>(name: "Database")
            .AddHangfire(options => options.MinimumAvailableServers = 1);

        services.AddExceptionHandler<GlobalExceptionHandler>();
        services.AddProblemDetails();

        services.AddHttpContextAccessor();

        return services;
    }

    private static IServiceCollection AddCorsConfiguration(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var configured = configuration.GetSection("AllowedOrigins").Get<string[]>() ?? [];
        var defaults = new[] { 
            "http://localhost:4200", 
            "http://127.0.0.1:4200",
            "http://localhost:8080",
            "http://127.0.0.1:8080",
            "http://localhost:5000",
            "http://127.0.0.1:5000"
        };
        var origins = configured.Concat(defaults).Distinct().ToArray();

        services.AddCors(options =>
            options.AddDefaultPolicy(builder =>
                builder
                .AllowAnyMethod()
                .AllowAnyHeader()
                .WithOrigins(origins)
            )
        );

        return services;
    }

    private static IServiceCollection AddRateLimitingConfiguration(this IServiceCollection services)
    {
        services.AddRateLimiter(rateLimiterOptions =>
        {
            rateLimiterOptions.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

            rateLimiterOptions.AddPolicy(RateLimiters.IpLimiter, httpContext =>
                RateLimitPartition.GetFixedWindowLimiter(
                    partitionKey: httpContext.Connection.RemoteIpAddress?.ToString(),
                    factory: _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = 2,
                        Window = TimeSpan.FromSeconds(20)
                    }
                )
            );

            rateLimiterOptions.AddPolicy(RateLimiters.UserLimiter, httpContext =>
                RateLimitPartition.GetFixedWindowLimiter(
                    partitionKey: httpContext.User.GetUserId(),
                    factory: _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = 2,
                        Window = TimeSpan.FromSeconds(20)
                    }
                )
            );

            rateLimiterOptions.AddConcurrencyLimiter(RateLimiters.Concurrency, options =>
            {
                options.PermitLimit = 1000;
                options.QueueLimit = 100;
                options.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
            });
        });

        return services;
    }
}
