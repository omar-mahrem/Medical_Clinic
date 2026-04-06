using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace MedicalClinic.Api.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class ApplyIdentityRoles : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "AspNetUsers",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "GETUTCDATE()",
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AddColumn<bool>(
                name: "IsDefault",
                table: "AspNetRoles",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "AspNetRoles",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.InsertData(
                table: "AspNetRoles",
                columns: new[] { "Id", "ConcurrencyStamp", "IsDefault", "IsDeleted", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { "019c80da-b12e-7b2c-96ef-911b36c89b54", "019c80da-b12e-7b2c-96ef-911cf800633a", false, false, "Admin", "ADMIN" },
                    { "019c80db-6095-71fe-80c1-cbf801d06a5a", "019c80db-6095-71fe-80c1-cbf956e49587", false, false, "Doctor", "DOCTOR" },
                    { "019c80dc-140f-73be-b6a1-cd238cda114e", "019c80dc-140f-73be-b6a1-cd24882c9d39", false, false, "Receptionist", "RECEPTIONIST" },
                    { "019c80dc-140f-73be-b6a1-cd26e6b1c0e3", "019c80db-c560-7fd7-8a45-d0ec138e9bac", true, false, "Patient", "PATIENT" }
                });

            migrationBuilder.InsertData(
                table: "AspNetUsers",
                columns: new[] { "Id", "AccessFailedCount", "ConcurrencyStamp", "DateOfBirth", "Email", "EmailConfirmed", "FirstName", "LastName", "LockoutEnabled", "LockoutEnd", "MiddleName", "NormalizedEmail", "NormalizedUserName", "PasswordHash", "PhoneNumber", "PhoneNumberConfirmed", "SecurityStamp", "TwoFactorEnabled", "UpdatedAt", "UserName" },
                values: new object[] { "019c80c8-e104-74e5-974f-34ed0a2a14a2", 0, "019c80c8-e106-7d60-b4c4-bb751794c02c", null, "admin@medical-clinic.com", true, "admin", "medical clinic", false, null, null, "ADMIN@MEDICAL-CLINIC.COM", "ADMIN@MEDICAL-CLINIC.COM", "AQAAAAIAAYagAAAAEEV5chIlMq5IJnkfam+TWUqs7n1iVyygwAlOB9j5gz8VsEBWmHvICWuL/IfHmMwacw==", "01200485596", true, "9F49B7CC62E641129B8E1E5802512A90", false, null, "admin@medical-clinic.com" });

            migrationBuilder.InsertData(
                table: "AspNetRoleClaims",
                columns: new[] { "Id", "ClaimType", "ClaimValue", "RoleId" },
                values: new object[,]
                {
                    { 1, "Permissions", "doctors.read", "019c80da-b12e-7b2c-96ef-911b36c89b54" },
                    { 2, "Permissions", "doctors.add", "019c80da-b12e-7b2c-96ef-911b36c89b54" },
                    { 3, "Permissions", "doctors.update", "019c80da-b12e-7b2c-96ef-911b36c89b54" },
                    { 4, "Permissions", "doctors.delete", "019c80da-b12e-7b2c-96ef-911b36c89b54" },
                    { 5, "Permissions", "doctors.reset", "019c80da-b12e-7b2c-96ef-911b36c89b54" },
                    { 6, "Permissions", "patients.read", "019c80da-b12e-7b2c-96ef-911b36c89b54" },
                    { 7, "Permissions", "patients.add", "019c80da-b12e-7b2c-96ef-911b36c89b54" },
                    { 8, "Permissions", "patients.update", "019c80da-b12e-7b2c-96ef-911b36c89b54" },
                    { 9, "Permissions", "patients.delete", "019c80da-b12e-7b2c-96ef-911b36c89b54" },
                    { 10, "Permissions", "patients.reset", "019c80da-b12e-7b2c-96ef-911b36c89b54" },
                    { 11, "Permissions", "roles.read", "019c80da-b12e-7b2c-96ef-911b36c89b54" },
                    { 12, "Permissions", "roles.add", "019c80da-b12e-7b2c-96ef-911b36c89b54" },
                    { 13, "Permissions", "roles.update", "019c80da-b12e-7b2c-96ef-911b36c89b54" }
                });

            migrationBuilder.InsertData(
                table: "AspNetUserRoles",
                columns: new[] { "RoleId", "UserId" },
                values: new object[] { "019c80da-b12e-7b2c-96ef-911b36c89b54", "019c80c8-e104-74e5-974f-34ed0a2a14a2" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 8);

            migrationBuilder.DeleteData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 9);

            migrationBuilder.DeleteData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 10);

            migrationBuilder.DeleteData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 11);

            migrationBuilder.DeleteData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 12);

            migrationBuilder.DeleteData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 13);

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "019c80db-6095-71fe-80c1-cbf801d06a5a");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "019c80dc-140f-73be-b6a1-cd238cda114e");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "019c80dc-140f-73be-b6a1-cd26e6b1c0e3");

            migrationBuilder.DeleteData(
                table: "AspNetUserRoles",
                keyColumns: new[] { "RoleId", "UserId" },
                keyValues: new object[] { "019c80da-b12e-7b2c-96ef-911b36c89b54", "019c80c8-e104-74e5-974f-34ed0a2a14a2" });

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "019c80da-b12e-7b2c-96ef-911b36c89b54");

            migrationBuilder.DeleteData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "019c80c8-e104-74e5-974f-34ed0a2a14a2");

            migrationBuilder.DropColumn(
                name: "IsDefault",
                table: "AspNetRoles");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "AspNetRoles");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "AspNetUsers",
                type: "datetime2",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValueSql: "GETUTCDATE()");
        }
    }
}
