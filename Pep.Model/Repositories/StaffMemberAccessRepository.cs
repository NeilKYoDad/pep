using System.Data;
using System.Text.Json;
using Dapper;
using Microsoft.Data.SqlClient;
using Pep.Model.Models;
using Pep.Model.Repositories.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Pep.Model.Repositories;

public class StaffMemberAccessRepository : IStaffMemberAccessRepository
{
    private readonly string _connString;
    private const string GetStaffMemberAccessProcName = "[PEP].[GetStaffMemberAccess]";
    private readonly ILogger<StaffMemberAccessRepository>? Logger;

    public StaffMemberAccessRepository(IConfiguration configuration, ILogger<StaffMemberAccessRepository> logger)
    {
        this.Logger = logger;

        _connString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("ConnectionStrings:DefaultConnection is not configured.");
    }

    private IDbConnection CreateConnection() => new SqlConnection(_connString);

    public async Task<StaffMemberAccess?> GetStaffMemberAccess(int? staffId, string email)
    {
        using var conn = CreateConnection();

        var rows = await conn.QueryAsync<StaffMemberAccess>(
            GetStaffMemberAccessProcName,
            new { StaffId = staffId, user = email },
            commandType: CommandType.StoredProcedure
        );

        if (rows != null && rows.Count() > 1)
        {
            // probably best to catch this error rather than just log it
            throw new InvalidOperationException($"Multiple StaffMemberAccess rows returned for user {staffId} {email}");
            //this.Logger?.LogWarning("StaffMemberAccessRepository.GetStaffMemberAccess: Multiple rows returned for user {staffId} {email} domainId {domainId}", staffId, email, domainId);
        }

        return  rows?.FirstOrDefault() ?? null;
    }
}