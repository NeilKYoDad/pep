using FluentValidation;
using Pep.Model.Models;

namespace Pep.Admin.WebApi.Validators;

public class SubmitSurveyRequestValidator : AbstractValidator<SubmitSurveyRequest>
{
    public SubmitSurveyRequestValidator()
    {
        RuleFor(x => x.Submission).NotEmpty().Must(ValidationHelpers.BeValidJson).WithMessage("Submission must be valid JSON.");
    }
}