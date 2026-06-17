using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using ShowcaseAPI.Data;
using ShowcaseAPI.Models;
using System.Collections.Generic;
using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using System.Threading.Tasks;

namespace ShowcaseAPI.Tests.TestHelpers
{
    public static class TestUtils
    {
        // Create a fresh in-memory ShowcaseDbContext for isolated tests
        public static ShowcaseDbContext CreateInMemoryContext(string dbName)
        {
            var options = new DbContextOptionsBuilder<ShowcaseDbContext>()
                .UseInMemoryDatabase(dbName)
                .Options;

            return new ShowcaseDbContext(options);
        }

        // Create a ClaimsPrincipal representing an authenticated (optionally role-bound) user
        public static ClaimsPrincipal CreateUserPrincipal(string userId = "test-user", string userName = "testuser", params string[] roles)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, userId),
                new Claim(ClaimTypes.Name, userName)
            };

            foreach (var r in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, r));
            }

            var identity = new ClaimsIdentity(claims, "TestAuth");
            return new ClaimsPrincipal(identity);
        }

        // Create a lightweight UserManager suitable for tests where GetUserAsync and UpdateAsync are needed.
        public static UserManager<ApplicationUser> CreateUserManagerReturningUser(ApplicationUser user)
        {
            var store = new Mock<IUserStore<ApplicationUser>>().Object;
            var options = Options.Create(new IdentityOptions());
            var passwordHasher = new PasswordHasher<ApplicationUser>();
            var userValidators = new IUserValidator<ApplicationUser>[0];
            var passwordValidators = new IPasswordValidator<ApplicationUser>[0];
            var keyNormalizer = new Mock<ILookupNormalizer>().Object;
            var errors = new IdentityErrorDescriber();
            var services = new Mock<IServiceProvider>().Object;
            var logger = new Mock<ILogger<UserManager<ApplicationUser>>>().Object;

            return new TestUserManager(store, options, passwordHasher, userValidators, passwordValidators, keyNormalizer, errors, services, logger, user);
        }

        private class TestUserManager : UserManager<ApplicationUser>
        {
            private readonly ApplicationUser _user;

            public TestUserManager(IUserStore<ApplicationUser> store,
                IOptions<IdentityOptions> optionsAccessor,
                IPasswordHasher<ApplicationUser> passwordHasher,
                IEnumerable<IUserValidator<ApplicationUser>> userValidators,
                IEnumerable<IPasswordValidator<ApplicationUser>> passwordValidators,
                ILookupNormalizer keyNormalizer,
                IdentityErrorDescriber errors,
                IServiceProvider services,
                ILogger<UserManager<ApplicationUser>> logger,
                ApplicationUser user)
                : base(store, optionsAccessor, passwordHasher, userValidators, passwordValidators, keyNormalizer, errors, services, logger)
            {
                _user = user;
            }

            public override Task<ApplicationUser?> GetUserAsync(ClaimsPrincipal principal)
            {
                // Return the preconfigured user regardless of the principal
                return Task.FromResult<ApplicationUser?>(_user);
            }

            public override Task<IdentityResult> UpdateAsync(ApplicationUser user)
            {
                // Simulate a successful update; copy properties into stored user for assertions
                _user.BrowserNotificationsEnabled = user.BrowserNotificationsEnabled;
                return Task.FromResult(IdentityResult.Success);
            }
        }
    }
}
