using FluentValidation;
using Pep.Model.Models;

namespace Pep.Admin.WebApi.Validators;

public class CreateSurveyValidator : AbstractValidator<CreateSurvey>
{
    public CreateSurveyValidator()
    {
        RuleFor(x => x.SurveyName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Description).MaximumLength(500);
    }
}