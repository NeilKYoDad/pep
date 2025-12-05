using Microsoft.AspNetCore.Mvc;
using Pep.Model;
using Pep.Model.Models;
using Pep.Model.Repositories.Interfaces;

namespace Pep.Collection.Controllers;

public class SurveyController : Controller
{
    private readonly ISurveyRepository SurveyRepo;
    private readonly ISurveySubmissionRepository SubmissionRepo;

    public SurveyController(ISurveyRepository surveyRepository, ISurveySubmissionRepository submissionRepository)
    {
        this.SurveyRepo = surveyRepository;
        this.SubmissionRepo = submissionRepository;
    }

    [HttpGet("survey/{guid:guid}")]
    public async Task<IActionResult> Index(Guid guid)
    {
        var survey = await this.SurveyRepo.GetSurveyByPublishedGuid(guid);
        if (survey == null)
        {
            return NotFound("Survey not found.");
        }

        // TODO the guid will get the survey version
        var publishedVersion = survey.SurveyVersions.FirstOrDefault(v => v.StatusId == SurveyStatus.Published);
        if (publishedVersion == null)
        {
            return NotFound("No published survey version available.");
        }

        ViewBag.SurveyGuid = guid;
        ViewBag.SurveySchema = publishedVersion.SurveySchemaJson;
        ViewBag.SurveyName = survey.SurveyName;
        ViewBag.SurveyDescription = survey.Description;

        return View();
    }

    [HttpPost("survey/{guid:guid}/submit")]
    public async Task<IActionResult> Submit(Guid guid, [FromBody] SubmitSurveyRequest request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.Submission))
        {
            return BadRequest("Submission payload is required.");
        }

        var survey = await this.SurveyRepo.GetSurveyByPublishedGuid(guid);
        if (survey == null)
        {
            return NotFound("Survey not found for provided link.");
        }

        var publishedVersion = survey.SurveyVersions.FirstOrDefault(v => v.StatusId == SurveyStatus.Published); // TODO
        if (publishedVersion == null)
        {
            return BadRequest("No published survey version available for submissions.");
        }

        var surveySubmission = new SurveySubmission
        {
            SurveyId = survey.SurveyId,
            SurveyVersionId = publishedVersion.SurveyVersionId,
            SubmittedBy = null, // Anonymous submission
            SubmittedAt = DateTime.UtcNow,
            SubmittedIpAddress = HttpContext.Connection.RemoteIpAddress?.ToString(),
            Submission = request.Submission
        };

        var submissionId = await this.SubmissionRepo.SubmitSurvey(surveySubmission);
        if (submissionId == 0)
        {
            return BadRequest("Failed to submit survey.");
        }

        return Ok(new { submissionId = submissionId });
    }
}