using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Moq;
using ShowcaseAPI.Controllers;
using ShowcaseAPI.Data;
using Microsoft.EntityFrameworkCore;
using ShowcaseAPI.Models;
using ShowcaseAPI.Tests.TestHelpers;
using System.Threading.Tasks;
using Xunit;

namespace ShowcaseAPI.Tests.Controllers
{
    public class AuthControllerTests
    {
        [Fact]
        public async Task GetPublicStatus_Returns_Default_When_No_GlobalSettings()
        {
            // Arrange: create in-memory context without global settings
            using var context = TestUtils.CreateInMemoryContext("public-status-no-global");

            // SignInManager is not used by this test; pass null to avoid complex mocking
            SignInManager<ApplicationUser>? mockSignIn = null;
            var mockUserManager = TestUtils.CreateUserManagerReturningUser(new ApplicationUser());

            var controller = new AuthController(
                mockSignIn,
                mockUserManager,
                context
            );

            // Act
            var result = await controller.GetPublicStatus();

            // Assert: Ok + default "Available" status
            var ok = Assert.IsType<OkObjectResult>(result);
            // Use reflection to read the anonymous object's `status` property
            var statusProp = ok.Value.GetType().GetProperty("status");
            Assert.NotNull(statusProp);
            var status = (string)statusProp.GetValue(ok.Value);
            Assert.Equal("Available", status);
        }

        [Fact]
        public async Task GetSettings_Returns_Unauthorized_When_No_User()
        {
            // Arrange: mock UserManager to return null for GetUserAsync
            using var context = TestUtils.CreateInMemoryContext("getsettings-no-user");

            // SignInManager is not used by this test; pass null to avoid complex mocking
            SignInManager<ApplicationUser>? mockSignIn = null;
            var mockUserManager = TestUtils.CreateUserManagerReturningUser(null);

            var controller = new AuthController(
                mockSignIn,
                mockUserManager,
                context
            );

            // Act
            var result = await controller.GetSettings();

            // Assert: Unauthorized result when no user is found
            Assert.IsType<UnauthorizedResult>(result);
        }

        [Fact]
        public async Task UpdateSettings_Persists_User_And_GlobalSettings()
        {
            // Arrange: prepare user and empty global settings
            using var context = TestUtils.CreateInMemoryContext("update-settings");

            var user = new ApplicationUser { UserName = "tester", BrowserNotificationsEnabled = false };

            // SignInManager is not used by this test; pass null to avoid complex mocking
            SignInManager<ApplicationUser>? mockSignIn = null;
            var mockUserManager = TestUtils.CreateUserManagerReturningUser(user);

            var controller = new AuthController(
                mockSignIn,
                mockUserManager,
                context
            );

            // Attach a user principal so controller.User is not null (GetUserAsync ignores the principal in our mock but it's good practice)
            controller.ControllerContext.HttpContext = new DefaultHttpContext { User = TestUtils.CreateUserPrincipal() };

            var dto = new SettingsDto
            {
                BrowserNotificationsEnabled = true,
                EmailNotificationsEnabled = true,
                AvailabilityStatus = "Away"
            };

            // Act
            var result = await controller.UpdateSettings(dto);

            // Assert: Ok result and changes persisted to DB and user object updated
            var ok = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(1, await context.GlobalSettings.CountAsync());

            // The controller sets the property on the user instance before calling UpdateAsync, so the instance should reflect the change
            Assert.True(user.BrowserNotificationsEnabled);
        }
    }
}
