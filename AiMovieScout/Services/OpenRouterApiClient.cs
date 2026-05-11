using System.Text;
using System.Text.Json;

namespace AiMovieScout.Services
{
    public class OpenRouterApiClient
    {
        private readonly HttpClient _httpClient;
        private const string BaseUrl = "https://openrouter.ai/api/v1";

        public OpenRouterApiClient(string apiKey)
        {
            _httpClient = new HttpClient();
            _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {apiKey}");
        }

        public async Task<string> ChatCompletionAsync(
            string model,
            string message,
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
                var response = await _httpClient.PostAsync(
                    $"{BaseUrl}/chat/completions",
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
                throw new Exception($"Failed to get completion: {ex.Message}", ex);
            }
        }
    }
}
