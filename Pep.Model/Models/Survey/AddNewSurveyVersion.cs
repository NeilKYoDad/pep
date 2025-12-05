namespace Pep.Model.Models;

public class AddNewSurveyVersion
{
    public string SurveySchemaJson { get; set; } = string.Empty;
    public string? ChangeNotes { get; set; }
}
