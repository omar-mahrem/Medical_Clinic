using System.Text;

namespace MedicalClinic.Application.Common;

public static class EmailBodyBuilder
{
    public static string GenerateEmailBody(string template, Dictionary<string, string> templateModel)
    {
        var candidates = new[]
        {
            Path.Combine(Directory.GetCurrentDirectory(), "Templates", $"{template}.html"),
            Path.Combine(Directory.GetCurrentDirectory(), "MedicalClinic.Api", "Templates", $"{template}.html"),
            Path.Combine(AppContext.BaseDirectory, "Templates", $"{template}.html"),
            Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "Templates", $"{template}.html")
        };

        var templatePath = candidates.FirstOrDefault(File.Exists);

        if (string.IsNullOrEmpty(templatePath) || !File.Exists(templatePath))
        {
            var fallback = new StringBuilder();
            fallback.Append("<div style='font-family:sans-serif; direction:rtl; padding:20px; line-height:1.6;'>");
            foreach (var item in templateModel)
            {
                fallback.Append($"<p>{item.Key}: {item.Value}</p>");
            }
            fallback.Append("</div>");
            return fallback.ToString();
        }

        using var streamReader = new StreamReader(templatePath);
        var body = streamReader.ReadToEnd();

        foreach (var item in templateModel)
        {
            body = body.Replace(item.Key, item.Value);
        }

        return body;
    }
}
