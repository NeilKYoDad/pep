namespace Pep.Model.Models;

public class CreateSurvey
{
    public string SurveyName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string SurveySchemaJson { get; set; } = string.Empty;
    public int CreatedBy { get; set; }
}
