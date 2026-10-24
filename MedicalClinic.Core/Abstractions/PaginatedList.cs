namespace MedicalClinic.Core.Abstractions;

public class PaginatedList<T>
{
    public List<T> Items { get; private set; }
    public int PageNumber { get; private set; }
    public int TotalPages { get; private set; }
    public int TotalCount { get; private set; }

    public PaginatedList(List<T> items, int pageNumber, int count, int pageSize)
    {
        Items = items;
        PageNumber = pageNumber;
        TotalCount = count;
        TotalPages = (int)Math.Ceiling(count / (double)pageSize);
    }

    public bool HasPreviousPage => PageNumber > 1;
    public bool HasNextPage => PageNumber < TotalPages;
}
