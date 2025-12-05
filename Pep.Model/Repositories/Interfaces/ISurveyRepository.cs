using Pep.Model.Models;

namespace Pep.Model.Repositories.Interfaces;

public interface ISurveyRepository
{
    Task<IEnumerable<SurveySummaryListItem>> GetAllSurveys(CancellationToken ct = default);
    Task<CreateSurveyResponse> CreateSurvey(CreateSurvey dto, int createdBy, CancellationToken ct = default);
    Task UpdateSurvey(int surveyId, UpdateSurvey dto, int updatedBy, CancellationToken ct = default);
    Task<Survey?> GetSurvey(int surveyId, CancellationToken ct = default);
    Task<Survey?> GetSurveyByPublishedGuid(Guid publishedUrlGuid, CancellationToken ct = default);
}
