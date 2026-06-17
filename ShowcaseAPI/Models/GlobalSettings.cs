namespace ShowcaseAPI.Models
{
    public class GlobalSettings
    {
        public int Id { get; set; }
        public bool EmailNotificationsEnabled { get; set; } = false;
        public string AvailabilityStatus { get; set; } = "Available";
    }
}