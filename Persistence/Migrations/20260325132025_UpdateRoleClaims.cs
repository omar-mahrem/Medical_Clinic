using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace MedicalClinic.Api.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class UpdateRoleClaims : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 1001,
                column: "ClaimValue",
                value: "doctors:add");

            migrationBuilder.UpdateData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 1002,
                column: "ClaimValue",
                value: "doctors:update");

            migrationBuilder.UpdateData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 1003,
                column: "ClaimValue",
                value: "doctors:read");

            migrationBuilder.UpdateData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 1004,
                column: "ClaimValue",
                value: "doctors:delete");

            migrationBuilder.UpdateData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 1005,
                column: "ClaimValue",
                value: "appointments:read");

            migrationBuilder.UpdateData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 1006,
                column: "ClaimValue",
                value: "appointments:status");

            migrationBuilder.UpdateData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 1007,
                column: "ClaimValue",
                value: "MedicalRecords:read");

            migrationBuilder.UpdateData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 1008,
                column: "ClaimValue",
                value: "MedicalRecords:readHistory");

            migrationBuilder.UpdateData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 2001,
                column: "ClaimValue",
                value: "patients:add");

            migrationBuilder.UpdateData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 2002,
                column: "ClaimValue",
                value: "patients:update");

            migrationBuilder.UpdateData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 2003,
                column: "ClaimValue",
                value: "patients:read");

            migrationBuilder.UpdateData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 2004,
                column: "ClaimValue",
                value: "patients:delete");

            migrationBuilder.UpdateData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 2005,
                column: "ClaimValue",
                value: "appointments:add");

            migrationBuilder.UpdateData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 2006,
                column: "ClaimValue",
                value: "appointments:read");

            migrationBuilder.InsertData(
                table: "AspNetRoleClaims",
                columns: new[] { "Id", "ClaimType", "ClaimValue", "RoleId" },
                values: new object[,]
                {
                    { 1009, "Permissions", "MedicalRecords:add", "019c80db-6095-71fe-80c1-cbf801d06a5a" },
                    { 1010, "Permissions", "MedicalRecords:update", "019c80db-6095-71fe-80c1-cbf801d06a5a" },
                    { 1011, "Permissions", "MedicalRecords:delete", "019c80db-6095-71fe-80c1-cbf801d06a5a" },
                    { 1012, "Permissions", "patients:read", "019c80db-6095-71fe-80c1-cbf801d06a5a" },
                    { 2007, "Permissions", "appointments:update", "019c80dc-140f-73be-b6a1-cd26e6b1c0e3" },
                    { 2008, "Permissions", "appointments:cancel", "019c80dc-140f-73be-b6a1-cd26e6b1c0e3" },
                    { 3007, "Permissions", "MedicalRecords:read", "019c80dc-140f-73be-b6a1-cd238cda114e" },
                    { 3008, "Permissions", "MedicalRecords:readHistory", "019c80dc-140f-73be-b6a1-cd238cda114e" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 1009);

            migrationBuilder.DeleteData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 1010);

            migrationBuilder.DeleteData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 1011);

            migrationBuilder.DeleteData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 1012);

            migrationBuilder.DeleteData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 2007);

            migrationBuilder.DeleteData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 2008);

            migrationBuilder.DeleteData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 3007);

            migrationBuilder.DeleteData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 3008);

            migrationBuilder.UpdateData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 1001,
                column: "ClaimValue",
                value: "appointments:read");

            migrationBuilder.UpdateData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 1002,
                column: "ClaimValue",
                value: "appointments:status");

            migrationBuilder.UpdateData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 1003,
                column: "ClaimValue",
                value: "MedicalRecords:read");

            migrationBuilder.UpdateData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 1004,
                column: "ClaimValue",
                value: "MedicalRecords:readHistory");

            migrationBuilder.UpdateData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 1005,
                column: "ClaimValue",
                value: "MedicalRecords:add");

            migrationBuilder.UpdateData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 1006,
                column: "ClaimValue",
                value: "MedicalRecords:update");

            migrationBuilder.UpdateData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 1007,
                column: "ClaimValue",
                value: "MedicalRecords:delete");

            migrationBuilder.UpdateData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 1008,
                column: "ClaimValue",
                value: "patients:read");

            migrationBuilder.UpdateData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 2001,
                column: "ClaimValue",
                value: "appointments:add");

            migrationBuilder.UpdateData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 2002,
                column: "ClaimValue",
                value: "appointments:read");

            migrationBuilder.UpdateData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 2003,
                column: "ClaimValue",
                value: "appointments:update");

            migrationBuilder.UpdateData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 2004,
                column: "ClaimValue",
                value: "appointments:cancel");

            migrationBuilder.UpdateData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 2005,
                column: "ClaimValue",
                value: "MedicalRecords:read");

            migrationBuilder.UpdateData(
                table: "AspNetRoleClaims",
                keyColumn: "Id",
                keyValue: 2006,
                column: "ClaimValue",
                value: "MedicalRecords:readHistory");
        }
    }
}
