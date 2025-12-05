using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Pep.Model.Repositories.Interfaces;
using Pep.Model.Models;
using Microsoft.Extensions.Logging;

namespace Pep.Admin.WebApi.Controllers;

[Route("[controller]")]
[Authorize]
public class SurveyController : BaseController
{
    private readonly ISurveyRepository SurveyRepository;
    private readonly ISurveyVersionRepository SurveyVersionRepository;
    private readonly ILogger<SurveyController> Logger;

    public SurveyController(ISurveyRepository repo, ISurveyVersionRepository versionRepository, ILogger<SurveyController> logger)
    {
        this.SurveyRepository = repo;
        this.SurveyVersionRepository = versionRepository;
        this.Logger = logger;
    }

    [HttpGet("")]
    public async Task<ActionResult<IEnumerable<SurveySummaryListItem>>> GetAllSurveys(CancellationToken ct = default)
    {
        var surveys = await this.SurveyRepository.GetAllSurveys(ct);

        return Ok(surveys);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Survey>> GetSurvey(int id, CancellationToken ct = default)
    {
        var survey = await this.SurveyRepository.GetSurvey(id, ct);

        if (survey == null)
        {
            return NotFound();
        }

        return Ok(survey);
    }

    [HttpPost("create")]
    public async Task<ActionResult<CreateSurveyResponse>> CreateSurvey(CreateSurvey createSurvey, CancellationToken ct = default)
    {
        int staffId = GetStaffIdFromContext();

        // TODO - check for a duplicate name

        var survey = await this.SurveyRepository.CreateSurvey(createSurvey, staffId, ct);

        return Ok(survey);
    }

    [HttpPost("{surveyId:int}/update")]
    public async Task<ActionResult> UpdateSurvey(int surveyId, [FromBody] UpdateSurvey dto, CancellationToken ct = default)
    {
        int staffId = GetStaffIdFromContext();

         // TODO - check for a duplicate name

        await this.SurveyRepository.UpdateSurvey(surveyId, dto, staffId, ct);

        return Ok();
    }

    [HttpPost("{surveyId:int}/version/create")]
    public async Task<ActionResult<AddNewSurveyVersionResponse>> AddNewSurveyVersion(
        int surveyId,
        [FromBody] AddNewSurveyVersion dto,
        CancellationToken ct = default)
    {
        var survey = await this.SurveyRepository.GetSurvey(surveyId, ct);
        if (survey == null)
        {
            return NotFound($"Survey with ID {surveyId} not found.");
        }

        // You can't add if there's already a version in draft state
        var draftVersion = survey.SurveyVersions.FirstOrDefault(v => v.StatusId == SurveyStatus.Draft);
        if (draftVersion != null)
        {
            return BadRequest("Cannot add a new survey version while there is an existing draft version.");
        }

        // Copy the form schema from the latest version into this version
        var latestVersion = survey.SurveyVersions
            .OrderByDescending(v => v.VersionNumber)
            .FirstOrDefault();

        if (latestVersion != null)
        {
            dto.SurveySchemaJson = latestVersion.SurveySchemaJson;
        }

        int staffId = GetStaffIdFromContext();

        var response = await this.SurveyVersionRepository.AddNewSurveyVersion(surveyId, staffId, dto, ct);

        return Ok(response);
    }

    [HttpPut("{surveyId:int}/versions/{versionId:int}")]
    public async Task<ActionResult> UpdateSurveySchema(
        int surveyId,
        int versionId,
        [FromBody] UpdateSurveySchema dto,
        CancellationToken ct = default)
    {
        var (survey, version, errorResult) = await this.GetSurveyVersionOrNotFound(surveyId, versionId, ct);
        if (errorResult != null || survey == null || version == null)
        {
            return errorResult ?? NotFound("Survey or version not found.");
        }

        // Verify it's a draft status
        int staffId = GetStaffIdFromContext();

        version.UpdateSurveySchema(dto.SurveySchemaJson, dto.ChangeNotes, staffId);

        return await this.UpdateSurveyVersion(surveyId, versionId, version, ct);
    }

    [HttpPost("{surveyId:int}/versions/{versionId:int}/approve")]
    public async Task<ActionResult> ApproveSurveyVersion(int surveyId, int versionId, CancellationToken ct = default)
    {
        var (survey, version, errorResult) = await this.GetSurveyVersionOrNotFound(surveyId, versionId, ct);
        if (errorResult != null || survey == null || version == null)
        {
            return errorResult ?? NotFound("Survey or version not found.");
        }

        // You can't approve if there's already a version in the approved state
        var existingApprovedVersion = survey.SurveyVersions.FirstOrDefault(v => v.StatusId == SurveyStatus.Approved && v.SurveyVersionId != versionId);
        if (existingApprovedVersion != null)
        {
            return BadRequest("Cannot approve this survey version while another approved version exists.");
        }

        int staffId = GetStaffIdFromContext();
        version.Approve(staffId);

        return await this.UpdateSurveyVersion(surveyId, versionId, version, ct);
    }

    [HttpPost("{surveyId:int}/versions/{versionId:int}/publish")]
    public async Task<ActionResult> PublishSurveyVersion(int surveyId, int versionId, CancellationToken ct = default)
    {
        var (survey, version, errorResult) = await this.GetSurveyVersionOrNotFound(surveyId, versionId, ct);
        if (errorResult != null || survey == null || version == null)
        {
            return errorResult ?? NotFound("Survey version not found.");
        }

        // You can't publish if there's already a version in the published state
        var existingPublishedVersion = survey.SurveyVersions.FirstOrDefault(v => v.StatusId == SurveyStatus.Published && v.SurveyVersionId != versionId);
        if (existingPublishedVersion != null)
        {
            return BadRequest("Cannot publish this survey version while another published version exists.");
        }

        int staffId = GetStaffIdFromContext();
        version.Publish(staffId);

        return await this.UpdateSurveyVersion(surveyId, versionId, version, ct);
    }

    [HttpPost("{surveyId:int}/versions/{versionId:int}/retire")]
    public async Task<ActionResult> RetireSurveyVersion(int surveyId, int versionId, CancellationToken ct = default)
    {
        var (_, version, errorResult) = await this.GetSurveyVersionOrNotFound(surveyId, versionId, ct);
        if (errorResult != null || version == null)
        {
            return errorResult ?? NotFound("Survey version not found.");
        }

        // TODO any survey state can be retired for now

        int staffId = GetStaffIdFromContext();
        version.Retire(staffId);

        return await this.UpdateSurveyVersion(surveyId, versionId, version, ct);
    }

    // TODO remove this endpoint as it would be in the pep submission app 
    [HttpGet("published/{publishedSurveyGuid:guid}")]
    public async Task<ActionResult<PublishedSurveySchemaResponse>> GetPublishedSurveySchema(
        Guid publishedSurveyGuid,
        CancellationToken ct = default)
    {
        var survey = await this.SurveyRepository.GetSurveyByPublishedGuid(publishedSurveyGuid, ct);
        if (survey == null)
        {
            return NotFound("Survey not found for provided link.");
        }

        // TODO do we  need to know the version of the published id?
        // At least there may be a condition where someone starts a survey and another is published in between?
        var publishedVersion = survey.SurveyVersions.FirstOrDefault(v => v.StatusId == SurveyStatus.Published);
        if (publishedVersion == null)
        {
            return NotFound("No published survey version available for this survey.");
        }

        var response = new PublishedSurveySchemaResponse
        {
            PublishedUrlGuid = survey.PublishedUrlGuid,
            SurveyCode = survey.SurveyCode,
            SurveyName = survey.SurveyName,
            Description = survey.Description,
            SurveySchemaJson = publishedVersion.SurveySchemaJson,
            PublishedAt = publishedVersion.PublishedAt
        };

        return Ok(response);
    }
    
#region private
    private async Task<ActionResult> UpdateSurveyVersion(
        int surveyId,
        int versionId,
        SurveyVersion version,
        CancellationToken ct)
    {
        try
        {
            await this.SurveyVersionRepository.UpdateSurveyVersion(surveyId, versionId, version, ct);
            return NoContent();
        }
        catch (Exception ex)
        {
            this.Logger.LogError(ex, "Failed to update survey version {VersionId} for survey {SurveyId}", versionId, surveyId);
            return BadRequest("An error occurred updating the survey version.");
        }
    }

    private async Task<(Survey? Survey, SurveyVersion? Version, ActionResult? ErrorResult)> GetSurveyVersionOrNotFound(
        int surveyId,
        int versionId,
        CancellationToken ct)
    {
        var survey = await this.SurveyRepository.GetSurvey(surveyId, ct);
        if (survey == null)
        {
            return (null, null, NotFound($"Survey with ID {surveyId} not found."));
        }

        var version = survey.SurveyVersions.FirstOrDefault(v => v.SurveyVersionId == versionId);
        if (version == null)
        {
            return (survey, null, NotFound($"Survey version with ID {versionId} not found in survey {surveyId}."));
        }

        return (survey, version, null);
    }
#endregion    
}