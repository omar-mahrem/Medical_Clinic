# Stage 1: Build .NET API
FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /src

# Copy project files for caching restore layer
COPY ["MedicalClinic.Api/MedicalClinic.Api.csproj", "MedicalClinic.Api/"]
COPY ["MedicalClinic.Application/MedicalClinic.Application.csproj", "MedicalClinic.Application/"]
COPY ["MedicalClinic.Core/MedicalClinic.Core.csproj", "MedicalClinic.Core/"]
COPY ["MedicalClinic.Infrastructure/MedicalClinic.Infrastructure.csproj", "MedicalClinic.Infrastructure/"]

RUN dotnet restore "MedicalClinic.Api/MedicalClinic.Api.csproj"

# Copy full source and publish
COPY . .
WORKDIR "/src/MedicalClinic.Api"
RUN dotnet publish "MedicalClinic.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS final
WORKDIR /app

# Install font libraries for QuestPDF Arabic and text rendering on Linux
RUN apt-get update && apt-get install -y --no-install-recommends \
    libfontconfig1 \
    libgdiplus \
    fonts-dejavu-core \
    fontconfig \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/publish .
# Ensure email Templates and Fonts directories are present
COPY ["Templates", "/app/Templates"]
COPY ["Fonts", "/app/Fonts"]

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "MedicalClinic.Api.dll"]
