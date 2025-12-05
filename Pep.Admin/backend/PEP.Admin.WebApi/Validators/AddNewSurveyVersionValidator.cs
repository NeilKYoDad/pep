using FluentValidation;
using Pep.Model.Models;

namespace Pep.Admin.WebApi.Validators;

public class AddNewSurveyVersionValidator : AbstractValidator<AddNewSurveyVersion>
{
    public AddNewSurveyVersionValidator()
    {
        RuleFor(x => x.SurveySchemaJson).NotEmpty().Must(ValidationHelpers.BeValidJson).WithMessage("SurveySchemaJson must be valid JSON.");
        RuleFor(x => x.ChangeNotes).MaximumLength(500);
    }
}