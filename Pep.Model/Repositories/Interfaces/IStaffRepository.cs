using Pep.Model.Models;

namespace Pep.Model.Repositories.Interfaces;

public interface IStaffRepository
{
    Task<IEnumerable<Staff>> GetAllStaff(CancellationToken ct = default);
}
