ShowcaseAPI.Tests — korte gids

Doel
- Kleine set van kwalitatieve unit tests die kritieke businessregels beschermen (auth/settings, contact berichten, encryptie-edge-cases).

Belangrijk
- Uitleg staat inline boven niet-triviale asserts in de testbestanden.
- Tests gebruiken een in-memory `ShowcaseDbContext` en `Moq` voor externe afhankelijkheden.

Runnen
Open een terminal en run:

```bash
dotnet test ShowcaseAPI.Tests/ShowcaseAPI.Tests.csproj
```

Waar te vinden
- Tests: `ShowcaseAPI.Tests/Controllers` en `ShowcaseAPI.Tests/Services`
- Testhelpers: `ShowcaseAPI.Tests/TestHelpers/TestUtils.cs`
