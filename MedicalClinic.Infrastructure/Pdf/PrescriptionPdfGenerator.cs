using MedicalClinic.Application.Contract.MedicalRecord;
using QuestPDF.Drawing;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace MedicalClinic.Infrastructure.Pdf;

public static class PrescriptionPdfGenerator
{
    private static bool _fontsRegistered;
    private static readonly object _lock = new();

    static PrescriptionPdfGenerator()
    {
        QuestPDF.Settings.License = LicenseType.Community;
        QuestPDF.Settings.UseSystemFonts = true;
        QuestPDF.Settings.ThrowOnMissingTextGlyphs = false;

        EnsureFontsRegistered();
    }

    private static void EnsureFontsRegistered()
    {
        if (_fontsRegistered) return;

        lock (_lock)
        {
            if (_fontsRegistered) return;

            var fontDirs = new[]
            {
                Path.Combine(AppContext.BaseDirectory, "Fonts"),
                "Fonts",
                Path.Combine(Directory.GetCurrentDirectory(), "Fonts"),
                "/app/Fonts"
            };

            foreach (var dir in fontDirs)
            {
                if (Directory.Exists(dir))
                {
                    foreach (var fontFile in Directory.GetFiles(dir, "*.ttf"))
                    {
                        try
                        {
                            using var stream = File.OpenRead(fontFile);
                            FontManager.RegisterFontFromStream(stream);
                        }
                        catch { }
                    }
                }
            }

            _fontsRegistered = true;
        }
    }

    public static byte[] Generate(MedicalRecordResponse record)
    {
        EnsureFontsRegistered();

        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A5);
                page.Margin(1.5f, Unit.Centimetre);
                page.PageColor(Colors.White);
                page.ContentFromRightToLeft();
                page.DefaultTextStyle(x => x.FontFamily("Arial", "Tahoma").FontSize(10).FontColor(Colors.Grey.Darken3));

                page.Header().Element(c => ComposeHeader(c, record));
                page.Content().Element(c => ComposeContent(c, record));
                page.Footer().Element(ComposeFooter);
            });
        });

        return document.GeneratePdf();
    }

    private static void ComposeHeader(IContainer container, MedicalRecordResponse record)
    {
        container.Column(col =>
        {
            col.Item().Row(row =>
            {
                row.RelativeItem().Column(c =>
                {
                    c.Item().Text($"د/ {record.DoctorName}").Bold().FontSize(14).FontColor(Colors.Teal.Darken2);
                    c.Item().Text(record.DoctorSpecialization).FontSize(10).FontColor(Colors.Grey.Darken1);
                });

                row.RelativeItem().AlignLeft().Column(c =>
                {
                    c.Item().Text("مركز النخبة الطبي").Bold().FontSize(14).FontColor(Colors.Teal.Darken3);
                    c.Item().Text($"التاريخ: {record.AppointmentDate:yyyy-MM-dd}").FontSize(10);
                });
            });

            col.Item().PaddingVertical(8).LineHorizontal(1).LineColor(Colors.Teal.Lighten2);

            col.Item().Background(Colors.Grey.Lighten4).Padding(8).Row(row =>
            {
                row.RelativeItem().Text(t =>
                {
                    t.Span("اسم المريض: ").Bold();
                    t.Span(record.PatientName);
                });

                row.RelativeItem().AlignLeft().Text(t =>
                {
                    t.Span("رقم الروشتة: ").Bold();
                    t.Span($"MR-{record.Id:D5}");
                });
            });

            col.Item().PaddingTop(6);
        });
    }

    private static void ComposeContent(IContainer container, MedicalRecordResponse record)
    {
        container.PaddingVertical(10).Column(col =>
        {
            if (!string.IsNullOrWhiteSpace(record.Diagnosis))
            {
                col.Item().Row(r =>
                {
                    r.AutoItem().Text("التشخيص الطبي: ").Bold().FontColor(Colors.Teal.Darken2);
                    r.RelativeItem().Text(record.Diagnosis);
                });
                col.Item().PaddingBottom(8);
            }

            col.Item().PaddingVertical(6).Text("Rx (الوصفة العلاجية)").Bold().FontSize(13).FontColor(Colors.Teal.Darken3);

            if (record.Prescriptions.Count > 0)
            {
                col.Item().Table(table =>
                {
                    table.ColumnsDefinition(columns =>
                    {
                        columns.ConstantColumn(25);
                        columns.RelativeColumn(3);
                        columns.RelativeColumn(2);
                        columns.RelativeColumn(2);
                        columns.RelativeColumn(2);
                    });

                    table.Header(header =>
                    {
                        header.Cell().Text("#").Bold();
                        header.Cell().Text("اسم الدواء (Medication)").Bold();
                        header.Cell().Text("الجرعة (Dosage)").Bold();
                        header.Cell().Text("التكرار (Frequency)").Bold();
                        header.Cell().Text("المدة (Duration)").Bold();
                    });

                    var index = 1;
                    foreach (var rx in record.Prescriptions)
                    {
                        table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten3).PaddingVertical(4).Text(index++.ToString());
                        table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten3).PaddingVertical(4).Column(c =>
                        {
                            c.Item().Text(rx.MedicationName).Bold();
                            if (!string.IsNullOrWhiteSpace(rx.Instructions))
                                c.Item().Text(rx.Instructions).FontSize(8).Italic().FontColor(Colors.Grey.Darken1);
                        });
                        table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten3).PaddingVertical(4).Text(rx.Dosage);
                        table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten3).PaddingVertical(4).Text(rx.Frequency);
                        table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten3).PaddingVertical(4).Text($"{rx.Duration} يوم");
                    }
                });
            }
            else
            {
                col.Item().PaddingVertical(10).Text("لا توجد أدوية مسجلة في هذا الكشف.").Italic();
            }

            if (!string.IsNullOrWhiteSpace(record.Notes))
            {
                col.Item().PaddingTop(12).Text("ملاحظات وتعليمات الطبيب:").Bold().FontColor(Colors.Teal.Darken2);
                col.Item().PaddingTop(2).Text(record.Notes).Italic();
            }
        });
    }

    private static void ComposeFooter(IContainer container)
    {
        container.Column(col =>
        {
            col.Item().LineHorizontal(1).LineColor(Colors.Grey.Lighten2);
            col.Item().PaddingTop(6).Row(row =>
            {
                row.RelativeItem().Text("مع أطيب تمنياتنا لكم بتمام الصحة والشفاء العاجل!").FontSize(9).Italic();
                row.RelativeItem().AlignLeft().Text("توقيع وختم الطبيب: __________________").FontSize(9);
            });
        });
    }
}
