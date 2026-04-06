namespace MedicalClinic.Api.Persistence.EntitiesConfigurations;

public class DoctorConfiguration : IEntityTypeConfiguration<Doctor>
{
    public void Configure(EntityTypeBuilder<Doctor> builder)
    {
        builder.Property(d => d.Specialization)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(d => d.Qualifications)
            .HasMaxLength(500);

        builder.Property(d => d.LicenseNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(d => d.IsAvailable)
            .HasDefaultValue(true);

        builder.Property(d => d.IsDeleted)
            .HasDefaultValue(false);

        builder.Property(d => d.YearsOfExperience)
            .HasDefaultValue(0);

        builder.HasIndex(d => d.UserId)
            .IsUnique();

        builder.HasIndex(d => d.IsDeleted); // ✅ أضف index

        builder.HasIndex(d => d.LicenseNumber)
            .IsUnique();

        builder.Property(d => d.Gender)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(10);

        // ✅ أضف index لو هتعمل filtering كتير
        builder.HasIndex(d => d.Gender);

        builder.HasOne(d => d.User)
        .WithOne()
        .HasForeignKey<Doctor>(d => d.UserId);

        builder.HasOne(d => d.CreatedBy)
            .WithMany()
            .HasForeignKey(d => d.CreatedById);

        builder.HasOne(d => d.User)
            .WithOne()
            .HasForeignKey<Doctor>(d => d.UserId);

        builder.HasOne(d => d.CreatedBy)
            .WithMany()
            .HasForeignKey(d => d.CreatedById);

    }
}
