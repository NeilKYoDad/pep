using System;
using System.Data;
using System.Text.Json;
using System.Text.Json.Serialization;
using Dapper;

namespace Pep.Admin.WebApi.TypeHandlers;

// Convert a JSON column to/from a C# class using System.Text.Json
public sealed class JsonTypeHandler<T> : SqlMapper.TypeHandler<T?> where T : class
{
    private static readonly JsonSerializerOptions DefaultOptions = new()
    {
        PropertyNamingPolicy = null,
        PropertyNameCaseInsensitive = true,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };

    private readonly JsonSerializerOptions _options;

    public JsonTypeHandler(JsonSerializerOptions? options = null)
    {
        _options = options ?? new JsonSerializerOptions(DefaultOptions);
    }

    public override T? Parse(object value)
    {
        if (value is null or DBNull)
        {
            return null;
        }

        if (value is string json)
        {
            if (string.IsNullOrWhiteSpace(json))
            {
                return null;
            }

            try
            {
                return JsonSerializer.Deserialize<T>(json, _options);
            }
            catch (JsonException)
            {
                return null;
            }
        }

        return null;
    }

    public override void SetValue(IDbDataParameter parameter, T? value)
    {
        if (parameter is null)
        {
            throw new ArgumentNullException(nameof(parameter));
        }

        parameter.Value = value is null
            ? DBNull.Value
            : JsonSerializer.Serialize(value, _options);

        parameter.DbType = DbType.String;
    }
}
