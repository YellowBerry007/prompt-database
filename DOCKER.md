# Docker Setup Guide

Deze guide legt uit hoe je de Prompt Database applicatie kunt draaien met Docker.

## Vereisten

- Docker (versie 20.10 of hoger)
- Docker Compose (versie 2.0 of hoger)

## Snelstart (Productie)

1. **Build en start de container:**
```bash
docker-compose up -d --build
```

2. **Initialiseer de database:**
```bash
# Voer migraties uit
docker-compose exec app npx prisma migrate deploy

# (Optioneel) Seed de database
docker-compose exec app npm run db:seed
```

3. **Open de applicatie:**
   - Ga naar http://localhost:3300

4. **Stop de container:**
```bash
docker-compose down
```

## Development Mode

Voor development met hot-reload:

```bash
docker-compose -f docker-compose.dev.yml up --build
```

## Database Persistente Opslag

De database wordt opgeslagen in de `./data` directory op je host machine. Dit zorgt ervoor dat je data behouden blijft wanneer je de container stopt of verwijdert.

## Handige Commands

### Logs bekijken
```bash
docker-compose logs -f app
```

### Container status
```bash
docker-compose ps
```

### Database migraties uitvoeren
```bash
docker-compose exec app npx prisma migrate deploy
```

### Prisma Studio openen (database browser)
```bash
docker-compose exec app npx prisma studio
```

### Shell toegang tot container
```bash
docker-compose exec app sh
```

### Container opnieuw opbouwen
```bash
docker-compose up -d --build --force-recreate
```

### Alles verwijderen (inclusief data)
```bash
docker-compose down -v
```

## Environment Variables

Je kunt environment variables aanpassen in `docker-compose.yml`:

```yaml
environment:
  - DATABASE_URL=file:/app/data/prod.db
  - NODE_ENV=production
  - NEXT_PUBLIC_BASE_URL=http://localhost:3300
```

Voor productie, overweeg het gebruik van een `.env` bestand:

```bash
# .env
DATABASE_URL=file:/app/data/prod.db
NODE_ENV=production
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

En update `docker-compose.yml`:
```yaml
env_file:
  - .env
```

## Productie Deployment

Voor productie deployment:

1. **Update NEXT_PUBLIC_BASE_URL** naar je echte domain
2. **Gebruik een reverse proxy** (nginx, traefik) voor HTTPS
3. **Backup de database regelmatig** (de `./data` directory)
4. **Monitor de container** met health checks

## Troubleshooting

### Database migraties falen
```bash
# Reset de database (LET OP: dit verwijdert alle data!)
docker-compose exec app npx prisma migrate reset
```

### Port 3300 al in gebruik
Pas de port mapping aan in `docker-compose.yml`:
```yaml
ports:
  - "3301:3000"  # Gebruik nu http://localhost:3301
```

### Container start niet
```bash
# Bekijk de logs
docker-compose logs app

# Check of de image correct gebouwd is
docker images | grep prompt-database
```

### Database permissions
Als je permission errors krijgt:
```bash
docker-compose exec app chown -R nextjs:nodejs /app/data
```

## Backup & Restore

### Backup database
```bash
docker-compose exec app cp /app/data/prod.db /app/data/prod.db.backup
# Of kopieer de hele data directory
cp -r ./data ./data-backup
```

### Restore database
```bash
# Stop de container
docker-compose down

# Herstel de database
cp ./data-backup/prod.db ./data/prod.db

# Start opnieuw
docker-compose up -d
```

