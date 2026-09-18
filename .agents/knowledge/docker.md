# Docker — Configuração de Containers

## Visão Geral

Dois ambientes: **Development** e **Production** com Docker Compose separados.

## Development (docker-compose.yml)

### Serviços

#### postgres
```yaml
image: postgres:16-alpine
container_name: restaurante-db
environment:
  POSTGRES_DB: restaurante
  POSTGRES_USER: restaurante
  POSTGRES_PASSWORD: restaurante123
ports: ["5432:5432"]
volumes:
  - postgres_data:/var/lib/postgresql/data
  - ./backend/src/main/resources/db/migration:/docker-entrypoint-initdb.d
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U restaurante -d restaurante"]
  interval: 10s, timeout: 5s, retries: 5
networks: [restaurante-network]
```

#### backend
```yaml
build:
  context: ./backend
  dockerfile: Dockerfile.dev
container_name: restaurante-backend
environment:
  SPRING_PROFILES_ACTIVE: dev
  DB_HOST: postgres
  DB_PORT: 5432
  DB_NAME: restaurante
  DB_USER: restaurante
  DB_PASSWORD: restaurante123
  JWT_SECRET: ${JWT_SECRET:-dev-secret-key-change-in-production}
  JWT_EXPIRATION: 86400000
ports: ["8080:8080"]
volumes:
  - ./backend:/app
  - ~/.m2:/root/.m2
depends_on:
  postgres:
    condition: service_healthy
networks: [restaurante-network]
command: ./mvnw spring-boot:run
```

#### frontend
```yaml
build:
  context: ./frontend
  dockerfile: Dockerfile.dev
container_name: restaurante-frontend
environment:
  NODE_ENV: development
ports: ["4200:4200"]
volumes:
  - ./frontend:/app
  - /app/node_modules
depends_on: [backend]
networks: [restaurante-network]
command: npm start -- --host 0.0.0.0 --poll 2000
```

### Volumes
```yaml
volumes:
  postgres_data:
```

### Networks
```yaml
networks:
  restaurante-network:
    driver: bridge
```

## Production (docker-compose.prod.yml)

### Serviços

#### postgres
```yaml
image: postgres:16-alpine
container_name: restaurante-db-prod
environment:
  POSTGRES_DB: ${DB_NAME}
  POSTGRES_USER: ${DB_USER}
  POSTGRES_PASSWORD: ${DB_PASSWORD}
volumes:
  - postgres_prod_data:/var/lib/postgresql/data
networks: [restaurante-network]
restart: unless-stopped
deploy:
  resources:
    limits:
      memory: 1G
```

#### backend
```yaml
build:
  context: ./backend
  dockerfile: Dockerfile.prod
container_name: restaurante-backend-prod
environment:
  SPRING_PROFILES_ACTIVE: prod
  DB_HOST: postgres
  DB_PORT: 5432
  DB_NAME: ${DB_NAME}
  DB_USER: ${DB_USER}
  DB_PASSWORD: ${DB_PASSWORD}
  JWT_SECRET: ${JWT_SECRET}
  JWT_EXPIRATION: ${JWT_EXPIRATION:-86400000}
  CORS_ALLOWED_ORIGINS: ${CORS_ALLOWED_ORIGINS}
networks: [restaurante-network]
restart: unless-stopped
deploy:
  resources:
    limits:
      memory: 1G
```

#### frontend
```yaml
build:
  context: ./frontend
  dockerfile: Dockerfile.prod
container_name: restaurante-frontend-prod
ports: ["80:80", "443:443"]
depends_on: [backend]
networks: [restaurante-network]
restart: unless-stopped
```

#### nginx
```yaml
image: nginx:alpine
container_name: restaurante-nginx
ports: ["80:80", "443:443"]
volumes:
  - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
  - ./nginx/ssl:/etc/nginx/ssl:ro
depends_on: [frontend, backend]
networks: [restaurante-network]
restart: unless-stopped
```

### Volumes
```yaml
volumes:
  postgres_prod_data:
```

## Dockerfiles

### Backend Dev (Dockerfile.dev)

```dockerfile
FROM eclipse-temurin:25-jdk-alpine

WORKDIR /app

RUN apk add --no-cache maven

COPY pom.xml .
RUN mvn dependency:go-offline -B

COPY src ./src

EXPOSE 8080

CMD ["./mvnw", "spring-boot:run", "-Dspring-boot.run.jvmArguments=-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005"]
```

**Características**:
- Base: `eclipse-temurin:25-jdk-alpine` (Java 25)
- Instala Maven no container
- Cache de dependências (`dependency:go-offline`)
- Hot reload via volume mount (`./backend:/app`)
- Debug port 5005 exposto
- **Nota**: AGENTS.md diz Java 25, pom.xml diz Java 21

### Backend Prod (Dockerfile.prod) — Multi-stage

```dockerfile
# Stage 1: Builder
FROM eclipse-temurin:25-jdk-alpine AS builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN ./mvnw clean package -DskipTests -B

# Stage 2: Runtime
FROM eclipse-temurin:25-jre-alpine
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --from=builder /app/target/*.jar app.jar
RUN chown appuser:appgroup app.jar
USER appuser
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

**Características**:
- Multi-stage build (builder + runtime)
- Builder: JDK 25, compila com Maven
- Runtime: JRE 25 (menor), usuário não-root
- `-DskipTests` no build
- JAR único copiado do stage builder

### Frontend Dev (Dockerfile.dev)

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

**Características**:
- Base: `node:22-alpine`
- Angular CLI 21 global
- `npm ci` para install determinístico
- Volume mount para hot reload
- Polling para file watching em Docker (`--poll 2000`)

### Frontend Prod (Dockerfile.prod) — Multi-stage

```dockerfile
# Stage 1: Builder
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG CONFIGURATION=production
RUN npm run build -- --configuration=$CONFIGURATION

# Stage 2: Nginx
FROM nginx:alpine
COPY --from=builder /app/dist/restaurante/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Características**:
- Multi-stage: Node builder + Nginx runtime
- Build Angular com `--configuration=production`
- Output: `/app/dist/restaurante/browser` (Angular 21 default)
- Nginx serve arquivos estáticos + proxy `/api` para backend

## Nginx (nginx.conf)

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    gzip on;
    gzip_types text/plain application/json application/javascript text/css;
}
```

**Características**:
- SPA routing: `try_files $uri $uri/ /index.html`
- Proxy `/api` → `backend:8080` (mesmo network Docker)
- Headers de proxy preservados
- Gzip para assets estáticos

## Variáveis de Ambiente

### Dev (docker-compose.yml)
| Variável | Valor | Origem |
|----------|-------|--------|
| `SPRING_PROFILES_ACTIVE` | `dev` | Hardcoded |
| `DB_HOST` | `postgres` | Service name |
| `DB_PORT` | `5432` | Default PostgreSQL |
| `DB_NAME` | `restaurante` | Hardcoded |
| `DB_USER` | `restaurante` | Hardcoded |
| `DB_PASSWORD` | `restaurante123` | Hardcoded |
| `JWT_SECRET` | `${JWT_SECRET:-dev-secret...}` | Env var com default |
| `JWT_EXPIRATION` | `86400000` | Hardcoded |

### Prod (docker-compose.prod.yml)
| Variável | Valor | Origem |
|----------|-------|--------|
| `SPRING_PROFILES_ACTIVE` | `prod` | Hardcoded |
| `DB_HOST` | `postgres` | Service name |
| `DB_NAME` | `${DB_NAME}` | **Obrigatório** (env var) |
| `DB_USER` | `${DB_USER}` | **Obrigatório** (env var) |
| `DB_PASSWORD` | `${DB_PASSWORD}` | **Obrigatório** (env var) |
| `JWT_SECRET` | `${JWT_SECRET}` | **Obrigatório** (env var) |
| `JWT_EXPIRATION` | `${JWT_EXPIRATION:-86400000}` | Env var com default |
| `CORS_ALLOWED_ORIGINS` | `${CORS_ALLOWED_ORIGINS}` | **Obrigatório** (env var) |

## Scripts PowerShell (Raiz do Projeto)

- `setup-db.ps1` - Setup inicial do banco
- `setup-db-final.ps1` - Setup completo
- `reset-postgres.ps1` - Reset do PostgreSQL
- `fix-pg-hba.ps1` - Correção pg_hba.conf
- `start` - Script de inicialização (sem extensão)

## Observações e Hipóteses

### Java Version Mismatch (Confirmado)

**AGENTS.md**: "Java 25.0.4.1 (language level 25)"
**pom.xml**: `<java.version>21</java.version>`
**Dockerfiles**: `eclipse-temurin:25-jdk-alpine` / `eclipse-temurin:25-jre-alpine`

**Inconsistência**: Projeto configurado para Java 21 no Maven mas Docker usa Java 25.
- Spring Boot 3.5.0 suporta Java 21+ (não requer 25)
- Dockerfiles devem usar `eclipse-temurin:21-jdk-alpine` para consistência
- Ou atualizar pom.xml para Java 25

### Dev: Volumes Montados

- `./backend:/app` - Código fonte montado (hot reload)
- `~/.m2:/root/.m2` - Cache Maven do host
- Permite desenvolvimento sem rebuild de imagem

### Dev: Frontend Polling

- `--poll 2000` necessário para file watching em volumes Docker no Windows/macOS
- Angular CLI usa chokidar, polling fallback

### Prod: Nginx Duplicado

- `frontend` service expõe portas 80/443
- `nginx` service também expõe 80/443
- **Conflito potencial**: Ambos tentam bind nas mesmas portas no host
- Frontend prod Dockerfile já usa Nginx internamente
- `nginx` service separado parece redundante ou para SSL termination

### Prod: Variáveis Obrigatórias

- `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`, `CORS_ALLOWED_ORIGINS` **devem** ser definidas
- Sem defaults no docker-compose.prod.yml
- Falha no deploy se não definidas

### Healthcheck PostgreSQL

- Dev: `pg_isready` com 5 retries, 10s interval
- Backend depende de `condition: service_healthy`
- Garante banco pronto antes de subir aplicação

## Confiança

**Alta** - Dockerfiles bem estruturados, multi-stage em prod, configurações claras.

## Data

2026-09-18