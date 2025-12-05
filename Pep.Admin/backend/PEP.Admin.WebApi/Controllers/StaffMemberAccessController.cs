using Microsoft.AspNetCore.Mvc;
using Pep.Model.Repositories.Interfaces;
using Pep.Model.Models;
using System.Security.Authentication;
using Microsoft.AspNetCore.Authorization;

namespace Pep.Admin.WebApi.Controllers;

[ApiController]
[Route("[controller]")]
[Authorize]
public class StaffMemberAccessController : BaseController
{
    private readonly IStaffMemberAccessRepository StaffMemberAccessRepository;

    public StaffMemberAccessController(IStaffMemberAccessRepository staffMemberAccessRepository)
    {
        StaffMemberAccessRepository = staffMemberAccessRepository;
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<StaffMemberAccess>> GetMyAccess()
    {
        var userPrincipalName = GetUserPrincipalNameFromContext();

        var access = await this.StaffMemberAccessRepository.GetStaffMemberAccess(null, userPrincipalName);
        if (access == null)
        {
            return Unauthorized();
        }

        return Ok(access);
    }
}
