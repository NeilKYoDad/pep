using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Pep.Model.Models;
using System;
using System.Security.Authentication;

namespace Pep.Admin.WebApi.Authorization
{
    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple = true)]
    public class RoleAccessAttribute : Attribute, IAsyncAuthorizationFilter
    {
        // RoleProperties is the array of role names set in the controller annotation,
        // e.g. [RoleAccess("IsCreator")] - IsCreator
        // or [RoleAccess("IsDataProvider", "IsDataQA")]  an array as multiple roles are allowed
        private readonly string[] RoleProperties;

        public RoleAccessAttribute(params string[] roleProperties)
        {
            this.RoleProperties = roleProperties;
        }

        public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
        {
            var logger = context.HttpContext.RequestServices.GetService(typeof(Microsoft.Extensions.Logging.ILogger<RoleAccessAttribute>)) as Microsoft.Extensions.Logging.ILogger;

            // Get the user principal name from the HttpContext (this is set when signing in)
            var userPrincipalName = context.HttpContext.Items["UserPrincipalName"] as string;
            if (string.IsNullOrEmpty(userPrincipalName))
            {
                // This is an error, but AI is saying it's best to return 401 Unauthorized and check the logs, rather than chuck an exception?!
                // Log the error for diagnostics
                logger?.LogError("RoleAccessAttribute: UserPrincipalName missing or empty in HttpContext.Items. Returning 401 Unauthorized. Path: {Path}", context.HttpContext.Request.Path);
                context.Result = new UnauthorizedResult();
                return;
            }

            // Get the repository from the DI container
            var repoObj = context.HttpContext.RequestServices.GetService(typeof(Pep.Model.Repositories.Interfaces.IStaffMemberAccessRepository));
            if (repoObj is not Pep.Model.Repositories.Interfaces.IStaffMemberAccessRepository repo)
            {
                // This is an error, but AI is saying it's best to return 401 Unauthorized and check the logs
                logger?.LogError("RoleAccessAttribute: StaffMemberAccessRepository not found. Name: {userPrincipalName} Path: {Path}", userPrincipalName, context.HttpContext.Request.Path);
                context.Result = new UnauthorizedResult();
                return;
            }

            // Get the user's access details from the repository
            var access = await repo.GetStaffMemberAccess(null, userPrincipalName);
            if (access == null)
            {
                logger?.LogWarning("RoleAccessAttribute: GetStaffMemberAccess user doesn't exist : Name: {userPrincipalName} Path: {Path}", userPrincipalName, context.HttpContext.Request.Path);
                context.Result = new UnauthorizedResult();
                return;
            }

            // Loop round the roles required for this method and see if the user has any of them
            bool hasAnyRole = false;
            foreach (var roleProp in RoleProperties)
            {
                // Use reflection to get the role value from the StaffMemberAccess object
                var propertyInfo = typeof(StaffMemberAccess).GetProperty(roleProp);
                if (propertyInfo == null)
                {
                    // Probably better to fail here as it's a code issue, rather than skip /ignore 
                    throw new AuthenticationException($"Unknown role property: {roleProp}");
                }

                var value = propertyInfo.GetValue(access);
                if (value is bool b && b == true) // if the property is true (in the database), then the user has this role
                {
                    hasAnyRole = true;
                    break; // No need to check further, the user has at least one required role
                }
            }

            if (!hasAnyRole)
            {
                // The user does not have any of the required roles
                context.Result = new ForbidResult();
                return;
            }
        }
    }
}
