using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace MedicalClinic.Api.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class NewUpdatedDatabaseAfterDeleted : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "AspNetRoleClaims",
                columns: new[] { "Id", "ClaimType", "ClaimValue", "RoleId" },
                values: new object[,]
                {
                    { 1001, "Permissions", "appointments:read", "019c80db-6095-71fe-80c1-cbf801d06a5a" },
                    { 1002, "Permissions", "appointments:status", "019c80db-6095-71fe-80c1-cbf801d06a5a" },
                    { 1003, "Permissions", "MedicalRecords:read", "019c80db-6095-71fe-80c1-cbf801d06a5a" },
                    { 1004, "Permissions", "MedicalRecords:readHistory", "019c80db-6095-71fe-80c1-cbf801d06a5a" },
                    { 1005, "Permissions", "MedicalRecords:add", "019c80db-6095-71fe-80c1-cbf801d06a5a" },
                    { 1006, "Permissions", "MedicalRecords:update", "019c80db-6095-71fe-80c1-cbf801d06a5a" },
                    { 1007, "Permissions", "MedicalRecords:delete", "019c80db-6095-71fe-80c1-cbf801d06a5a" },
                    { 1008, "Permissions", "patients:read", "019c80db-6095-71fe-80c1-cbf801d06a5a" },
                    { 2001, "Permissions", "appointments:add", "019c80dc-140f-73be-b6a1-cd26e6b1c0e3" },
                    { 2002, "Permissions", "appointments:read", "019c80dc-140f-73be-b6a1-cd26e6b1c0e3" },
                    { 2003, "Permissions", "appointments:update", "019c80dc-140f-73be-b6a1-cd26e6b1c0e3" },
                    { 2004, "Permissions", "appointments:cancel", "019c80dc-140f-73be-b6a1-cd26e6b1c0e3" },
                    { 2005, "Permissions", "MedicalRecords:read", "019c80dc-140f-73be-b6a1-cd26e6b1c0e3" },
                    { 2006, "Permissions", "MedicalRecords:readHistory", "019c80dc-140f-73be-b6a1-cd26e6b1c0e3" },
                    { 3001, "Permissions", "doctors:read", "019c80dc-140f-73be-b6a1-cd238cda114e" },
                    { 3002, "Permissions", "patients:read", "019c80dc-140f-73be-b6a1-cd238cda114e" },
                    { 3003, "Permissions", "appointments:read", "019c80dc-140f-73be-b6a1-cd238cda114e" },
                    { 3004, "Permissions", "appointments:manage", "019c80dc-140f-73be-b6a1-cd238cda114e" },
                    { 3005, "Permissions", "appointments:add", "019c80dc-140f-73be-b6a1-cd238cda114e" },
                    { 3006, "Permissions", "appointments:status", "019c80dc-140f-73be-b6a1-cd238cda114e" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 1001);

            migrationBuilder.DeleteData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 1002);

            migrationBuilder.DeleteData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 1003);

            migrationBuilder.DeleteData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 1004);

            migrationBuilder.DeleteData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 1005);

            migrationBuilder.DeleteData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 1006);

            migrationBuilder.DeleteData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 1007);

            migrationBuilder.DeleteData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 1008);

            migrationBuilder.DeleteData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 2001);

            migrationBuilder.DeleteData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 2002);

            migrationBuilder.DeleteData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 2003);

            migrationBuilder.DeleteData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 2004);

            migrationBuilder.DeleteData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 2005);

            migrationBuilder.DeleteData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 2006);

            migrationBuilder.DeleteData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 3001);

            migrationBuilder.DeleteData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 3002);

            migrationBuilder.DeleteData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 3003);

            migrationBuilder.DeleteData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 3004);

            migrationBuilder.DeleteData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 3005);

            migrationBuilder.DeleteData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 3006);
        }
    }
}
