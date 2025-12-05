using FluentValidation;
using Pep.Model.Models;

namespace PEP.Admin.WebApi.Validators;

public class UpdateSurveyValidator : AbstractValidator<UpdateSurvey>
{
    public UpdateSurveyValidator()
    {
        RuleFor(x => x.SurveyName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Description).MaximumLength(500);
    }
}