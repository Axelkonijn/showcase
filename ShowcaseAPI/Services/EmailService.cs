using MailKit.Net.Smtp;
using MimeKit;
using ShowcaseAPI.Interfaces;

namespace ShowcaseAPI.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;

    public EmailService(IConfiguration config)
    {
        _config = config;
    }

    public async Task SendEmailAsync(string to, string subject, string body)
    {
        var email = new MimeMessage();
        email.From.Add(MailboxAddress.Parse("noreply@showcase.com"));
        email.To.Add(MailboxAddress.Parse(to));
        email.Subject = subject;
        email.Body = new TextPart(MimeKit.Text.TextFormat.Html) { Text = body };

        using var smtp = new SmtpClient();
        // Connect using the environment variables we set in Docker
        await smtp.ConnectAsync(
            _config["SMTP_HOST"],
            int.Parse(_config["SMTP_PORT"] ?? "2525"),
            false
        );

        await smtp.AuthenticateAsync(_config["SMTP_USER"], _config["SMTP_PASS"]);
        await smtp.SendAsync(email);
        await smtp.DisconnectAsync(true);
    }
}