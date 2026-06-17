using Microsoft.AspNetCore.Identity;

namespace ShowcaseAPI.Models
{
    public class ApplicationUser : IdentityUser
    {
        public bool BrowserNotificationsEnabled { get; set; } = true;
    }
}