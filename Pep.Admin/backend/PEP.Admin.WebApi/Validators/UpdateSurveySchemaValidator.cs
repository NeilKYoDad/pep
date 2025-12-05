using FluentValidation;
using Pep.Model.Models;
using System.Text.Json;

namespace Pep.Admin.WebApi.Validators;

public class UpdateSurveySchemaValidator : AbstractValidator<UpdateSurveySchema>
{
    public UpdateSurveySchemaValidator()
    {
        RuleFor(x => x.SurveySchemaJson).NotEmpty().Must(ValidationHelpers.BeValidJson).WithMessage("SurveySchemaJson must be valid JSON.");
        RuleFor(x => x.ChangeNotes).MaximumLength(500);
    }
}