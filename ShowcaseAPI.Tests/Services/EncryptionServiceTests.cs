using Microsoft.Extensions.Configuration;
using Moq;
using ShowcaseAPI.Services;
using System;
using System.Text;
using Xunit;

namespace ShowcaseAPI.Tests.Services
{
    public class EncryptionServiceTests
    {
        [Fact]
        public void Encrypt_And_Decrypt_Should_Return_Original_Text()
        {
            //Arrange
            string originalText = "Dit is een geheim bericht!";

            byte[] keyBytes = new byte[32];
            new Random().NextBytes(keyBytes);
            string validBase64Key = Convert.ToBase64String(keyBytes);

            Mock<IConfiguration> mockConfig = new Mock<IConfiguration>();
            mockConfig.Setup(c => c["APP_ENCRYPTION_KEY"]).Returns(validBase64Key);

            EncryptionService service = new EncryptionService(mockConfig.Object);

            //Act
            byte[] encryptedData = service.Encrypt(originalText);
            string decryptedText = service.Decrypt(encryptedData);

            //Assert
            Assert.NotNull(encryptedData);
            Assert.NotEmpty(encryptedData);
            Assert.NotEqual(originalText, Encoding.UTF8.GetString(encryptedData));
            Assert.Equal(originalText, decryptedText); 
        }

        [Fact]
        public void Encrypt_And_Decrypt_Empty_String_Should_Work()
        {
            // Arrange: empty string should round-trip without errors
            string originalText = string.Empty;

            byte[] keyBytes = new byte[32];
            new Random().NextBytes(keyBytes);
            string validBase64Key = Convert.ToBase64String(keyBytes);

            Mock<IConfiguration> mockConfig = new Mock<IConfiguration>();
            mockConfig.Setup(c => c["APP_ENCRYPTION_KEY"]).Returns(validBase64Key);

            EncryptionService service = new EncryptionService(mockConfig.Object);

            // Act
            byte[] encryptedData = service.Encrypt(originalText);
            string decryptedText = service.Decrypt(encryptedData);

            // Assert: decrypted text equals original empty string
            Assert.Equal(originalText, decryptedText);
        }

        [Fact]
        public void Constructor_Should_Throw_On_Invalid_Key_Length()
        {
            // Arrange: provide a base64 key that decodes to invalid length (e.g., 16 bytes)
            byte[] shortKey = new byte[16];
            new Random().NextBytes(shortKey);
            string invalidBase64 = Convert.ToBase64String(shortKey);

            Mock<IConfiguration> mockConfig = new Mock<IConfiguration>();
            mockConfig.Setup(c => c["APP_ENCRYPTION_KEY"]).Returns(invalidBase64);

            // Act & Assert: constructor should throw due to invalid key length
            Assert.Throws<Exception>(() => new EncryptionService(mockConfig.Object));
        }
    }
}