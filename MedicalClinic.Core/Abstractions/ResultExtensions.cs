using Microsoft.AspNetCore.Mvc;

namespace MedicalClinic.Core.Abstractions;

public static class ResultExtentions
{
    public static ObjectResult ToProblem(this Result result)
    {
        if (result.IsSuccess)
            throw new InvalidOperationException("Cannot convert success result to problem");

        var problem = Results.Problem(statusCode: result.Error.StatusCode, detail: result.Error.Description, title: result.Error.Code);

        var problemDetails = problem.GetType().GetProperty(nameof(ProblemDetails))!.GetValue(problem) as ProblemDetails;

        problemDetails!.Detail = result.Error.Description;
        problemDetails.Extensions = new Dictionary<string, object?>
        {
            {
                "errors", new[] {
                    result.Error.Code,
                    result.Error.Description
                }
            }
        };

        return new ObjectResult(problemDetails);
    }
}
