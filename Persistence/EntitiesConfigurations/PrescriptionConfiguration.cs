namespace MedicalClinic.Api.Persistence.EntitiesConfigurations;

public class PrescriptionConfiguration : IEntityTypeConfiguration<Prescription>
{
    public void Configure(EntityTypeBuilder<Prescription> builder)
    {
        builder.Property(p => p.MedicationName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(p => p.Dosage)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(p => p.Frequency)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(p => p.Instructions)
            .HasMaxLength(500);

        builder.Property(p => p.IsDeleted)
            .HasDefaultValue(false);

        builder.Property(p => p.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        // Indexes
        builder.HasIndex(p => p.MedicalRecordId)
            .HasDatabaseName("IX_Prescriptions_MedicalRecordId");

        builder.HasIndex(p => p.IsDeleted)
            .HasDatabaseName("IX_Prescriptions_IsDeleted");

        // Relationships
        builder.HasOne(p => p.MedicalRecord)
            .WithMany(m => m.Prescriptions)
            .HasForeignKey(p => p.MedicalRecordId);

        // Query filter
        builder.HasQueryFilter(p => !p.IsDeleted);
    }
}