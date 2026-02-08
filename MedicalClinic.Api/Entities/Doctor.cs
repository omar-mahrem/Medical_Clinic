namespace MedicalClinic.Api.Entities;

public sealed class Doctor : AuditableEntity
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string? MiddleName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Specialization { get; set; } = string.Empty;
    public bool IsAvailable { get; set; } = true;
    public DateOnly DateOfBirth { get; set; }
    public string UserId { get; set; } = default!;

    public ApplicationUser User { get; set; } = default!;

}
