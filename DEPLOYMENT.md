# Deployment Instructies

## Live URL
De applicatie is beschikbaar op: **http://46.224.72.129/prompt-database**

## Eerste Setup op Server

### Stap 1: SSH naar de server
```bash
ssh -i /path/to/your/private/key root@46.224.72.129
```

### Stap 2: Setup script uitvoeren
```bash
cd /opt/prompt-database-app
bash setup-server.sh
```

Dit script:
- Installeert nginx (als dat nog niet is gebeurd)
- Configureert de reverse proxy
- Installeert Docker en Docker Compose
- Bouwt en start de applicatie
- Initialiseert de database

## Toekomstige Deployments

### Optie 1: Met deployment script (lokaal)
```bash
./deploy.sh --key=/path/to/your/private/key
```

### Optie 2: Handmatig
```bash
# 1. Push code naar server
git push hertzner main

# 2. SSH naar server
ssh -i /path/to/your/private/key root@46.224.72.129

# 3. Update en restart
cd /opt/prompt-database-app
git pull origin main
docker-compose down
docker-compose up -d --build
docker-compose exec -T app npx prisma migrate deploy
```

## Handige Commands

### Logs bekijken
```bash
cd /opt/prompt-database-app
docker-compose logs -f app
```

### App herstarten
```bash
cd /opt/prompt-database-app
docker-compose restart
```

### Nginx status
```bash
systemctl status nginx
systemctl restart nginx
```

### Database backup
```bash
cd /opt/prompt-database-app
cp data/prod.db data/prod.db.backup.$(date +%Y%m%d)
```

## Troubleshooting

### App is niet bereikbaar
1. Check of Docker containers draaien: `docker-compose ps`
2. Check nginx status: `systemctl status nginx`
3. Check nginx logs: `tail -f /var/log/nginx/error.log`
4. Check app logs: `docker-compose logs app`

### Nginx configuratie testen
```bash
nginx -t
```

### Nginx configuratie herladen
```bash
systemctl reload nginx
```

