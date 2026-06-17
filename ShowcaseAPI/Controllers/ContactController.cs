using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using ShowcaseAPI.Hubs;
using ShowcaseAPI.Interfaces;
using ShowcaseAPI.Models;
using ShowcaseAPI.Data;
using Ganss.Xss;

namespace ShowcaseAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")] //http://localhost:5000/api/contact
    public class ContactController : ControllerBase
    {
        private readonly IEmailService _emailService;
        private readonly IEncryptionService _encryptionService;
        private readonly ShowcaseDbContext _context;
        private readonly IHubContext<ContactHub> _hubContext;
        public ContactController(
            IEmailService emailService,
            IEncryptionService encryptionService,
            ShowcaseDbContext context,
            IHubContext<ContactHub> hubContext)
        {
            _emailService = emailService;
            _encryptionService = encryptionService;
            _context = context;
            _hubContext = hubContext;
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetMessages()
        {
            var messages = await _context.ContactMessages
                .OrderByDescending(m => m.CreatedAt)
                .ToListAsync();

            var result = messages.Select(m => new
            {
                m.Id,
                m.FirstName,
                m.LastName,
                m.FullName, 
                m.Subject,
                m.MessageText,
                m.CreatedAt,

                Email = _encryptionService.Decrypt(m.EmailEncrypted),
                Phone = _encryptionService.Decrypt(m.PhoneEncrypted)
            });

            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] Contactform form)
        {
            if (!int.TryParse(form.CaptchaAnswer, out int answer) || (form.CaptchaNumA + form.CaptchaNumB != answer))
            {
                return BadRequest(new { errors = new { captcha = "Onjuist antwoord." } });
            }

            HtmlSanitizer sanitizer = new HtmlSanitizer();
            sanitizer.AllowedTags.Clear();
            sanitizer.AllowedAttributes.Clear();
            sanitizer.AllowedSchemes.Clear();
            sanitizer.AllowedCssProperties.Clear();
            sanitizer.AllowedTags.UnionWith(new[] { "h1", "h2", "h3", "h4", "h5", "h6", "strong", "ul", "ol", "li", "p", "br" });

            string sanitizedMessage = sanitizer.Sanitize(form.Message);

            Console.WriteLine($"[API] Received message from: {form.Email}");

            try
            {
                ContactMessage newMessage = new ContactMessage
                {
                    FirstName = form.FirstName,
                    LastName = form.LastName,
                    Subject = form.Subject,
                    MessageText = sanitizedMessage,

                    EmailEncrypted = _encryptionService.Encrypt(form.Email),
                    PhoneEncrypted = _encryptionService.Encrypt(form.Phone),

                    CreatedAt = DateTime.UtcNow
                };

                _context.ContactMessages.Add(newMessage);
                await _context.SaveChangesAsync();
                await _hubContext.Clients.All.SendAsync("ReceiveMessage", newMessage.FullName);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"DB Error: {ex.Message}");
                return StatusCode(500, new { message = "Fout bij opslaan in database." });
            }

            string emailBody = $@"
                <h1>Nieuw Contactbericht</h1>
                <p><strong>Naam:</strong> {form.FullName}</p>
                <p><strong>E-mail:</strong> {form.Email}</p>
                <p><strong>Telefoon:</strong> {form.Phone}</p>
                <p><strong>Onderwerp:</strong> {form.Subject}</p>
                <p><strong>Bericht:</strong><br/>{sanitizedMessage}</p>";

            _ = Task.Run(async () =>
            {
                try
                {
                    await _emailService.SendEmailAsync("your-own-email@example.com", "Contactformulier Portfolio", emailBody);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Email Error (non-fatal): {ex.Message}");
                }
            });

            return Ok(new { message = "Bericht succesvol opgeslagen en verzonden!" });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var message = await _context.ContactMessages.FindAsync(id);

            if (message == null)
            {
                return NotFound(new { message = "Bericht niet gevonden." });
            }

            _context.ContactMessages.Remove(message);

            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}