using Microsoft.AspNetCore.Mvc;
using System.Security.Authentication;

namespace Pep.Admin.WebApi.Controllers;

[ApiController]
public abstract class BaseController : ControllerBase
{
    protected int GetStaffIdFromContext()
    {
        if (HttpContext.Items["StaffId"] is not int staffId)
        {
            throw new AuthenticationException("StaffId not found in context.");
        }

        return staffId;
    }

    protected string GetUserPrincipalNameFromContext()
    {
        var userName = HttpContext.Items["UserPrincipalName"] as string;
        if (string.IsNullOrEmpty(userName))
        {
            throw new AuthenticationException("UserPrincipalName not found in context.");
        }

        return userName;
    }
}