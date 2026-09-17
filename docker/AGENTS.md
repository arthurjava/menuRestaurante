# Docker AGENTS.md - Regras Específicas de Infraestrutura Docker

## 1. Objetivo
Define regras obrigatórias para Docker, Docker Compose e containers no projeto.

---

## 2. Estrutura de Arquivos

```
restaurante/
├── docker-compose.yml          # Desenvolvimento
├── docker-compose.prod.yml     # Produção
├── backend/
│   ├── Dockerfile.dev          # Dev: hot reload, debug port
│   └── Dockerfile.prod         # Prod: multi-stage, non-root
├── frontend/
│   ├── Dockerfile.dev          # Dev: npm start, poll
│   ├── Dockerfile.prod         # Prod: multi-stage nginx
│   └── nginx.conf              # SPA fallback + proxy /api
└── nginx/
    └── nginx.conf              # Reverse proxy produção
```

---

## 3. Docker Compose - Desenvolvimento (`docker-compose.yml`)

### Serviços Obrigatórios
| Serviço | Imagem | Portas | Volumes | Healthcheck |
|---------|--------|--------|---------|-------------|
| postgres | postgres:16-alpine | 5432:5432 | postgres_data + migrations | pg_isready |
| backend | build: ./backend (dev) | 8080:8080 | ./backend:/app + ~/.m2 | Spring Actuator |
| frontend | build: ./frontend (dev) | 4200:4200 | ./frontend:/app + /app/node_modules | - |

### Regras Dev
- `SPRING_PROFILES_ACTIVE=dev`
- `NODE_ENV=development`
- Volumes bind-mount para hot reload
- Maven cache persistido (`~/.m2`)
- Backend depende de `postgres:service_healthy`
- Frontend depende de `backend`
- Network bridge compartilhada: `restaurante-network`

### Variáveis de Ambiente Dev
```yaml
environment:
  DB_HOST: postgres
  DB_PORT: 5432
  DB_NAME: restaurante
  DB_USER: restaurante
  DB_PASSWORD: restaurante123
  JWT_SECRET: ${JWT_SECRET:-dev-secret-key-change-in-production}
  JWT_EXPIRATION: 86400000
```

---

## 4. Docker Compose - Produção (`docker-compose.prod.yml`)

### Serviços Obrigatórios
| Serviço | Build | Portas | Restart | Recursos |
|---------|-------|--------|---------|----------|
| postgres | image | - | unless-stopped | memory: 1G |
| backend | Dockerfile.prod | - | unless-stopped | memory: 1G |
| frontend | Dockerfile.prod | - | unless-stopped | - |
| nginx | nginx:alpine | 80:80, 443:443 | unless-stopped | - |

### Regras Prod
- **Nenhum** bind-mount de código fonte
- Variáveis via `.env` (não hardcoded)
- Secrets via Docker secrets ou env vars seguras
- Volumes named para dados persistentes (`postgres_prod_data`)
- Healthchecks em todos serviços
- `restart: unless-stopped`
- Resource limits (deploy.resources.limits.memory)

### Nginx Produção
- Proxy pass: `/api` → `backend:8080`
- SPA fallback: `try_files $uri $uri/ /index.html`
- SSL termination (certificados em `./nginx/ssl/`)
- Gzip + cache headers para assets estáticos
- Rate limiting opcional

---

## 5. Dockerfiles

### Backend - Dev (`Dockerfile.dev`)
```dockerfile
FROM eclipse-temurin:25-jdk-alpine
WORKDIR /app
RUN apk add --no-cache maven
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
EXPOSE 8080 5005
CMD ["./mvnw", "spring-boot:run", "-Dspring-boot.run.jvmArguments=-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005"]
```
- Hot reload via volume mount
- Debug port 5005 exposto
- Maven cache em volume

### Backend - Prod (`Dockerfile.prod`) — Multi-stage
```dockerfile
# Builder
FROM eclipse-temurin:25-jdk-alpine AS builder
WORKDIR /app
COPY pom.xml . && COPY src ./src
RUN ./mvnw clean package -DskipTests -B

# Runtime
FROM eclipse-temurin:25-jre-alpine
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --from=builder /app/target/*.jar app.jar
RUN chown appuser:appgroup app.jar
USER appuser
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```
- Non-root user
- JRE apenas (menor imagem)
- JAR único copiado do builder

### Frontend - Dev (`Dockerfile.dev`)
```dockerfile
FROM node:22-alpine
WORKDIR /app
RUN npm install -g @angular/cli@21
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 4200
CMD ["npm", "start", "--", "--host", "0.0.0.0", "--poll", "2000"]
```
- Angular CLI global
- `--poll 2000` para hot reload em volume mount

### Frontend - Prod (`Dockerfile.prod`) — Multi-stage
```dockerfile
# Builder
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG CONFIGURATION=production
RUN npm run build -- --configuration=$CONFIGURATION

# Runtime
FROM nginx:alpine
COPY --from=builder /app/dist/restaurante/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```
- Build Angular em stage builder
- Nginx alpine servindo estáticos
- `nginx.conf` com proxy `/api` e SPA fallback

---

## 6. Variáveis de Ambiente e Secrets

### Arquivo `.env.example` (Obrigatório)
```bash
# Database
DB_NAME=restaurante
DB_USER=restaurante
DB_PASSWORD=changeme
DB_HOST=postgres
DB_PORT=5432

# JWT
JWT_SECRET=min-32-chars-secret-key
JWT_EXPIRATION=86400000
JWT_REFRESH_EXPIRATION=604800000

# CORS
CORS_ALLOWED_ORIGINS=https://seudominio.com

# Upload
UPLOAD_DIR=/app/uploads
UPLOAD_URL_PREFIX=/uploads

# Frontend
API_URL=https://api.seudominio.com
```

### Regras Secrets
- **Nunca** commit `.env` real
- `.env.example` versionado sem valores reais
- Produção: Docker secrets ou secret manager (AWS Secrets Manager, Vault, etc)
- `JWT_SECRET` mínimo 32 chars, gerado aleatoriamente
- `DB_PASSWORD` forte, único por ambiente

---

## 7. Volumes e Persistência

| Volume | Serviço | Conteúdo | Backup |
|--------|---------|----------|--------|
| postgres_data | postgres (dev) | /var/lib/postgresql/data | Opcional |
| postgres_prod_data | postgres (prod) | /var/lib/postgresql/data | **Obrigatório** |
| uploads | backend | ./uploads (dev) / /app/uploads (prod) | **Obrigatório** |

### Regras
- `docker compose down -v` **apenas com autorização explícita** (remove volumes)
- Backup PostgreSQL: `pg_dump` agendado (cron/job)
- Imagens upload: sincronizar com S3/MinIO em produção

---

## 8. Networks

- Rede única: `restaurante-network` (bridge)
- Todos serviços na mesma rede
- Comunicação interna por nome do serviço (`postgres`, `backend`, `frontend`)
- Nginx acessa `backend:8080` e `frontend:80`

---

## 9. Healthchecks

### PostgreSQL
```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d ${DB_NAME}"]
  interval: 10s
  timeout: 5s
  retries: 5
```

### Backend (Spring Actuator)
```yaml
healthcheck:
  test: ["CMD", "wget", "-q", "--spider", "http://localhost:8080/actuator/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

### Nginx
```yaml
healthcheck:
  test: ["CMD", "wget", "-q", "--spider", "http://localhost/health"]
  interval: 30s
  timeout: 5s
  retries: 3
```

---

## 10. Build e Deploy

### Comandos Dev
```bash
docker compose up --build -d          # Sobe tudo
docker compose logs -f backend        # Logs backend
docker compose exec backend bash      # Shell no container
docker compose down                   # Para (preserva volumes)
```

### Comandos Prod
```bash
docker compose -f docker-compose.prod.yml --env-file .env up --build -d
docker compose -f docker-compose.prod.yml logs -f
docker compose -f docker-compose.prod.yml down  # Para (preserva volumes)
```

### CI/CD (GitHub Actions)
- Build multi-arch (amd64/arm64) opcional
- Push para registry (GHCR/Docker Hub)
- Deploy via `docker compose` no servidor ou Kubernetes

---

## 11. Checklist Antes de Commit (Docker)
- [ ] `docker compose -f docker-compose.yml build` passa
- [ ] `docker compose -f docker-compose.prod.yml build` passa
- [ ] Nenhum secret hardcoded em Dockerfiles/compose
- [ ] `.dockerignore` existe em backend/ e frontend/
- [ ] Healthchecks configurados
- [ ] Non-root user em prod Dockerfiles
- [ ] Resource limits em prod compose
- [ ] Volumes named para dados persistentes
- [ ] Nginx.conf válido (testado com `nginx -t`)

---

## 12. Troubleshooting Comum

| Problema | Verificação |
|----------|-------------|
| Backend não conecta no Postgres | Healthcheck postgres, DB_HOST=postgres, network |
| Frontend não carrega | Build Angular, nginx.conf SPA fallback, proxy /api |
| Hot reload não funciona | Volumes bind-mount, --poll no frontend |
| Permissão negada upload | User non-root, volume permissions, UPLOAD_DIR |
| JWT invalid | JWT_SECRET igual em dev/prod, clock sync |
| CORS erro | CORS_ALLOWED_ORIGINS, nginx proxy headers |