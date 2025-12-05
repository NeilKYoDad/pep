using Pep.Model.Models;

namespace Pep.Model.Repositories.Interfaces;

public interface ISurveyVersionRepository
{
    Task<AddNewSurveyVersionResponse> AddNewSurveyVersion(int surveyId, int createdBy, AddNewSurveyVersion dto, CancellationToken ct = default);

    Task UpdateSurveyVersion(int surveyId, int versionId, SurveyVersion updatedVersion, CancellationToken ct = default);
}
