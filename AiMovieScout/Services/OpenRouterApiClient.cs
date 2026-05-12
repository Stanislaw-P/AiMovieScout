using System.Text;
using System.Text.Json;

namespace AiMovieScout.Services
{
    public class OpenRouterApiClient : IOpenRouterApiClient
    {
        readonly IHttpClientFactory _httpClientFactory;
        readonly ILogger<OpenRouterApiClient> _logger;

        public OpenRouterApiClient(IHttpClientFactory httpClientFactory, ILogger<OpenRouterApiClient> logger)
        {
            _httpClientFactory = httpClientFactory;
            _logger = logger;
        }

        public async Task<string> ChatCompletionAsync(
            string message,
            string model = "openai/gpt-5.2",
            CancellationToken cancellationToken = default)
        {
            var request = new
            {
                model = model,
                messages = new[]
                {
                new { role = "user", content = message }
            },
                max_tokens = 1000,
                temperature = 0.7
            };

            var json = JsonSerializer.Serialize(request);
            using var content = new StringContent(json, Encoding.UTF8, "application/json");

            try
            {
                var httpClient = _httpClientFactory.CreateClient("OpenRouterApi");
                var response = await httpClient.PostAsync(
                    "chat/completions",
                    content,
                    cancellationToken
                );

                var responseString = await response.Content.ReadAsStringAsync(cancellationToken);

                if (!response.IsSuccessStatusCode)
                {
                    throw new HttpRequestException($"API Error: {response.StatusCode}\n{responseString}");
                }

                using var doc = JsonDocument.Parse(responseString);
                var result = doc.RootElement
                    .GetProperty("choices")[0]
                    .GetProperty("message")
                    .GetProperty("content")
                    .GetString();

                return result ?? string.Empty;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка API запроса");
                throw new Exception($"Failed to get completion: {ex.Message}", ex);
            }
        }
    }
}
