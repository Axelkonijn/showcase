# ShowcaseAPI.Tests/Dockerfile
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Kopieer projectbestanden
COPY ["ShowcaseAPI/ShowcaseAPI.csproj", "ShowcaseAPI/"]
COPY ["ShowcaseAPI.Tests/ShowcaseAPI.Tests.csproj", "ShowcaseAPI.Tests/"]
RUN dotnet restore "ShowcaseAPI.Tests/ShowcaseAPI.Tests.csproj"

# Kopieer de rest van de code
COPY . .

# Bouw en draai de tests
WORKDIR "/src/ShowcaseAPI.Tests"
CMD ["dotnet", "test"]