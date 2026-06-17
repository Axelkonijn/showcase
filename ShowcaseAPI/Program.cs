using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;
using ShowcaseAPI.Data;
using ShowcaseAPI.Interfaces;
using ShowcaseAPI.Models;
using ShowcaseAPI.Services;

var builder = WebApplication.CreateBuilder(args);


var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

builder.Services.AddDbContext<ShowcaseDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddIdentityApiEndpoints<ApplicationUser>()
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<ShowcaseDbContext>();

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddSingleton<IEncryptionService, EncryptionService>();
builder.Services.AddSignalR();

builder.Services.AddCors(options =>
{
    options.AddPolicy("DevFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:3000",      
                "http://showcase-webapp:3000" 
              ) 
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); 
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
    app.MapGet("/", () => Results.Redirect("/scalar/v1"));
}

app.UseRouting();

app.UseCors("DevFrontend");

app.UseAuthentication();
app.UseAuthorization(); 

app.MapIdentityApi<ApplicationUser>();

app.MapControllers();

app.MapHub<ShowcaseAPI.Hubs.ContactHub>("/hub/contact");

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ShowcaseDbContext>();

        await context.Database.MigrateAsync();

        await DbSeeder.SeedAsync(services);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Something went wrong with DB migration or seeding.");
    }
}

app.Run();
