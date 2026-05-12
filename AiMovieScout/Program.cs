using AiMovieScout.Services;
using dotenv.net;
using Microsoft.AspNetCore.DataProtection.KeyManagement;

var builder = WebApplication.CreateBuilder(args);

DotEnv.Load();

// Add services to the container.
builder.Services.AddControllersWithViews();

string apiKey = Environment.GetEnvironmentVariable("API_KEY") ?? throw new Exception("Отсутсвует API_KEY переменная окружения");

builder.Services.AddHttpClient("OpenRouterApi", client =>
{
    client.BaseAddress = new Uri("https://openrouter.ai/api/v1");
    client.DefaultRequestHeaders.Add("Authorization", $"Bearer {apiKey}");
    client.Timeout = TimeSpan.FromSeconds(30);
});

builder.Services.AddScoped<IOpenRouterApiClient, OpenRouterApiClient>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
