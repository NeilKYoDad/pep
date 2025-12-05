namespace Pep.Model.Models;

public class PublishedSurveySchemaResponse
{
    public Guid PublishedUrlGuid { get; set; }
    public string SurveyCode { get; set; } = string.Empty;
    public string SurveyName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string SurveySchemaJson { get; set; } = string.Empty;
    public DateTime? PublishedAt { get; set; }
}
