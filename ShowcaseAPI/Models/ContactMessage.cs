using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ShowcaseAPI.Models
{
    public class ContactMessage
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(60)]
        public required string FirstName { get; set; }

        [Required]
        [MaxLength(60)]
        public required string LastName { get; set; }

        [NotMapped]
        public string FullName => $"{FirstName} {LastName}";

        [Required]
        [MaxLength(200)]
        public required string Subject { get; set; }

        [Required]
        public required string MessageText { get; set; } 

        [Required]
        public required byte[] EmailEncrypted { get; set; }

        [Required]
        public required byte[] PhoneEncrypted { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}