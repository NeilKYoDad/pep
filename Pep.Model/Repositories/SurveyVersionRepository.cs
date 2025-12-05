using Dapper;
using Pep.Model.Models;
using Microsoft.Data.SqlClient;
using System.Data;
using Microsoft.Extensions.Configuration;
using Pep.Model.Repositories.Interfaces;

namespace Pep.Model.Repositories;

public class SurveyVersionRepository : ISurveyVersionRepository
{
    private readonly string _connString;

    public SurveyVersionRepository(IConfiguration configuration)
    {
        _connString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("ConnectionStrings:DefaultConnection is not configured.");
    }

    private IDbConnection CreateConnection() => new SqlConnection(_connString);


    /// <summary>
    /// Adds a new version to an existing survey.
    /// </summary>
    public async Task<AddNewSurveyVersionResponse> AddNewSurveyVersion(int surveyId, int createdBy, AddNewSurveyVersion dto, CancellationToken ct = default)
    {
        using var conn = CreateConnection();
        const string procName = "[PEP].[CreateSurveyVersion]"; // TODO - see if we can pass in the basic surveyversion entity here

        var parameters = new DynamicParameters();
        parameters.Add("@SurveyId", surveyId);
        parameters.Add("@SurveySchemaJson", dto.SurveySchemaJson);
        parameters.Add("@ChangeNotes", dto.ChangeNotes);
        parameters.Add("@CreatedBy", createdBy);
        parameters.Add("@VersionId", dbType: DbType.Int32, direction: ParameterDirection.Output);
        parameters.Add("@VersionNumber", dbType: DbType.Int32, direction: ParameterDirection.Output);

        await conn.ExecuteAsync(
            new CommandDefinition(
                procName,
                parameters,
                commandType: CommandType.StoredProcedure,
                cancellationToken: ct));

        var versionId = parameters.Get<int>("@VersionId");
        var versionNumber = parameters.Get<int>("@VersionNumber");

        return new AddNewSurveyVersionResponse
        {
            VersionId = versionId,
            VersionNumber = versionNumber
        };
    }

    /// <summary>
    /// Updates an existing survey version record.
    /// </summary>
    public async Task UpdateSurveyVersion(int surveyId, int versionId, SurveyVersion updatedVersion, CancellationToken ct = default)
    {
        using var conn = CreateConnection();
        const string procName = "[PEP].[UpdateSurveyVersion]";

        var parameters = new DynamicParameters();
        parameters.Add("@SurveyVersionId", versionId);
        parameters.Add("@SurveyId", surveyId);
        parameters.Add("@VersionNumber", updatedVersion.VersionNumber);
        parameters.Add("@SurveySchemaJson", updatedVersion.SurveySchemaJson);
        parameters.Add("@StatusId", (int)updatedVersion.StatusId);
        parameters.Add("@CreatedAt", updatedVersion.CreatedAt);
        parameters.Add("@CreatedBy", updatedVersion.CreatedBy);
        parameters.Add("@ApprovedAt", updatedVersion.ApprovedAt);
        parameters.Add("@ApprovedBy", updatedVersion.ApprovedBy);
        parameters.Add("@PublishedAt", updatedVersion.PublishedAt);
        parameters.Add("@PublishedBy", updatedVersion.PublishedBy);
        parameters.Add("@RetiredAt", updatedVersion.RetiredAt);
        parameters.Add("@RetiredBy", updatedVersion.RetiredBy);
        parameters.Add("@ChangeNotes", updatedVersion.ChangeNotes);
        parameters.Add("@UpdatedAt", updatedVersion.UpdatedAt);
        parameters.Add("@UpdatedBy", updatedVersion.UpdatedBy);

        await conn.ExecuteAsync(
            new CommandDefinition(
                procName,
                parameters,
                commandType: CommandType.StoredProcedure,
                cancellationToken: ct));
    }
}