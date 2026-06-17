using System.Security.Cryptography;
using System.Text;
using ShowcaseAPI.Interfaces;

namespace ShowcaseAPI.Services
{
    public class EncryptionService : IEncryptionService
    {
        private readonly byte[] _key;

        public EncryptionService(IConfiguration configuration)
        {
            string base64Key = configuration["APP_ENCRYPTION_KEY"]
                               ?? throw new Exception("Encryption Key ontbreekt in configuratie!");

            _key = Convert.FromBase64String(base64Key);

            // 3. Check of de sleutel geldig is voor AES-256 (moet 32 bytes zijn)
            if (_key.Length != 32)
            {
                throw new Exception($"Ongeldige sleutel lengte: {_key.Length} bytes. AES-256 vereist 32 bytes.");
            }
        }

        public byte[] Encrypt(string plainText)
        {
            using (Aes aes = Aes.Create())
            {
                aes.Key = _key;
                aes.GenerateIV();

                using (ICryptoTransform encryptor = aes.CreateEncryptor(aes.Key, aes.IV))
                using (MemoryStream ms = new MemoryStream())
                {
                    ms.Write(aes.IV, 0, aes.IV.Length);

                    using (CryptoStream cs = new CryptoStream(ms, encryptor, CryptoStreamMode.Write))
                    using (StreamWriter sw = new StreamWriter(cs))
                    {
                        sw.Write(plainText);
                    }

                    return ms.ToArray();
                }
            }
        }

        public string Decrypt(byte[] cipherData)
        {
            using (Aes aes = Aes.Create())
            {
                aes.Key = _key;

                byte[] iv = new byte[16];
                Array.Copy(cipherData, 0, iv, 0, iv.Length);
                aes.IV = iv;

                using (MemoryStream ms = new MemoryStream(cipherData, 16, cipherData.Length - 16))
                using (ICryptoTransform decryptor = aes.CreateDecryptor(aes.Key, aes.IV))
                using (CryptoStream cs = new CryptoStream(ms, decryptor, CryptoStreamMode.Read))
                using (StreamReader sr = new StreamReader(cs))
                {
                    return sr.ReadToEnd();
                }
            }
        }
    }
}