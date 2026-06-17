using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ShowcaseAPI.Models
{
    public class Contactform
    {
        [Required(ErrorMessage = "First name is required")]
        [StringLength(60)]
        public required string FirstName { get; set; }

        [Required(ErrorMessage = "Last name is required")]
        [StringLength(60)]
        public required string LastName { get; set; }

        [NotMapped]
        public string FullName => $"{FirstName} {LastName}";

        [Required(ErrorMessage = "Email is required")]
        [EmailAddress]
        public required string Email { get; set; }

        [Required(ErrorMessage = "Mobile no. is required")]
        [RegularExpression("^(?!0+$)(\\+\\d{1,3}[- ]?)?(?!0+$)\\d{10,15}$", ErrorMessage = "Please enter valid phone no.")]
        public required string Phone { get; set; }

        [Required(ErrorMessage = "Subject is required")]
        [StringLength(200)]
        public required string Subject { get; set; }

        [Required(ErrorMessage = "Message is required")]
        [StringLength(600)]
        public required string Message { get; set; }

        [Required]
        public int CaptchaNumA { get; set; }

        [Required]
        public int CaptchaNumB { get; set; }

        [Required]
        public required string CaptchaAnswer { get; set; }
    }
}
