using System.Text.Json;

namespace Pep.Admin.WebApi.Validators;

public static class ValidationHelpers
{
    public static bool BeValidJson(string json)
    {
        try
        {
            JsonDocument.Parse(json);
            return true;
        }
        catch
        {
            return false;
        }
    }
}