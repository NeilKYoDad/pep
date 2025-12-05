namespace Pep.Model.Models;

// DTO for survey with all versions
public class Survey
{
    public int SurveyId { get; set; }
    public string SurveyCode { get; set; } = string.Empty;
    public string SurveyName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid PublishedUrlGuid { get; set; }
    public DateTime CreatedAt { get; set; }
    public int CreatedBy { get; set; }
    public string? CreatedByName { get; set; }
    public string? CreatedByEmail { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public int? UpdatedBy { get; set; }
    public string? UpdatedByName { get; set; }
    public string? UpdatedByEmail { get; set; }

    // TODO we need a survey active or not status, so they can retire a whole survey potentially, though could do that on a version level I guess?
    
    public List<SurveyVersion> SurveyVersions { get; set; } = new();
}
