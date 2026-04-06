namespace MedicalClinic.Api.Entities;

public class Patient
{
    public int Id { get; set; }
    public string Address { get; set; } = string.Empty;
    public Gender Gender { get; set; } = default;
    public bool IsDeleted { get; set; } = false;
    public string UserId { get; set; } = default!;

    public ApplicationUser User { get; set; } = default!;
}
public enum Gender
{
    Male = 1,
    Female = 2,
    Other = 3
}