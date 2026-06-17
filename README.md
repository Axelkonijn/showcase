login as admin with:
username: admin@showcase.com
password: Admin123!



Normale startup

docker compose up --build



Startup with tests

docker compose --profile test up --build



## Eerste setup (na een verse clone)

`.env` en de TLS-certificaten staan niet in git (zie `.gitignore`). Maak ze lokaal aan:

1. Env-bestand:

   cp .env.example .env        # en vul echte waarden in (o.a. APP_ENCRYPTION_KEY)

   APP_ENCRYPTION_KEY moet base64 zijn die naar 32 bytes decodeert (AES-256). Genereren:
   openssl rand -base64 32

2. Self-signed dev-certificaten voor de nginx-proxy:

   mkdir -p certs
   openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
     -keyout certs/nginx-selfsigned.key \
     -out certs/nginx-selfsigned.crt \
     -subj "/CN=showcase-proxy"



## DTAP-omgevingen

- Development: `docker compose up --build`
- Test: draait automatisch in GitHub Actions (`.github/workflows/ci.yml`)
- Acceptatie: `docker-compose.acceptance.yml` (haalt ghcr.io-images, zie bestand voor commando)
- Productie: `docker-compose.production.yml` (promoot exact dezelfde image-tag)

