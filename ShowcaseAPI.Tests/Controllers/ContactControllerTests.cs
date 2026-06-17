using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Moq;
using ShowcaseAPI.Controllers;
using ShowcaseAPI.Data;
using ShowcaseAPI.Hubs;
using ShowcaseAPI.Interfaces;
using ShowcaseAPI.Models;
using Xunit;

namespace ShowcaseAPI.Tests.Controllers
{
    public class ContactControllerTests
    {
        [Fact]
        public async Task Post_Should_Return_OK_When_Captcha_Is_Valid()
        {
            var mockEmail = new Mock<IEmailService>();
            var mockEncrypt = new Mock<IEncryptionService>();
            var mockHubContext = new Mock<IHubContext<ContactHub>>();
            var mockHubClients = new Mock<IHubClients>();
            var mockClientProxy = new Mock<IClientProxy>();

            mockHubContext.SetupGet(x => x.Clients).Returns(mockHubClients.Object);
            mockHubClients.Setup(x => x.All).Returns(mockClientProxy.Object);
            mockClientProxy
                .Setup(x => x.SendCoreAsync(
                    "ReceiveMessage",
                    It.IsAny<object[]>(),
                    default))
                .Returns(Task.CompletedTask);

            mockEmail
                .Setup(x => x.SendEmailAsync(
                    It.IsAny<string>(),
                    It.IsAny<string>(),
                    It.IsAny<string>()))
                .Returns(Task.CompletedTask);

            mockEncrypt.Setup(x => x.Encrypt(It.IsAny<string>())).Returns(Array.Empty<byte>());

            var dbOptions = new DbContextOptionsBuilder<ShowcaseDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            using var context = new ShowcaseDbContext(dbOptions);

            var controller = new ContactController(
                mockEmail.Object,
                mockEncrypt.Object,
                context,
                mockHubContext.Object
            );

            var form = new Contactform
            {
                FirstName = "Test",
                LastName = "Tester",
                Email = "test@example.com",
                Phone = "0612345678",
                Subject = "Test Subject",
                Message = "Dit bericht zal aankomen.",
                CaptchaNumA = 10,
                CaptchaNumB = 10,
                CaptchaAnswer = "20"
            };

            IActionResult result = await controller.Post(form);

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(200, okResult.StatusCode);

            Assert.Equal(1, await context.ContactMessages.CountAsync());
        }

        [Fact]
        public async Task Post_Should_Return_BadRequest_When_Captcha_Is_Invalid()
        {
            //Arrange
            Mock<IEmailService> mockEmail = new Mock<IEmailService>();
            Mock<IEncryptionService> mockEncrypt = new Mock<IEncryptionService>();
            Mock<IHubContext<ContactHub>> mockHub = new Mock<IHubContext<ContactHub>>();

            DbContextOptions<ShowcaseDbContext> dbOptions = new DbContextOptionsBuilder<ShowcaseDbContext>().Options;
            Mock<ShowcaseDbContext> mockContext = new Mock<ShowcaseDbContext>(dbOptions);

            ContactController controller = new ContactController(
                mockEmail.Object,
                mockEncrypt.Object,
                mockContext.Object,
                mockHub.Object
            );

            Contactform invalidForm = new Contactform
            {
                FirstName = "Test",
                LastName = "Tester",
                Email = "test@example.com",
                Phone = "0612345678",
                Subject = "Test Subject",
                Message = "Dit bericht mag niet aankomen.",
                CaptchaNumA = 10,
                CaptchaNumB = 10,
                CaptchaAnswer = "5"
            };

            //Act
            IActionResult result = await controller.Post(invalidForm);

            //Assert
            BadRequestObjectResult badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal(400, badRequestResult.StatusCode);
        }

        [Fact]
        public async Task GetMessages_Should_Return_Ordered_And_Decrypted_Values()
        {
            // Arrange: create in-memory DB with two messages, newer first
            var dbOptions = new DbContextOptionsBuilder<ShowcaseDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            using var context = new ShowcaseDbContext(dbOptions);

            // Two stored messages with different CreatedAt timestamps
            context.ContactMessages.Add(new Models.ContactMessage
            {
                FirstName = "A",
                LastName = "One",
                Subject = "S1",
                MessageText = "M1",
                EmailEncrypted = new byte[] { 1 },
                PhoneEncrypted = new byte[] { 2 },
                CreatedAt = DateTime.UtcNow.AddMinutes(-5)
            });

            context.ContactMessages.Add(new Models.ContactMessage
            {
                FirstName = "B",
                LastName = "Two",
                Subject = "S2",
                MessageText = "M2",
                EmailEncrypted = new byte[] { 3 },
                PhoneEncrypted = new byte[] { 4 },
                CreatedAt = DateTime.UtcNow
            });

            await context.SaveChangesAsync();

            var mockEmail = new Mock<IEmailService>();
            var mockEncrypt = new Mock<IEncryptionService>();
            var mockHubContext = new Mock<IHubContext<ContactHub>>();

            // Decrypt must return a distinct readable value for each stored byte array,
            // so we can verify that the controller is really exposing decrypted email/phone values.
            mockEncrypt.Setup(x => x.Decrypt(It.Is<byte[]>(b => b.SequenceEqual(new byte[] { 1 })))).Returns("old-email@example.com");
            mockEncrypt.Setup(x => x.Decrypt(It.Is<byte[]>(b => b.SequenceEqual(new byte[] { 2 })))).Returns("0611111111");
            mockEncrypt.Setup(x => x.Decrypt(It.Is<byte[]>(b => b.SequenceEqual(new byte[] { 3 })))).Returns("new-email@example.com");
            mockEncrypt.Setup(x => x.Decrypt(It.Is<byte[]>(b => b.SequenceEqual(new byte[] { 4 })))).Returns("0622222222");

            var controller = new ContactController(
                mockEmail.Object,
                mockEncrypt.Object,
                context,
                mockHubContext.Object
            );

            // Act
            var result = await controller.GetMessages();

            // Assert: Ok result and order is newest-first
            var ok = Assert.IsType<OkObjectResult>(result);
            var items = Assert.IsAssignableFrom<System.Collections.IEnumerable>(ok.Value);
            var messageList = items.Cast<object>().ToList();

            // Extract CreatedAt values via reflection to check ordering
            var list = new List<DateTime>();
            foreach (var it in messageList)
            {
                var createdAt = (DateTime)it.GetType().GetProperty("CreatedAt").GetValue(it);
                list.Add(createdAt);
            }

            // Newest (most recent) should be first
            Assert.True(list[0] >= list[1]);

            // Check that the first item contains the decrypted values for the newest record.
            var first = messageList[0];
            Assert.Equal("new-email@example.com", first.GetType().GetProperty("Email").GetValue(first));
            Assert.Equal("0622222222", first.GetType().GetProperty("Phone").GetValue(first));

            // Check that the second item contains the decrypted values for the older record.
            var second = messageList[1];
            Assert.Equal("old-email@example.com", second.GetType().GetProperty("Email").GetValue(second));
            Assert.Equal("0611111111", second.GetType().GetProperty("Phone").GetValue(second));

            // Also verify the controller asked the encryption service to decrypt all stored values.
            mockEncrypt.Verify(x => x.Decrypt(It.Is<byte[]>(b => b.SequenceEqual(new byte[] { 1 }))), Times.Once);
            mockEncrypt.Verify(x => x.Decrypt(It.Is<byte[]>(b => b.SequenceEqual(new byte[] { 2 }))), Times.Once);
            mockEncrypt.Verify(x => x.Decrypt(It.Is<byte[]>(b => b.SequenceEqual(new byte[] { 3 }))), Times.Once);
            mockEncrypt.Verify(x => x.Decrypt(It.Is<byte[]>(b => b.SequenceEqual(new byte[] { 4 }))), Times.Once);
        }

        [Fact]
        public async Task Delete_Should_Return_NotFound_When_Missing_And_NoContent_When_Exists()
        {
            // Arrange: fresh in-memory DB
            var dbOptions = new DbContextOptionsBuilder<ShowcaseDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            using var context = new ShowcaseDbContext(dbOptions);

            var mockEmail = new Mock<IEmailService>();
            var mockEncrypt = new Mock<IEncryptionService>();
            var mockHubContext = new Mock<IHubContext<ContactHub>>();

            var controller = new ContactController(
                mockEmail.Object,
                mockEncrypt.Object,
                context,
                mockHubContext.Object
            );

            // Act & Assert: deleting non-existent ID returns NotFound
            var notFoundResult = await controller.Delete(999);
            Assert.IsType<NotFoundObjectResult>(notFoundResult);

            // Add a message and then delete it
            var msg = new Models.ContactMessage
            {
                FirstName = "Del",
                LastName = "Me",
                Subject = "S",
                MessageText = "M",
                EmailEncrypted = new byte[] { 1 },
                PhoneEncrypted = new byte[] { 2 }
            };
            context.ContactMessages.Add(msg);
            await context.SaveChangesAsync();

            var noContent = await controller.Delete(msg.Id);
            Assert.IsType<NoContentResult>(noContent);

            // Ensure message removed from DB
            Assert.Equal(0, await context.ContactMessages.CountAsync());
        }
    }
}