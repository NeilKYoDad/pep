using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Pep.Model.Models;
using Pep.Model.Repositories.Interfaces;
using System.Data;

namespace Pep.Model.Repositories;

public abstract class SurveySubmissionRepositoryBase : ISurveySubmissionRepository
{
    private readonly string _connString;

    protected SurveySubmissionRepositoryBase(IConfiguration configuration)
    {
        _connString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("ConnectionStrings:DefaultConnection is not configured.");
    }

    protected IDbConnection CreateConnection() => new SqlConnection(_connString);

    public async Task<Survey?> GetSurveyByPublishedGuid(Guid publishedUrlGuid, CancellationToken ct = default)
    {
        var parameters = new DynamicParameters();
        parameters.Add("@PublishedUrlGuid", publishedUrlGuid);

        return await QuerySurvey("[PEP].[GetSurveyByPublishedGuid]", parameters, ct);
    }

    protected async Task<Survey?> QuerySurvey(
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

    public abstract Task<int> SubmitSurvey(SurveySubmission submission, CancellationToken ct = default);
}