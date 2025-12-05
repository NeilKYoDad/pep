using Microsoft.AspNetCore.ResponseCompression;
using System.IO.Compression;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Identity.Web;
using Serilog;
using Microsoft.AspNetCore.Diagnostics;
using FluentValidation.AspNetCore;
using FluentValidation;
using Pep.Admin.WebApi.Validators;

var builder = WebApplication.CreateBuilder(args);

// Enable response compression for JSON (gzip/Brotli)
builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
    options.Providers.Add<BrotliCompressionProvider>();
    options.Providers.Add<GzipCompressionProvider>();
    // extend compression to include application/json to the default 
    options.MimeTypes = ResponseCompressionDefaults.MimeTypes.Concat(new[] { "application/json" });
});

builder.Services.Configure<BrotliCompressionProviderOptions>(opts =>
{
    opts.Level = CompressionLevel.Fastest;
});
builder.Services.Configure<GzipCompressionProviderOptions>(opts =>
{
    opts.Level = CompressionLevel.Fastest;
});

// Configure Serilog from appsettings
builder.Host.UseSerilog((context, cfg) => cfg.ReadFrom.Configuration(context.Configuration));

// Configure Microsoft Entra ID authentication for the Web API
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddMicrosoftIdentityWebApi(builder.Configuration.GetSection("AzureAd"));

// Add authorization services
builder.Services.AddAuthorization();

// Configure CORS to allow your SPA to make requests to this API
// IMPORTANT: In a production environment, replace "*" with the specific URL(s) of your Angular SPA.
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(
        policy =>
        {
            var origins = builder.Configuration.GetSection("CORSOrigins").Get<string[]>();
            if (origins != null && origins.Length > 0)
            {
                policy.WithOrigins(origins)
                      .AllowAnyHeader()
                      .AllowAnyMethod()
                      .AllowCredentials();
            }
        });
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.DictionaryKeyPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });

builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<CreateSurveyValidator>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Register repositories
builder.Services.AddScoped<Pep.Model.Repositories.Interfaces.ISurveyRepository, Pep.Model.Repositories.SurveyRepository>();
builder.Services.AddScoped<Pep.Model.Repositories.Interfaces.ISurveyVersionRepository, Pep.Model.Repositories.SurveyVersionRepository>();
builder.Services.AddScoped<Pep.Model.Repositories.Interfaces.ISurveySubmissionRepository, Pep.Model.Repositories.SurveySubmissionRepository>();
builder.Services.AddScoped<Pep.Model.Repositories.Interfaces.IStaffRepository, Pep.Model.Repositories.StaffRepository>();
builder.Services.AddScoped<Pep.Model.Repositories.Interfaces.IStaffMemberAccessRepository, Pep.Model.Repositories.StaffMemberAccessRepository>();
var app = builder.Build();

// Use response compression middleware
app.UseResponseCompression();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "EntraTest WebAPI v1");
        c.RoutePrefix = string.Empty; // Set Swagger UI at app's root
    });
}

//app.UseHttpsRedirection();

// Enable CORS middleware. This must be before UseAuthentication and UseAuthorization.
app.UseCors();

// Global exception handler to return JSON errors so we can parse it consistenly in the UI
app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        context.Response.StatusCode = 500;
        context.Response.ContentType = "application/json";
        var exception = context.Features.Get<IExceptionHandlerFeature>()?.Error;
        await context.Response.WriteAsJsonAsync(new { message = exception?.Message ?? "An error occurred" });
    });
});

// Enable authentication middleware. This must be before UseAuthorization.
app.UseAuthentication();

// Authentication against PEP database
// NOTE: this is called on every authenticated / protected endpoint.
// We dont have an auth cookie or anything like that and we can't add anything to the Entra token either
app.Use(async (context, next) =>
{
    // Only check for authenticated requests
    if (!context.User.Identity?.IsAuthenticated ?? true)
    {
        await next();
        return;
    }

    /*
     * NOTE: Context.User.Identity.Name contains the email the user signed in with,
     * which may not be their userPrincipalName as a user may have email aliases 
     * and sign in with different aliases for the same account.
     *
     * The upshot is, we need to get the userPrincipalName claim from the token to match against the email stored in the PEP database,
     * and then store it away in the user context for later use.
     */
    var userPrincipalName = context.User.Claims.FirstOrDefault(c =>
                c.Type == "upn" ||
                c.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn" ||
                c.Type == "preferred_username"
            )?.Value;

    // If we can't find a userPrincipalName claim, reject the request
    if (string.IsNullOrEmpty(userPrincipalName))
    {
        Log.Error("Authentication failed: No userPrincipalName claim found in token for request from {RemoteIpAddress}", context.Connection.RemoteIpAddress);
        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
        await context.Response.WriteAsync("No user identity found in the token.");
        return;
    }

    // Store email in HttpContext.Items for later use
    context.Items["UserPrincipalName"] = userPrincipalName;

    // Get the repository from the DI container
    var repo = context.RequestServices.GetService<Pep.Model.Repositories.Interfaces.IStaffMemberAccessRepository>();
    if (repo == null)
    {
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        await context.Response.WriteAsync("StaffMemberAccessRepository not available.");
        return;
    }

    // TODO add some caching, but GetStaffMemberAccess is called in authorization too so would want to cache the same thing there
    // Check if the user exists in the database
    var access = await repo.GetStaffMemberAccess(null, userPrincipalName);
    if (access == null)
    {
        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
        await context.Response.WriteAsync("Access denied: user not found in StaffMemberAccess.");
        return;
    }

    context.Items["StaffId"] = access.StaffId;

    await next();
});

app.UseAuthorization();

// Serilog request logging (captures timing, status, etc.) and enrich with UserName
app.UseSerilogRequestLogging(options =>
{
    // push the username into the Serilog context so it can be included in log messages
    options.EnrichDiagnosticContext = (diag, httpContext) =>
    {
        var userName = httpContext.Items["UserPrincipalName"] ?? "Anonymous";
        diag.Set("UserName", userName);
    };
});

app.MapControllers();

// Add a default route that redirects to Swagger
app.MapGet("/", () => Results.Redirect("/swagger"));

// Add a default route for production
//app.MapGet("/", () => "EntraTest WebAPI is running!");

app.Run();
