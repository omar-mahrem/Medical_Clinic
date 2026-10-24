using MedicalClinic.Api;
using Hangfire;
using HangfireBasicAuthenticationFilter;
using HealthChecks.UI.Client;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Scalar.AspNetCore;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDependencies(builder.Configuration);

builder.Host.UseSerilog((context, configuration) =>
    configuration.ReadFrom.Configuration(context.Configuration)
);

var app = builder.Build();

// 0. Ensure Database schema and seed data are applied before Hangfire and background workers start
await DbInitializer.SeedDataAsync(app.Services);

if (app.Environment.IsDevelopment())
{
    // app.MapOpenApi();
    // app.MapScalarApiReference();
    // app.UseSwagger();
    // app.UseSwaggerUI();
}

app.UseSerilogRequestLogging();

app.UseCors();

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseHangfireDashboard("/jobs", new DashboardOptions
{
    Authorization =
    [
        new HangfireCustomBasicAuthenticationFilter
        {
            User = app.Configuration.GetValue<string>("HangfireSettings:Username"),
            Pass = app.Configuration.GetValue<string>("HangfireSettings:Password")
        }
    ],
    DashboardTitle = "Medical Clinic Dashboard"
});

RecurringJob.AddOrUpdate<INotificationService>(
    recurringJobId: "send-appointment-reminders",
    methodCall: service => service.SendAppointmentRemindersAsync(),
    cronExpression: Cron.Hourly);

app.UseExceptionHandler();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.UseHealthChecks("/health", new HealthCheckOptions
{
    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
});

app.Run();
