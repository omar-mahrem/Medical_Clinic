using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace MedicalClinic.Api.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class test3 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
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
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 14);

            migrationBuilder.DeleteData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 15);

            migrationBuilder.DeleteData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 16);

            migrationBuilder.DeleteData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 17);

            migrationBuilder.DeleteData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 18);

            migrationBuilder.DeleteData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 19);

            migrationBuilder.DeleteData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 20);

            migrationBuilder.DeleteData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 21);

            migrationBuilder.DeleteData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 22);

            migrationBuilder.DeleteData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 23);

            migrationBuilder.DeleteData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 24);

            migrationBuilder.DeleteData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 25);

            migrationBuilder.DeleteData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 26);

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
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
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
                    { 1, "Permissions", "doctors:read", "019c80da-b12e-7b2c-96ef-911b36c89b54" },
                    { 2, "Permissions", "doctors:add", "019c80da-b12e-7b2c-96ef-911b36c89b54" },
                    { 3, "Permissions", "doctors:update", "019c80da-b12e-7b2c-96ef-911b36c89b54" },
                    { 4, "Permissions", "doctors:delete", "019c80da-b12e-7b2c-96ef-911b36c89b54" },
                    { 5, "Permissions", "doctors:reset", "019c80da-b12e-7b2c-96ef-911b36c89b54" },
                    { 6, "Permissions", "patients:read", "019c80da-b12e-7b2c-96ef-911b36c89b54" },
                    { 7, "Permissions", "patients:add", "019c80da-b12e-7b2c-96ef-911b36c89b54" },
                    { 8, "Permissions", "patients:update", "019c80da-b12e-7b2c-96ef-911b36c89b54" },
                    { 9, "Permissions", "patients:delete", "019c80da-b12e-7b2c-96ef-911b36c89b54" },
                    { 10, "Permissions", "patients:reset", "019c80da-b12e-7b2c-96ef-911b36c89b54" },
                    { 11, "Permissions", "MedicalRecords:read", "019c80da-b12e-7b2c-96ef-911b36c89b54" },
                    { 12, "Permissions", "MedicalRecords:readHistory", "019c80da-b12e-7b2c-96ef-911b36c89b54" },
                    { 13, "Permissions", "MedicalRecords:add", "019c80da-b12e-7b2c-96ef-911b36c89b54" },
                    { 14, "Permissions", "MedicalRecords:delete", "019c80da-b12e-7b2c-96ef-911b36c89b54" },
                    { 15, "Permissions", "appointments:read", "019c80da-b12e-7b2c-96ef-911b36c89b54" },
                    { 16, "Permissions", "appointments:add", "019c80da-b12e-7b2c-96ef-911b36c89b54" },
                    { 17, "Permissions", "appointments:update", "019c80da-b12e-7b2c-96ef-911b36c89b54" },
                    { 18, "Permissions", "appointments:cancel", "019c80da-b12e-7b2c-96ef-911b36c89b54" },
                    { 19, "Permissions", "appointments:status", "019c80da-b12e-7b2c-96ef-911b36c89b54" },
                    { 20, "Permissions", "appointments:manage", "019c80da-b12e-7b2c-96ef-911b36c89b54" },
                    { 21, "Permissions", "users:read", "019c80da-b12e-7b2c-96ef-911b36c89b54" },
                    { 22, "Permissions", "users:add", "019c80da-b12e-7b2c-96ef-911b36c89b54" },
                    { 23, "Permissions", "users:update", "019c80da-b12e-7b2c-96ef-911b36c89b54" },
                    { 24, "Permissions", "roles:read", "019c80da-b12e-7b2c-96ef-911b36c89b54" },
                    { 25, "Permissions", "roles:add", "019c80da-b12e-7b2c-96ef-911b36c89b54" },
                    { 26, "Permissions", "roles:update", "019c80da-b12e-7b2c-96ef-911b36c89b54" }
                });

            migrationBuilder.InsertData(
                table: "AspNetUserRoles",
                columns: new[] { "RoleId", "UserId" },
                values: new object[] { "019c80da-b12e-7b2c-96ef-911b36c89b54", "019c80c8-e104-74e5-974f-34ed0a2a14a2" });
        }
    }
}
