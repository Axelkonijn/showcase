namespace ShowcaseAPI.Interfaces
{
    public interface IEncryptionService
    {
        byte[] Encrypt(string plainText);

        string Decrypt(byte[] cipherData);
    }
}