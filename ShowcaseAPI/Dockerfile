# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["ShowcaseAPI.csproj", "./"]
RUN dotnet restore

COPY . .
RUN dotnet publish "ShowcaseAPI.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
EXPOSE 8080
COPY --from=build /app/publish .

# Draai als de meegeleverde non-root 'app'-user (aanwezig in .NET 8+ images)
USER app

ENTRYPOINT ["dotnet", "ShowcaseAPI.dll"]