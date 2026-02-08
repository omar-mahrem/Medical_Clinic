namespace MedicalClinic.Api.Entities;

public class Patient : AuditableEntity
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string? MiddleName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public DateOnly DateOfBirth { get; set; }
    public string UserId { get; set; } = default!;
    public Gender Gender { get; set; } = default;
    public bool IsDeleted { get; set; } = false;

    public ApplicationUser User { get; set; } = default!;
}
public enum Gender
{
    Male = 1,
    Female = 2,
    Other = 3
}