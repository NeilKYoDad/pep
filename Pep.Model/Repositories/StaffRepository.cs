using Dapper;
using Pep.Model.Models;
using Microsoft.Data.SqlClient;
using System.Data;
using System.Text.Json;
using System.Threading;
using Microsoft.Extensions.Configuration;
using Pep.Model.Repositories.Interfaces;

namespace Pep.Model.Repositories;

public class StaffRepository : IStaffRepository
{
    private readonly string _connString;

    public StaffRepository(IConfiguration configuration)
    {
        _connString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("ConnectionStrings:DefaultConnection is not configured.");
    }

    private IDbConnection CreateConnection() => new SqlConnection(_connString);

    public async Task<IEnumerable<Staff>> GetAllStaff(CancellationToken ct = default)
    {
        using var conn = CreateConnection();
        const string procName = "[PEP].[StaffList]";

        var results = await conn.QueryAsync<Staff>(
            new CommandDefinition(procName, commandType: CommandType.StoredProcedure, cancellationToken: ct));

        return results ?? Enumerable.Empty<Staff>();
    }
}