namespace Pep.Model.Models;

// DTO for detailed version information
public class SurveyVersion
{
    public int SurveyVersionId { get; set; }
    public int SurveyId { get; set; }
    public int VersionNumber { get; set; }
    public string SurveySchemaJson { get; set; } = string.Empty;
    public SurveyStatus StatusId { get; set; }
    public string StatusName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public int CreatedBy { get; set; }
    public string? CreatedByName { get; set; }
    public string? CreatedByEmail { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public int? ApprovedBy { get; set; }
    public string? ApprovedByName { get; set; }
    public string? ApprovedByEmail { get; set; }
    public DateTime? PublishedAt { get; set; }
    public int? PublishedBy { get; set; }
    public string? PublishedByName { get; set; }
    public string? PublishedByEmail { get; set; }
    public DateTime? RetiredAt { get; set; }
    public int? RetiredBy { get; set; }    
    public string? RetiredByName { get; set; }
    public string? RetiredByEmail { get; set; }
    public string? ChangeNotes { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public int? UpdatedBy { get; set; }
    public string? UpdatedByName { get; set; }
    public string? UpdatedByEmail { get; set; }

    public void Approve(int staffId) {
        if (this.StatusId != SurveyStatus.Draft &&
            this.StatusId != SurveyStatus.Retired)
        {
            throw new InvalidOperationException("Only survey versions in Draft or Retired status can be approved.");
        }

        this.StatusId = SurveyStatus.Approved;
        this.ApprovedBy = staffId;
        this.ApprovedAt = DateTime.UtcNow;
    }

    public void Publish(int staffId) {
        if (this.StatusId != SurveyStatus.Approved)
        {
            throw new InvalidOperationException("Only survey versions in Approved status can be published.");
        }
        
        this.StatusId = SurveyStatus.Published;
        this.PublishedBy = staffId;
        this.PublishedAt = DateTime.UtcNow;
    }

    public void Retire(int staffId) {
        this.StatusId = SurveyStatus.Retired;
        this.RetiredBy = staffId;
        this.RetiredAt = DateTime.UtcNow;
    }

    public void UpdateSurveySchema(string surveySchemaJson, string? changeNotes, int updatedBy)
    {
        if (this.StatusId != SurveyStatus.Draft)
        {
            throw new InvalidOperationException("Only survey versions in Draft status can be updated.");
        }

        SurveySchemaJson = surveySchemaJson;
        ChangeNotes = changeNotes;
        UpdatedAt = DateTime.UtcNow;
        UpdatedBy = updatedBy;
    }
}
