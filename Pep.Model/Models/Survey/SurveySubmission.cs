namespace Pep.Model.Models;

public class SurveySubmission
{
    public int SurveySubmissionId { get; set; }
    public int SurveyId { get; set; }
    public int SurveyVersionId { get; set; }
    public string? SubmittedBy { get; set; } // TODO? we want this?
    public DateTime SubmittedAt { get; set; }
    public string? SubmittedIpAddress { get; set; } // TODO? we want this?
    public string Submission { get; set; } = string.Empty;
}
