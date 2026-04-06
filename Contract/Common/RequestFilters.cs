namespace MedicalClinic.Api.Contract.Common;

public record RequestFilters
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? SortColumn { get; set; }
    public string? SortDirection { get; set; } = "ASC";
}
