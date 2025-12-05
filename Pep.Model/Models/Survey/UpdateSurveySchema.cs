namespace Pep.Model.Models;

public class UpdateSurveySchema
{
    public string SurveySchemaJson { get; set; } = string.Empty;
    public string? ChangeNotes { get; set; }
}
