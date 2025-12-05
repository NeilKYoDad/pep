using Dapper;
using Microsoft.Data.SqlClient;
using Pep.Model.Models;
using System.Data;
using Microsoft.Extensions.Configuration;
using Pep.Model.Repositories.Interfaces;

namespace Pep.Model.Repositories;

public class SurveySubmissionRepository : ISurveySubmissionRepository
{
    private readonly string _connString;

    public SurveySubmissionRepository(IConfiguration configuration)
    {
        _connString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("ConnectionStrings:DefaultConnection is not configured.");
    }

    private IDbConnection CreateConnection() => new SqlConnection(_connString);

    public async Task<int> SubmitSurvey(SurveySubmission submission, CancellationToken ct = default)
    {
        using var conn = CreateConnection();
        const string procName = "[PEP].[CreateSurveySubmission]";

        var parameters = new DynamicParameters();
        parameters.Add("@SurveyId", submission.SurveyId);
        parameters.Add("@SurveyVersionId", submission.SurveyVersionId);
        parameters.Add("@SubmittedBy", submission.SubmittedBy);
        parameters.Add("@SubmittedIpAddress", submission.SubmittedIpAddress);
        parameters.Add("@Submission", submission.Submission);
        parameters.Add("@SubmissionId", dbType: DbType.Int32, direction: ParameterDirection.Output);

        await conn.ExecuteAsync(
            new CommandDefinition(
                procName,
                parameters,
                commandType: CommandType.StoredProcedure,
                cancellationToken: ct));

        return parameters.Get<int>("@SubmissionId");
    }
}
