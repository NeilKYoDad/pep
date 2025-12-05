namespace Pep.Model.Models;

// DTO for updating survey metadata (name, description)
public class UpdateSurvey
{
    public string SurveyName { get; set; } = string.Empty;
    public string? Description { get; set; }
}
