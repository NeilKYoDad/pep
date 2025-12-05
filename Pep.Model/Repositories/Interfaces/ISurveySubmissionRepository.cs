using Pep.Model.Models;

namespace Pep.Model.Repositories.Interfaces;

public interface ISurveySubmissionRepository
{
    Task<int> SubmitSurvey(SurveySubmission submission, CancellationToken ct = default);
}
