using MedicalClinic.Core.Abstractions.Const;
using MedicalClinic.Core.Entities;
using MedicalClinic.Infrastructure.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace MedicalClinic.Infrastructure.Data;

public static class DbInitializer
{
    public static async Task SeedDataAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<ApplicationRole>>();
        var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("DbInitializer");

        try
        {
            // 0. Ensure Database schema and tables are created
            var databaseCreator = context.Database.GetService<IDatabaseCreator>() as IRelationalDatabaseCreator;
            if (databaseCreator != null)
            {
                if (!await databaseCreator.ExistsAsync())
                {
                    await databaseCreator.CreateAsync();
                }
                try
                {
                    await databaseCreator.CreateTablesAsync();
                }
                catch
                {
                    // Tables already exist
                }
            }

            // 1. Ensure Roles exist
            string[] roles = [DefaultRoles.Admin, DefaultRoles.Doctor, DefaultRoles.Patient, DefaultRoles.Receptionist];
            foreach (var role in roles)
            {
                if (!await roleManager.RoleExistsAsync(role))
                {
                    await roleManager.CreateAsync(new ApplicationRole { Name = role });
                }
            }

            // 2. Ensure Admin User exists
            var adminUser = await userManager.FindByEmailAsync(DefaultUsers.AdminEmail);
            if (adminUser is null)
            {
                adminUser = new ApplicationUser
                {
                    Id = DefaultUsers.AdminId,
                    FirstName = DefaultUsers.AdminFirstName,
                    LastName = DefaultUsers.AdminLastName,
                    UserName = DefaultUsers.AdminEmail,
                    Email = DefaultUsers.AdminEmail,
                    PhoneNumber = DefaultUsers.AdminPhoneNumber,
                    EmailConfirmed = true,
                    PhoneNumberConfirmed = true
                };
                await userManager.CreateAsync(adminUser, DefaultUsers.AdminPassword);
                await userManager.AddToRoleAsync(adminUser, DefaultRoles.Admin);
            }
            else
            {
                if (!await userManager.IsInRoleAsync(adminUser, DefaultRoles.Admin))
                {
                    await userManager.AddToRoleAsync(adminUser, DefaultRoles.Admin);
                }

                if (!await userManager.CheckPasswordAsync(adminUser, DefaultUsers.AdminPassword))
                {
                    await userManager.RemovePasswordAsync(adminUser);
                    await userManager.AddPasswordAsync(adminUser, DefaultUsers.AdminPassword);
                    adminUser.EmailConfirmed = true;
                    await userManager.UpdateAsync(adminUser);
                }
            }

            // 3. Seed Doctors (Password: Doctor@2026) - Egyptian names, mix of Arabic & English
            var doctorPassword = "Doctor@2026";
            var seedDoctors = new[]
            {
                new
                {
                    FirstName = "طارق",
                    LastName = "منصور",
                    Email = "dr.tarek@clinic.com",
                    Phone = "01011112233",
                    Specialization = "أمراض القلب والأوعية الدموية",
                    Qualifications = "دكتوراه أمراض القلب - قصر العيني، زميل الجمعية الأوروبية لأمراض القلب",
                    Experience = 14,
                    License = "DOC-EGY-CARD-101",
                    Gender = Gender.Male,
                    WorkStartTime = new TimeOnly(9, 30),
                    WorkEndTime = new TimeOnly(14, 0),
                    EveningStartTime = new TimeOnly(17, 0),
                    EveningEndTime = new TimeOnly(22, 0),
                    SlotMinutes = 30,
                    Fee = 500m
                },
                new
                {
                    FirstName = "Sarah",
                    LastName = "Mahmoud",
                    Email = "dr.sarah@clinic.com",
                    Phone = "01022223344",
                    Specialization = "طب وجراحة العيون",
                    Qualifications = "استشاري جراحة العيون وتصحيح الإبصار بالفيمتو ليزك - جامعة عين شمس",
                    Experience = 11,
                    License = "DOC-EGY-OPHT-102",
                    Gender = Gender.Female,
                    WorkStartTime = new TimeOnly(10, 0),
                    WorkEndTime = new TimeOnly(14, 0),
                    EveningStartTime = new TimeOnly(18, 0),
                    EveningEndTime = new TimeOnly(22, 30),
                    SlotMinutes = 20,
                    Fee = 450m
                },
                new
                {
                    FirstName = "أحمد",
                    LastName = "الشناوي",
                    Email = "dr.ahmed@clinic.com",
                    Phone = "01033334455",
                    Specialization = "جراحة العظام والمفاصل",
                    Qualifications = "استشاري جراحة العظام والمفاصل والعمود الفقري - قصر العيني",
                    Experience = 13,
                    License = "DOC-EGY-ORTHO-103",
                    Gender = Gender.Male,
                    WorkStartTime = new TimeOnly(11, 0),
                    WorkEndTime = new TimeOnly(15, 0),
                    EveningStartTime = new TimeOnly(17, 30),
                    EveningEndTime = new TimeOnly(22, 0),
                    SlotMinutes = 30,
                    Fee = 550m
                },
                new
                {
                    FirstName = "Nourhan",
                    LastName = "Abdelaziz",
                    Email = "dr.nourhan@clinic.com",
                    Phone = "01044445566",
                    Specialization = "طب الأطفال وحديثي الولادة",
                    Qualifications = "ماجستير طب الأطفال وحديثي الولادة ورعاية المبتسرين - جامعة القاهرة",
                    Experience = 8,
                    License = "DOC-EGY-PED-104",
                    Gender = Gender.Female,
                    WorkStartTime = new TimeOnly(9, 0),
                    WorkEndTime = new TimeOnly(13, 30),
                    EveningStartTime = new TimeOnly(16, 30),
                    EveningEndTime = new TimeOnly(21, 0),
                    SlotMinutes = 20,
                    Fee = 400m
                },
                new
                {
                    FirstName = "حسام",
                    LastName = "فتحي",
                    Email = "dr.hossam@clinic.com",
                    Phone = "01055556677",
                    Specialization = "أمراض الباطنة والسكر",
                    Qualifications = "استشاري الأمراض الباطنية ومناظير الجهاز الهضمي والغدد الصماء - جامعة الإسكندرية",
                    Experience = 15,
                    License = "DOC-EGY-INT-105",
                    Gender = Gender.Male,
                    WorkStartTime = new TimeOnly(10, 0),
                    WorkEndTime = new TimeOnly(14, 30),
                    EveningStartTime = new TimeOnly(17, 0),
                    EveningEndTime = new TimeOnly(22, 0),
                    SlotMinutes = 20,
                    Fee = 450m
                },
                new
                {
                    FirstName = "Mariam",
                    LastName = "Ibrahim",
                    Email = "dr.mariam@clinic.com",
                    Phone = "01066667788",
                    Specialization = "طب وجراحة الفم والأسنان",
                    Qualifications = "أخصائي تجميل وزراعة الأسنان وعلاج الجذور - ماجستير جراحة الفم",
                    Experience = 7,
                    License = "DOC-EGY-DENT-106",
                    Gender = Gender.Female,
                    WorkStartTime = new TimeOnly(10, 0),
                    WorkEndTime = new TimeOnly(14, 0),
                    EveningStartTime = new TimeOnly(16, 0),
                    EveningEndTime = new TimeOnly(21, 0),
                    SlotMinutes = 30,
                    Fee = 400m
                }
            };

            foreach (var doc in seedDoctors)
            {
                var existingUser = await userManager.FindByEmailAsync(doc.Email);
                if (existingUser is null)
                {
                    var user = new ApplicationUser
                    {
                        FirstName = doc.FirstName,
                        LastName = doc.LastName,
                        UserName = doc.Email,
                        Email = doc.Email,
                        PhoneNumber = doc.Phone,
                        EmailConfirmed = true,
                        PhoneNumberConfirmed = true
                    };

                    var createResult = await userManager.CreateAsync(user, doctorPassword);
                    if (createResult.Succeeded)
                    {
                        await userManager.AddToRoleAsync(user, DefaultRoles.Doctor);

                        var doctor = new Doctor
                        {
                            UserId = user.Id,
                            Specialization = doc.Specialization,
                            Qualifications = doc.Qualifications,
                            LicenseNumber = doc.License,
                            YearsOfExperience = doc.Experience,
                            IsAvailable = true,
                            Gender = doc.Gender,
                            WorkStartTime = doc.WorkStartTime,
                            WorkEndTime = doc.WorkEndTime,
                            EveningStartTime = doc.EveningStartTime,
                            EveningEndTime = doc.EveningEndTime,
                            SlotDurationMinutes = doc.SlotMinutes,
                            ConsultationFee = doc.Fee
                        };

                        context.Doctors.Add(doctor);
                    }
                }
                else
                {
                    if (!await userManager.CheckPasswordAsync(existingUser, doctorPassword))
                    {
                        await userManager.RemovePasswordAsync(existingUser);
                        await userManager.AddPasswordAsync(existingUser, doctorPassword);
                    }
                }
            }
            await context.SaveChangesAsync();
            logger.LogInformation("Doctors seeded successfully.");

            // 4. Seed Receptionists (Password: Reception@2026) - Egyptian names, mix of Arabic & English
            var receptionPassword = "Reception@2026";
            var seedReceptionists = new[]
            {
                new
                {
                    FirstName = "ندى",
                    LastName = "القاضي",
                    Email = "reception.nada@clinic.com",
                    Phone = "01111112233",
                    Gender = Gender.Female
                },
                new
                {
                    FirstName = "Omar",
                    LastName = "El-Sherif",
                    Email = "reception.omar@clinic.com",
                    Phone = "01122223344",
                    Gender = Gender.Male
                },
                new
                {
                    FirstName = "ياسمين",
                    LastName = "ممدوح",
                    Email = "reception.yasmin@clinic.com",
                    Phone = "01133334455",
                    Gender = Gender.Female
                }
            };

            foreach (var rec in seedReceptionists)
            {
                var existingUser = await userManager.FindByEmailAsync(rec.Email);
                if (existingUser is null)
                {
                    var user = new ApplicationUser
                    {
                        FirstName = rec.FirstName,
                        LastName = rec.LastName,
                        UserName = rec.Email,
                        Email = rec.Email,
                        PhoneNumber = rec.Phone,
                        EmailConfirmed = true,
                        PhoneNumberConfirmed = true
                    };

                    var createResult = await userManager.CreateAsync(user, receptionPassword);
                    if (createResult.Succeeded)
                    {
                        await userManager.AddToRoleAsync(user, DefaultRoles.Receptionist);
                    }
                }
                else
                {
                    if (!await userManager.IsInRoleAsync(existingUser, DefaultRoles.Receptionist))
                    {
                        await userManager.AddToRoleAsync(existingUser, DefaultRoles.Receptionist);
                    }
                    if (!await userManager.CheckPasswordAsync(existingUser, receptionPassword))
                    {
                        await userManager.RemovePasswordAsync(existingUser);
                        await userManager.AddPasswordAsync(existingUser, receptionPassword);
                    }
                }
            }
            logger.LogInformation("Receptionists seeded successfully.");

            // 5. Seed Patients (Password: Patient@2026) - Egyptian names, mix of Arabic & English
            var patientPassword = "Patient@2026";
            var seedPatients = new[]
            {
                new
                {
                    FirstName = "مراجع عيادة",
                    LastName = "(Walk-in)",
                    Email = "patient@clinic.com",
                    Phone = "01000000000",
                    BirthDate = new DateOnly(1995, 1, 1),
                    Gender = Gender.Male,
                    Address = "مقر العيادة الرئيسي - القاهرة"
                },
                new
                {
                    FirstName = "محمد",
                    LastName = "إبراهيم خليل",
                    Email = "mohamed.ibrahim@clinic.com",
                    Phone = "01211112233",
                    BirthDate = new DateOnly(1988, 6, 15),
                    Gender = Gender.Male,
                    Address = "المعادي - القاهرة"
                },
                new
                {
                    FirstName = "Fatma",
                    LastName = "Ali",
                    Email = "fatma.ali@clinic.com",
                    Phone = "01222223344",
                    BirthDate = new DateOnly(1996, 3, 22),
                    Gender = Gender.Female,
                    Address = "مدينة نصر - القاهرة"
                },
                new
                {
                    FirstName = "كريم",
                    LastName = "عبد الرحمن",
                    Email = "karim.abdelrahman@clinic.com",
                    Phone = "01233334455",
                    BirthDate = new DateOnly(1992, 11, 8),
                    Gender = Gender.Male,
                    Address = "الدقي - الجيزة"
                },
                new
                {
                    FirstName = "Aya",
                    LastName = "Mahmoud",
                    Email = "aya.mahmoud@clinic.com",
                    Phone = "01244445566",
                    BirthDate = new DateOnly(1999, 9, 14),
                    Gender = Gender.Female,
                    Address = "مصر الجديدة - القاهرة"
                },
                new
                {
                    FirstName = "يوسف",
                    LastName = "النجار",
                    Email = "youssef.elnaggar@clinic.com",
                    Phone = "01255556677",
                    BirthDate = new DateOnly(1990, 4, 30),
                    Gender = Gender.Male,
                    Address = "سموحة - الإسكندرية"
                },
                new
                {
                    FirstName = "Salma",
                    LastName = "Radwan",
                    Email = "salma.radwan@clinic.com",
                    Phone = "01266667788",
                    BirthDate = new DateOnly(1997, 8, 19),
                    Gender = Gender.Female,
                    Address = "الشيخ زايد - الجيزة"
                }
            };

            foreach (var pat in seedPatients)
            {
                var existingUser = await userManager.FindByEmailAsync(pat.Email);
                if (existingUser is null)
                {
                    var user = new ApplicationUser
                    {
                        FirstName = pat.FirstName,
                        LastName = pat.LastName,
                        UserName = pat.Email,
                        Email = pat.Email,
                        PhoneNumber = pat.Phone,
                        DateOfBirth = pat.BirthDate,
                        EmailConfirmed = true,
                        PhoneNumberConfirmed = true
                    };

                    var createResult = await userManager.CreateAsync(user, patientPassword);
                    if (createResult.Succeeded)
                    {
                        await userManager.AddToRoleAsync(user, DefaultRoles.Patient);

                        var patient = new Patient
                        {
                            UserId = user.Id,
                            Gender = pat.Gender,
                            Address = pat.Address
                        };

                        context.Patients.Add(patient);
                    }
                }
                else
                {
                    if (!await userManager.IsInRoleAsync(existingUser, DefaultRoles.Patient))
                    {
                        await userManager.AddToRoleAsync(existingUser, DefaultRoles.Patient);
                    }
                    if (!await userManager.CheckPasswordAsync(existingUser, patientPassword))
                    {
                        await userManager.RemovePasswordAsync(existingUser);
                        await userManager.AddPasswordAsync(existingUser, patientPassword);
                    }
                    if (!context.Patients.Any(p => p.UserId == existingUser.Id))
                    {
                        context.Patients.Add(new Patient
                        {
                            UserId = existingUser.Id,
                            Gender = pat.Gender,
                            Address = pat.Address
                        });
                    }
                }
            }
            await context.SaveChangesAsync();
            logger.LogInformation("Patients seeded successfully.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while seeding initial database data.");
        }
    }
}
