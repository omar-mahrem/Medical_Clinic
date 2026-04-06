namespace MedicalClinic.Api.Entities;

public class Appointment
{
    public int Id { get; set; }

    public int PatientId { get; set; }
    public int DoctorId { get; set; }

    public AppointmentType Type { get; set; }
    public DateOnly AppointmentDate { get; set; }
    public TimeOnly AppointmentTime { get; set; }
    public string? Reason { get; set; }

    public AppointmentStatus Status { get; set; } = AppointmentStatus.Pending;


    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public bool IsDeleted { get; set; } = false;

    public Patient Patient { get; set; } = default!;
    public Doctor Doctor { get; set; } = default!;
}

public enum AppointmentType
{
    FirstVisit = 1,
    FollowUp = 2,
    Emergency = 3,
    Consultation = 4
}
public enum AppointmentStatus
{
    Pending = 1,
    Confirmed = 2,
    InProgress = 3,
    Completed = 4,
    Cancelled = 5,
    NoShow = 6
}
