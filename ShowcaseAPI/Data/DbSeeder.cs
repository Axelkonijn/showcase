using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ShowcaseAPI.Models;

namespace ShowcaseAPI.Data
{
    public static class DbSeeder
    {
        public static async Task SeedAsync(IServiceProvider serviceProvider)
        {
            ShowcaseDbContext context = serviceProvider.GetRequiredService<ShowcaseDbContext>();

            if (!await context.GlobalSettings.AnyAsync())
            {
                context.GlobalSettings.Add(new GlobalSettings
                {
                    EmailNotificationsEnabled = false,
                    AvailabilityStatus = "Available"
                });
                await context.SaveChangesAsync();
            }

            var userManager = serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();
            var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();

            string roleName = "Admin";
            if (!await roleManager.RoleExistsAsync(roleName))
            {
                await roleManager.CreateAsync(new IdentityRole(roleName));
            }

            string adminEmail = "admin@showcase.com";
            var adminUser = await userManager.FindByEmailAsync(adminEmail);

            if (adminUser == null)
            {
                adminUser = new ApplicationUser
                {
                    UserName = adminEmail,
                    Email = adminEmail,
                    EmailConfirmed = true
                };

                var result = await userManager.CreateAsync(adminUser, "Admin123!");

                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(adminUser, roleName);
                }
            }

            roleName = "User";
            if (!await roleManager.RoleExistsAsync(roleName))
            {
                await roleManager.CreateAsync(new IdentityRole(roleName));
            }

            string guestEmail = "user@showcase.com";
            var guestUser = await userManager.FindByEmailAsync(guestEmail);

            if (guestUser == null)
            {
                guestUser = new ApplicationUser
                {
                    UserName = guestEmail,
                    Email = guestEmail,
                    EmailConfirmed = true
                };

                var result = await userManager.CreateAsync(guestUser, "Guest123!");

                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(guestUser, roleName);
                }
            }
        }
    }
}