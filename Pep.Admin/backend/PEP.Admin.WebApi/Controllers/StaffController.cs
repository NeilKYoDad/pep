using Pep.Model.Repositories.Interfaces;
using Pep.Model.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Identity.Client;

namespace Pep.Admin.WebApi.Controllers;

[ApiController]
[Route("[controller]")]
[Authorize]
public class StaffController : BaseController
{
    private readonly IStaffRepository StaffRepository;

    public StaffController(IStaffRepository repo)
    {
        StaffRepository = repo;
    }

    [HttpGet("getAllStaff")]
    public async Task<ActionResult<IEnumerable<Staff>>> GetAllStaff(CancellationToken ct = default)
    {
        var staff = await this.StaffRepository.GetAllStaff(ct);

        return Ok(staff ?? Enumerable.Empty<Staff>());
    }
}