namespace Pep.Model.Models;

// DTO for listing surveys
public class SurveySummaryListItem
{
    public int SurveyId { get; set; }
    public string SurveyCode { get; set; } = string.Empty;
    public string SurveyName { get; set; } = string.Empty;
    public string? Description { get; set; } = null;
    public Guid PublishedUrlGuid { get; set; }
    public DateTime CreatedAt { get; set; }
    public int CreatedBy { get; set; }
    public string? CreatedByName { get; set; }
    public string? CreatedByEmail { get; set; }
    public DateTime? UpdatedAt { get; set; } // TODO: is this when a version was updated or the survey itself?
    public int? UpdatedBy { get; set; }
    public string? UpdatedByName { get; set; }
    public string? UpdatedByEmail { get; set; }
}
