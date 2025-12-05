using Dapper;
using Pep.Model.Models;
using Microsoft.Data.SqlClient;
using System.Data;
using Microsoft.Extensions.Configuration;
using Pep.Model.Repositories.Interfaces;

namespace Pep.Model.Repositories;

public class SurveyRepository : ISurveyRepository
{
    private readonly string _connString;

    public SurveyRepository(IConfiguration configuration)
    {
        _connString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("ConnectionStrings:DefaultConnection is not configured.");
    }

    private IDbConnection CreateConnection() => new SqlConnection(_connString);

    /// <summary>
    /// Retrieves all surveys with their summary information (not the full survey, just selection of fields to show in a table)
    /// </summary>
    public async Task<IEnumerable<SurveySummaryListItem>> GetAllSurveys(CancellationToken ct = default)
    {
        using var conn = CreateConnection();
        const string procName = "[PEP].[GetAllSurveys]";

        var results = await conn.QueryAsync<SurveySummaryListItem>(
            new CommandDefinition(
                procName, 
                commandType: CommandType.StoredProcedure, 
                cancellationToken: ct));

        return results ?? Enumerable.Empty<SurveySummaryListItem>();
    }

    /// <summary>
    /// Creates a new survey and its initial (empty) version.
    /// </summary>
    public async Task<CreateSurveyResponse> CreateSurvey(CreateSurvey dto, int createdBy, CancellationToken ct = default)
    {
        using var conn = CreateConnection();
        const string procName = "[PEP].[CreateNewSurvey]";

        var parameters = new DynamicParameters();
        parameters.Add("@SurveyName", dto.SurveyName);
        parameters.Add("@Description", dto.Description);
        parameters.Add("@SurveySchemaJson", dto.SurveySchemaJson);
        parameters.Add("@CreatedBy", createdBy);
        parameters.Add("@SurveyId", dbType: DbType.Int32, direction: ParameterDirection.Output);
        parameters.Add("@VersionId", dbType: DbType.Int32, direction: ParameterDirection.Output);

        await conn.ExecuteAsync(
            new CommandDefinition(
                procName,
                parameters,
                commandType: CommandType.StoredProcedure,
                cancellationToken: ct));

        var surveyId = parameters.Get<int>("@SurveyId");
        var versionId = parameters.Get<int>("@VersionId");

        // Return the response with the generated IDs
        return new CreateSurveyResponse
        {
            SurveyId = surveyId,
            VersionId = versionId,
        };
    }
    
    /// <summary>
    /// Update a survey, i.e., its name, description, etc, but not its versions / schema etc
    /// </summary>
    public async Task UpdateSurvey(int surveyId, UpdateSurvey dto, int updatedBy, CancellationToken ct = default)
    {
        using var conn = CreateConnection();
        const string procName = "[PEP].[UpdateSurvey]";

        var parameters = new DynamicParameters();
        parameters.Add("@SurveyId", surveyId);
        parameters.Add("@SurveyName", dto.SurveyName);
        parameters.Add("@Description", dto.Description);
        parameters.Add("@UpdatedBy", updatedBy);

        await conn.ExecuteAsync(
            new CommandDefinition(
                procName,
                parameters,
                commandType: CommandType.StoredProcedure,
                cancellationToken: ct));
    }
    
    /// <summary>
    /// Retrieves a survey along with all its versions.
    /// </summary>
    public async Task<Survey?> GetSurvey(int surveyId, CancellationToken ct = default)
    {
        var parameters = new DynamicParameters();
        parameters.Add("@SurveyId", surveyId);

        return await this.QuerySurvey("[PEP].[GetSurvey]", parameters, ct);
    }

    public async Task<Survey?> GetSurveyByPublishedGuid(Guid publishedUrlGuid, CancellationToken ct = default)
    {
        var parameters = new DynamicParameters();
        parameters.Add("@PublishedUrlGuid", publishedUrlGuid);

        return await this.QuerySurvey("[PEP].[GetSurveyByPublishedGuid]", parameters, ct);
    }

    //  Get the full survey (with versions) based onthe the sproc and paramters passe d in as arguments
    private async Task<Survey?> QuerySurvey(
        string storedProcedure,
        DynamicParameters parameters,
        CancellationToken ct)
    {
        using var conn = CreateConnection();

        using var multi = await conn.QueryMultipleAsync(
            new CommandDefinition(
                storedProcedure,
                parameters,
                commandType: CommandType.StoredProcedure,
                cancellationToken: ct));

        // First result set: Survey row
        var survey = await multi.ReadSingleOrDefaultAsync<Survey>();
        if (survey == null)
        {
            return null;
        }

        // Second result set: All survey versions
        var versions = await multi.ReadAsync<SurveyVersion>();
        survey.SurveyVersions = versions.ToList();

        return survey;
    }
}