namespace MedicalClinic.Api.Persistence.EntitiesConfigurations;

public class UserConfiguration : IEntityTypeConfiguration<ApplicationUser>
{
    public void Configure(EntityTypeBuilder<ApplicationUser> builder)
    {
        builder
            .OwnsMany(x => x.RefreshTokens)
            .ToTable("RefreshTokens")
            .WithOwner()
            .HasForeignKey("UserId");


        builder.Property(d => d.FirstName).HasMaxLength(50);
        builder.Property(d => d.LastName).HasMaxLength(50);
    }
}
