using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Pep.Model.Repositories.Interfaces;
using Pep.Model.Models;

namespace pep.Admin.WebApi.Controllers;

[Route("submissions")]
[AllowAnonymous]
[ApiController]
public class SubmissionsController : ControllerBase
{
    private readonly ISurveyRepository SurveyRepository;
    private readonly ISurveySubmissionRepository SubmissionRepository;

    public SubmissionsController(
        ISurveyRepository surveyRepository,
        ISurveySubmissionRepository submissionRepository)
    {
        SurveyRepository = surveyRepository;
        SubmissionRepository = submissionRepository;
    }

    [HttpPost("{guidString}/submit")]
    public async Task<ActionResult> SubmitSurvey(
        string guidString,
        [FromBody] SubmitSurveyRequest request,
        CancellationToken ct = default)
    {
        if (!Guid.TryParse(guidString, out var guid))
        {
            return BadRequest("Invalid survery Id");
        }

        if (request == null || string.IsNullOrWhiteSpace(request.Submission))
        {
            return BadRequest("Submission payload is required.");
        }

        var survey = await this.SurveyRepository.GetSurveyByPublishedGuid(guid, ct);
        if (survey == null)
        {
            return NotFound("Survey not found for provided link.");
        }

        // TODO maybe we can have a sproc to get the published version from the Guid?
        // This will change when we publish to locations etc
        var publishedVersion = survey.SurveyVersions.FirstOrDefault(v => v.StatusId == SurveyStatus.Published);
        if (publishedVersion == null)
        {
            return BadRequest("No published survey version available for submissions.");
        }

        var surveySubmission = new SurveySubmission
        {
            SurveyId = survey.SurveyId,
            SurveyVersionId = publishedVersion.SurveyVersionId,
            SubmittedBy = null, // TODO figure out how / if we want to handle user identity here 
            SubmittedAt = DateTime.UtcNow,
            SubmittedIpAddress = HttpContext.Connection.RemoteIpAddress?.ToString(), // TODO do we want to store this?
            Submission = request.Submission
        };

        var submissionId = await SubmissionRepository.SubmitSurvey(surveySubmission, ct);

        return Ok(new { submissionId });
    }
}
