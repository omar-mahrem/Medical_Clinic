namespace MedicalClinic.Api.Persistence.EntitiesConfigurations;

public class PatientConfiguration : IEntityTypeConfiguration<Patient>
{
    public void Configure(EntityTypeBuilder<Patient> builder)
    {

        builder.Property(p => p.Address)
            .HasMaxLength(200);

        builder.Property(p => p.Gender)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(10);

        builder.Property(p => p.IsDeleted)
            .HasDefaultValue(false);

        // Indexes
        builder.HasIndex(p => p.UserId)
            .IsUnique();

        builder.HasIndex(p => p.IsDeleted);

        builder.HasOne(p => p.User)
            .WithOne()
            .HasForeignKey<Patient>(p => p.UserId);
    }
}
