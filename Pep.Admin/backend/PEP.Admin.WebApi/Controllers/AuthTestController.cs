using Microsoft.AspNetCore.Mvc;
using Pep.Model.Repositories.Interfaces;
using Pep.Model.Models;
using Microsoft.AspNetCore.Authorization;
using Pep.Admin.WebApi.Authorization;
using System.Security.Authentication;

namespace Pep.Admin.WebApi.Controllers;

[ApiController]
[Route("[controller]")]
public class AuthTestController : ControllerBase
{
    private readonly IStaffMemberAccessRepository StaffMemberAccessRepository;

    public AuthTestController(IStaffMemberAccessRepository staffMemberAccessRepository)
    {
        StaffMemberAccessRepository = staffMemberAccessRepository;
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<StaffMemberAccess>> GetMyAccess()
    {
        var userPrincipalName = HttpContext.Items["UserPrincipalName"] as string;
        if (string.IsNullOrEmpty(userPrincipalName))
        {
            throw new AuthenticationException("UserPrincipalName is required in the context.");
        }

        var access = await this.StaffMemberAccessRepository.GetStaffMemberAccess(null, userPrincipalName);
        if (access == null)
        {
            return Forbid();
        }

        return Ok(access);
    }

    [HttpGet("noauthneeded")]
    public ActionResult<string> NoAuthNeeded()
    {
        return "No auth need for this one";
    }

    [HttpGet("adin")]
    [Authorize]
    [RoleAccess("IsAdministrator")] // These must match the column name in StaffMemberAccess  
    public ActionResult<string> IsAdministrator()
    {
        return "You're an administrator";
    }

    // Test what happens if a role is specified that doesn't exist in the database
    [HttpGet("madeuprolenotindatabase")]
    [Authorize]
    [RoleAccess("MadeUpRoleNotInDatabase")] // This should throw an exception
    public ActionResult<string> MadeUpRoleNotInDatabase()
    {
        return "This should never be seen";
    }
}
