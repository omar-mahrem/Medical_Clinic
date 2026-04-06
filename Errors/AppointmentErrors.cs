namespace MedicalClinic.Api.Errors;

public static class AppointmentErrors
{
    public static readonly Error AppointmentNotFound =
        new("Appointment.NotFound", "Appointment not found", StatusCodes.Status404NotFound);

    public static readonly Error TimeSlotNotAvailable =
        new("Appointment.TimeSlotNotAvailable", "This time slot is not available", StatusCodes.Status409Conflict);

    public static readonly Error NotAuthorized =
        new("Appointment.NotAuthorized", "You are not authorized to perform this action", StatusCodes.Status403Forbidden);

    public static readonly Error AlreadyCancelled =
        new("Appointment.AlreadyCancelled", "Appointment is already cancelled", StatusCodes.Status400BadRequest);

    public static readonly Error CannotCancel =
        new("Appointment.CannotCancel", "Cannot cancel appointment that is already completed", StatusCodes.Status400BadRequest);

    public static readonly Error InvalidStatusTransition =
            new("Appointment.InvalidStatusTransition", "Invalid status transition", StatusCodes.Status400BadRequest);
}
