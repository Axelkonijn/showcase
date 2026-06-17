using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShowcaseAPI.Data;
using ShowcaseAPI.Models;

namespace ShowcaseAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ShowcaseDbContext _context;

        public AuthController(
            SignInManager<ApplicationUser> signInManager,
            UserManager<ApplicationUser> userManager,
            ShowcaseDbContext context)
        {
            _signInManager = signInManager;
            _userManager = userManager;
            _context = context;
        }

        [HttpGet("status")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPublicStatus()
        {
            var global = await _context.GlobalSettings.FirstOrDefaultAsync();
            return Ok(new { status = global?.AvailabilityStatus ?? "Available" });
        }

        [Authorize]
        [HttpGet("settings")]
        public async Task<IActionResult> GetSettings()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            var global = await _context.GlobalSettings.FirstOrDefaultAsync();

            return Ok(new
            {
                browserNotifications = user.BrowserNotificationsEnabled,

                emailNotifications = global?.EmailNotificationsEnabled ?? false,
                availabilityStatus = global?.AvailabilityStatus ?? "Available"
            });
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("settings")]
        public async Task<IActionResult> UpdateSettings([FromBody] SettingsDto dto)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            user.BrowserNotificationsEnabled = dto.BrowserNotificationsEnabled;
            await _userManager.UpdateAsync(user);

            var global = await _context.GlobalSettings.FirstOrDefaultAsync();
            if (global == null)
            {
                global = new GlobalSettings();
                _context.GlobalSettings.Add(global);
            }

            global.EmailNotificationsEnabled = dto.EmailNotificationsEnabled;
            global.AvailabilityStatus = dto.AvailabilityStatus;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Instellingen opgeslagen" });
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            await _signInManager.SignOutAsync();
            return Ok(new { message = "Uitgelogd" });
        }

        [HttpGet("check")]
        public IActionResult CheckUser()
        {
            if (User.Identity != null && User.Identity.IsAuthenticated)
            {
                return Ok(new { isAuthenticated = true, user = User.Identity.Name });
            }
            return Ok(new { isAuthenticated = false });
        }
    }

    public class SettingsDto
    {
        public bool BrowserNotificationsEnabled { get; set; }
        public bool EmailNotificationsEnabled { get; set; }
        public string AvailabilityStatus { get; set; }
    }
}