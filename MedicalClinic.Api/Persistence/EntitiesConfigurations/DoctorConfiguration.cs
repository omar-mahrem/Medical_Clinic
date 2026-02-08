namespace MedicalClinic.Api.Persistence.EntitiesConfigurations;

public class DoctorConfiguration : IEntityTypeConfiguration<Doctor>
{
    public void Configure(EntityTypeBuilder<Doctor> builder)
    {
        builder.Property(d => d.FirstName)
            .HasMaxLength(50);

        builder.Property(d => d.MiddleName)
            .HasMaxLength(50);

        builder.Property(d => d.LastName)
            .HasMaxLength(50);

        builder.Property(d => d.Specialization)
            .HasMaxLength(maxLength: 150);

        builder.HasIndex(p => p.UserId)
            .IsUnique();
    }
}
