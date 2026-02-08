namespace MedicalClinic.Api.Persistence.EntitiesConfigurations;

public class PatientConfiguration : IEntityTypeConfiguration<Patient>
{
    public void Configure(EntityTypeBuilder<Patient> builder)
    {
        builder.Property(d => d.FirstName)
            .HasMaxLength(50);

        builder.Property(d => d.MiddleName)
            .HasMaxLength(50);
        
        builder.Property(d => d.LastName)
            .HasMaxLength(50);
        
        builder.Property(d => d.Address)
            .HasMaxLength(400);

        builder.HasIndex(p => p.UserId)
            .IsUnique();
    }
}
