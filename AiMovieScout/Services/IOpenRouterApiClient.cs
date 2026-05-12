
namespace AiMovieScout.Services
{
    public interface IOpenRouterApiClient
    {
        Task<string> ChatCompletionAsync(string message, string model = "openai/gpt-5.2", CancellationToken cancellationToken = default);
    }
}