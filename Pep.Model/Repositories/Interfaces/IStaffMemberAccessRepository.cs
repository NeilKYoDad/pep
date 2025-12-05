using Pep.Model.Models;

namespace Pep.Model.Repositories.Interfaces;

public interface IStaffMemberAccessRepository
{
    Task<StaffMemberAccess?> GetStaffMemberAccess(int? staffId, string email);
}