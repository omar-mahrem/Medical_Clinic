namespace MedicalClinic.Api.Persistence.EntitiesConfigurations;

public class MedicalRecordConfiguration : IEntityTypeConfiguration<MedicalRecord>
{
    public void Configure(EntityTypeBuilder<MedicalRecord> builder)
    {
        builder.Property(m => m.Diagnosis)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(m => m.Symptoms)
            .IsRequired()
            .HasMaxLength(1000);

        builder.Property(m => m.Treatment)
            .IsRequired()
            .HasMaxLength(1000);

        builder.Property(m => m.Notes)
            .HasMaxLength(2000);

        builder.Property(m => m.BloodPressure)
            .HasMaxLength(20);

        builder.Property(m => m.Temperature)
            .HasPrecision(4, 1);

        builder.Property(m => m.Weight)
            .HasPrecision(5, 2);

        builder.Property(m => m.Height)
            .HasPrecision(5, 2);

        builder.Property(m => m.IsDeleted)
            .HasDefaultValue(false);

        builder.Property(m => m.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        // Indexes
        builder.HasIndex(m => m.AppointmentId)
            .IsUnique()
            .HasDatabaseName("IX_MedicalRecords_AppointmentId");

        builder.HasIndex(m => m.PatientId)
            .HasDatabaseName("IX_MedicalRecords_PatientId");

        builder.HasIndex(m => m.DoctorId)
            .HasDatabaseName("IX_MedicalRecords_DoctorId");

        builder.HasIndex(m => m.IsDeleted)
            .HasDatabaseName("IX_MedicalRecords_IsDeleted");

        // Relationships
        builder.HasOne(m => m.Appointment)
            .WithOne()
            .HasForeignKey<MedicalRecord>(m => m.AppointmentId);

        builder.HasOne(m => m.Patient)
            .WithMany()
            .HasForeignKey(m => m.PatientId);

        builder.HasOne(m => m.Doctor)
            .WithMany()
            .HasForeignKey(m => m.DoctorId);

        // Query filter
        builder.HasQueryFilter(m => !m.IsDeleted);
    }
}
