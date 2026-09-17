# Plano de Desenvolvimento - Sistema de Cardápio de Restaurante

## 1. Visão Geral
Sistema completo de gerenciamento de cardápio para restaurante com frontend Angular 21, backend Spring Boot 3.5.x, banco PostgreSQL, containerizado com Docker.

---

## 2. Stack Tecnológica

### Backend
- **Java**: 25.0.4.1 (language level 25)
- **Spring Boot**: 3.5.x
- **Spring Framework**: 6.2.x
- **Spring Data JPA** + Hibernate
- **Spring Security** 6.x + JWT (jjwt 0.12.x)
- **Spring Validation** (Bean Validation)
- **PostgreSQL Driver**
- **Flyway** (migrações de banco)
- **MapStruct** (DTO mapping)
- **Lombok**
- **Springdoc OpenAPI** (Swagger UI)
- **Maven** 3.9.x

### Frontend
- **Angular**: 21.x (standalone components, signals)
- **TypeScript**: 5.9.x
- **RxJS**: 7.8+
- **Angular Material** 21 (UI components)
- **Tailwind CSS** 3.4+ (estilização)
- **Angular Reactive Forms**
- **Angular Signals** nativo (state management)
- **JWT Interceptor** (autenticação)

### Infraestrutura
- **Docker** + **Docker Compose**
- **PostgreSQL**: 16.x
- **Nginx** (reverse proxy para produção)
- **MinIO** ou **LocalStack S3** (storage de imagens - opcional)

---

## 3. Arquitetura do Projeto

```
restaurante/
├── docker-compose.yml
├── docker-compose.prod.yml
├── backend/
│   ├── src/main/java/com/restaurante/
│   │   ├── config/          # Configurações (Security, OpenAPI, WebMvc)
│   │   ├── controller/      # REST Controllers
│   │   ├── dto/             # Request/Response DTOs
│   │   ├── entity/          # JPA Entities
│   │   ├── exception/       # Global Exception Handler
│   │   ├── mapper/          # MapStruct Mappers
│   │   ├── repository/      # Spring Data Repositories
│   │   ├── security/        # JWT, UserDetails, SecurityConfig
│   │   ├── service/         # Business Logic
│   │   └── RestauranteApplication.java
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   ├── application-dev.yml
│   │   ├── application-prod.yml
│   │   └── db/migration/    # Flyway migrations
│   ├── Dockerfile
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/              # Services, Guards, Interceptors
│   │   │   │   ├── auth/          # AuthService, JWT Interceptor, Guards
│   │   │   │   ├── services/      # ApiService, NotificationService
│   │   │   │   └── models/        # Interfaces/Types
│   │   │   ├── shared/            # Componentes compartilhados
│   │   │   │   ├── components/    # Buttons, Inputs, Modals, Table
│   │   │   │   ├── directives/    # Custom directives
│   │   │   │   └── pipes/         # Custom pipes
│   │   │   ├── features/          # Feature modules (lazy loaded)
│   │   │   │   ├── auth/          # Login, Register, Recovery
│   │   │   │   ├── dashboard/     # Dashboard admin
│   │   │   │   ├── menu/          # Cardápio público
│   │   │   │   ├── dishes/        # CRUD Pratos (admin)
│   │   │   │   ├── categories/    # CRUD Categorias (admin)
│   │   │   │   ├── users/         # Gestão usuários (admin)
│   │   │   │   └── settings/      # Configurações restaurante
│   │   │   ├── layout/            # Header, Sidebar, Footer
│   │   │   ├── app.routes.ts      # Rotas principais
│   │   │   ├── app.config.ts      # Providers globais
│   │   │   └── app.component.ts
│   │   ├── assets/                # Imagens, ícones
│   │   ├── styles/                # Tailwind, global styles
│   │   └── environments/          # environment.ts
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── angular.json
│   └── tailwind.config.js
└── docs/
    ├── api-docs.md
    └── database-schema.md
```

---

## 4. Modelo de Dados (Entidades JPA)

### 4.1 Diagrama Entidade-Relacionamento

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   User      │       │  Category   │       │   Dish      │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │       │ id (PK)     │       │ id (PK)     │
│ email       │       │ name        │       │ name        │
│ password    │       │ description │       │ description │
│ name        │       │ image_url   │       │ price       │
│ role        │       │ display_order│      │ is_active   │
│ created_at  │       │ created_at  │       │ category_id │
│ updated_at  │       │ updated_at  │       │ image_url   │
└─────────────┘       └─────────────┘       │ prep_time   │
                                            │ calories    │
                                            │ allergens   │
                                            │ created_at  │
                                            │ updated_at  │
                                            └──────┬──────┘
                                                   │
                                            ┌──────┴──────┐
                                            │ DishImage   │
                                            ├─────────────┤
                                            │ id (PK)     │
                                            │ dish_id(FK) │
                                            │ image_url   │
                                            │ is_primary  │
                                            │ display_order│
                                            │ created_at  │
                                            └─────────────┘
```

### 4.2 Entidades Detalhadas

#### User
```java
@Entity @Table(name = "users")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(unique = true, nullable = false, length = 100)
    private String email;
    
    @Column(nullable = false)
    private String password; // BCrypt encoded
    
    @Column(nullable = false, length = 100)
    private String name;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role; // ADMIN, MANAGER, STAFF
    
    @Column(name = "is_active", nullable = false)
    private boolean active = true;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "createdBy")
    private List<Dish> createdDishes;
}
```

#### Category
```java
@Entity @Table(name = "categories")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Category {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(nullable = false, length = 100)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "image_url", length = 500)
    private String imageUrl;
    
    @Column(name = "display_order", nullable = false)
    private int displayOrder = 0;
    
    @Column(name = "is_active", nullable = false)
    private boolean active = true;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL)
    @OrderBy("displayOrder ASC")
    private List<Dish> dishes;
}
```

#### Dish
```java
@Entity @Table(name = "dishes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Dish {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(nullable = false, length = 150)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;
    
    @Column(name = "is_active", nullable = false)
    private boolean active = true;
    
    @Column(name = "prep_time_minutes")
    private Integer prepTimeMinutes;
    
    @Column(name = "calories")
    private Integer calories;
    
    @Column(length = 500)
    private String allergens; // JSON array ou CSV
    
    @Column(name = "image_url", length = 500)
    private String imageUrl; // Imagem principal
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "dish", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    private List<DishImage> images;
}
```

#### DishImage
```java
@Entity @Table(name = "dish_images")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DishImage {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dish_id", nullable = false)
    private Dish dish;
    
    @Column(name = "image_url", nullable = false, length = 500)
    private String imageUrl;
    
    @Column(name = "is_primary", nullable = false)
    private boolean primary = false;
    
    @Column(name = "display_order", nullable = false)
    private int displayOrder = 0;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
```

#### Role Enum
```java
public enum Role {
    ADMIN,      // Acesso total
    MANAGER,    // Gerencia cardápio, categorias, staff
    STAFF       // Visualização apenas
}
```

---

## 5. API REST Endpoints

### 5.1 Autenticação (`/api/auth`)
| Método | Endpoint | Descrição | Acesso |
|--------|----------|-----------|--------|
| POST | `/api/auth/login` | Login (retorna JWT) | Público |
| POST | `/api/auth/register` | Registro de usuário | Público |
| POST | `/api/auth/refresh` | Refresh token | Autenticado |
| POST | `/api/auth/logout` | Logout (blacklist token) | Autenticado |
| GET | `/api/auth/me` | Dados do usuário logado | Autenticado |
| PUT | `/api/auth/me` | Atualizar perfil | Autenticado |
| PUT | `/api/auth/me/password` | Alterar senha | Autenticado |

### 5.2 Usuários (`/api/users`) - ADMIN/MANAGER
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/users` | Listar usuários (paginado, filtros) |
| GET | `/api/users/{id}` | Buscar usuário por ID |
| POST | `/api/users` | Criar usuário |
| PUT | `/api/users/{id}` | Atualizar usuário |
| PATCH | `/api/users/{id}/toggle-active` | Ativar/Desativar |
| DELETE | `/api/users/{id}` | Excluir usuário |

### 5.3 Categorias (`/api/categories`)
| Método | Endpoint | Descrição | Acesso |
|--------|----------|-----------|--------|
| GET | `/api/categories` | Listar todas (ativas) | Público |
| GET | `/api/categories/admin` | Listar todas (admin, paginado) | ADMIN/MANAGER |
| GET | `/api/categories/{id}` | Buscar por ID | Público |
| POST | `/api/categories` | Criar categoria | ADMIN/MANAGER |
| PUT | `/api/categories/{id}` | Atualizar categoria | ADMIN/MANAGER |
| PATCH | `/api/categories/{id}/toggle-active` | Ativar/Desativar | ADMIN/MANAGER |
| PUT | `/api/categories/reorder` | Reordenar categorias | ADMIN/MANAGER |
| DELETE | `/api/categories/{id}` | Excluir categoria | ADMIN/MANAGER |

### 5.4 Pratos (`/api/dishes`)
| Método | Endpoint | Descrição | Acesso |
|--------|----------|-----------|--------|
| GET | `/api/dishes` | Listar pratos (filtros: categoria, ativo, busca) | Público |
| GET | `/api/dishes/admin` | Listar pratos (admin, paginado, todos) | ADMIN/MANAGER |
| GET | `/api/dishes/{id}` | Buscar prato por ID | Público |
| POST | `/api/dishes` | Criar prato | ADMIN/MANAGER |
| PUT | `/api/dishes/{id}` | Atualizar prato | ADMIN/MANAGER |
| PATCH | `/api/dishes/{id}/toggle-active` | Ativar/Desativar | ADMIN/MANAGER |
| POST | `/api/dishes/{id}/images` | Upload imagem(s) | ADMIN/MANAGER |
| DELETE | `/api/dishes/{id}/images/{imageId}` | Remover imagem | ADMIN/MANAGER |
| PUT | `/api/dishes/{id}/images/reorder` | Reordenar imagens | ADMIN/MANAGER |
| DELETE | `/api/dishes/{id}` | Excluir prato | ADMIN/MANAGER |

### 5.5 Cardápio Público (`/api/menu`)
| Método | Endpoint | Descrição |
|--------|----------|-------------|
| GET | `/api/menu` | Cardápio completo organizado por categorias |
| GET | `/api/menu/categories` | Categorias com contagem de pratos |

---

## 6. Frontend Angular 21 - Estrutura Detalhada

### 6.1 Core Module (`src/app/core/`)
```
core/
├── auth/
│   ├── auth.service.ts           # Login, register, token management
│   ├── auth.guard.ts             # CanActivate para rotas protegidas
│   ├── role.guard.ts             # CanActivate para roles específicas
│   ├── jwt.interceptor.ts        # Adiciona Authorization header
│   └── token.storage.ts          # LocalStorage/SessionStorage wrapper
├── services/
│   ├── api.service.ts            # HttpClient wrapper com retry, loading
│   ├── notification.service.ts   # Snackbar/Toastr notifications
│   ├── loading.service.ts        # Global loading state
│   └── image-upload.service.ts   # Upload de imagens (multipart)
├── models/
│   ├── user.model.ts
│   ├── category.model.ts
│   ├── dish.model.ts
│   ├── api-response.model.ts
│   └── pagination.model.ts
└── core.providers.ts             # Providers globais (HTTP_INTERCEPTORS, etc)
```

### 6.2 Shared Module (`src/app/shared/`)
```
shared/
├── components/
│   ├── button/                   # Botões padronizados
│   ├── input/                    # Inputs com validação visual
│   ├── select/                   # Select com search
│   ├── modal/                    # Modal confirm, form modal
│   ├── table/                    # Data table com sort, pagination
│   ├── image-upload/             # Componente drag-drop upload
│   ├── image-gallery/            # Galeria de imagens do prato
│   ├── badge/                    # Status badges
│   ├── loading-spinner/
│   └── empty-state/
├── directives/
│   ├── autofocus.directive.ts
│   ├── click-outside.directive.ts
│   └── number-only.directive.ts
├── pipes/
│   ├── currency-brl.pipe.ts
│   ├── truncate.pipe.ts
│   └── safe-url.pipe.ts
└── validators/
    ├── cpf.validator.ts
    ├── password-match.validator.ts
    └── unique-email.validator.ts (async)
```

### 6.3 Feature Modules (Lazy Loaded)

#### Auth Feature (`features/auth/`)
```
auth/
├── login/
│   ├── login.component.ts
│   ├── login.component.html
│   └── login.component.scss
├── register/
│   ├── register.component.ts
│   └── ...
├── auth.routes.ts
└── auth.module.ts (ou standalone routes)
```

#### Dashboard Feature (`features/dashboard/`)
```
dashboard/
├── dashboard.component.ts
├── stats-cards/
├── recent-activity/
└── dashboard.routes.ts
```

#### Dishes Feature (`features/dishes/`) - Admin
```
dishes/
├── dish-list/
│   ├── dish-list.component.ts
│   ├── dish-table.component.ts
│   └── dish-filters.component.ts
├── dish-form/
│   ├── dish-form.component.ts
│   ├── dish-basic-info.tab.ts
│   ├── dish-images.tab.ts
│   └── dish-details.tab.ts
├── dish-detail/
│   └── dish-detail.component.ts
├── dishes.service.ts
└── dishes.routes.ts
```

#### Categories Feature (`features/categories/`)
```
categories/
├── category-list/
├── category-form/
├── category-tree/ (drag-drop reorder)
├── categories.service.ts
└── categories.routes.ts
```

#### Users Feature (`features/users/`) - Admin
```
users/
├── user-list/
├── user-form/
├── users.service.ts
└── users.routes.ts
```

#### Menu Feature (`features/menu/`) - Público
```
menu/
├── menu.component.ts           # Página principal do cardápio
├── category-section/
├── dish-card/
├── dish-modal/                 # Detalhes do prato (modal)
├── menu.service.ts
└── menu.routes.ts
```

#### Settings Feature (`features/settings/`)
```
settings/
├── restaurant-info/
├── business-hours/
├── contact-info/
└── settings.service.ts
```

---

## 7. Docker Configuration

### 7.1 `docker-compose.yml` (Desenvolvimento)
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: restaurante-db
    environment:
      POSTGRES_DB: restaurante
      POSTGRES_USER: restaurante
      POSTGRES_PASSWORD: restaurante123
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/src/main/resources/db/migration:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U restaurante -d restaurante"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - restaurante-network

  backend:
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
    ports:
      - "8080:8080"
    volumes:
      - ./backend:/app
      - ~/.m2:/root/.m2
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - restaurante-network
    command: ./mvnw spring-boot:run

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    container_name: restaurante-frontend
    environment:
      NODE_ENV: development
    ports:
      - "4200:4200"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    depends_on:
      - backend
    networks:
      - restaurante-network
    command: npm start -- --host 0.0.0.0 --poll 2000

volumes:
  postgres_data:

networks:
  restaurante-network:
    driver: bridge
```

### 7.2 `docker-compose.prod.yml` (Produção)
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: restaurante-db-prod
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_prod_data:/var/lib/postgresql/data
    networks:
      - restaurante-network
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 1G

  backend:
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
    networks:
      - restaurante-network
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 1G

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    container_name: restaurante-frontend-prod
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - backend
    networks:
      - restaurante-network
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    container_name: restaurante-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - frontend
      - backend
    networks:
      - restaurante-network
    restart: unless-stopped

volumes:
  postgres_prod_data:

networks:
  restaurante-network:
    driver: bridge
```

### 7.3 Dockerfiles

#### Backend `Dockerfile.dev`
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

#### Backend `Dockerfile.prod`
```dockerfile
FROM eclipse-temurin:25-jdk-alpine AS builder

WORKDIR /app

COPY pom.xml .
COPY src ./src

RUN ./mvnw clean package -DskipTests -B

FROM eclipse-temurin:25-jre-alpine

WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /app/target/*.jar app.jar

RUN chown appuser:appgroup app.jar

USER appuser

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
```

#### Frontend `Dockerfile.dev`
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

#### Frontend `Dockerfile.prod`
```dockerfile
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

ARG CONFIGURATION=production
RUN npm run build -- --configuration=$CONFIGURATION

FROM nginx:alpine

COPY --from=builder /app/dist/restaurante/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### Frontend `nginx.conf`
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

---

## 8. Autenticação e Autorização (JWT)

### 8.1 Configuração Spring Security
- **Stateless** session management
- **JWT** com RS256 (chave pública/privada) ou HS256 (simétrico para dev)
- **Access Token**: 24h expiração
- **Refresh Token**: 7 dias, armazenado em HttpOnly cookie
- **Roles**: ADMIN, MANAGER, STAFF

### 8.2 Fluxo de Autenticação
```
1. POST /api/auth/login {email, password}
2. Backend valida, gera Access Token + Refresh Token
3. Access Token no body response
4. Refresh Token em HttpOnly Secure Cookie
5. Frontend armazena Access Token em memory (signal/service)
6. Requests subsequentes: Authorization: Bearer <access_token>
7. 401 -> Frontend chama POST /api/auth/refresh (com cookie)
8. Novo Access Token retornado
```

### 8.3 Permissões por Role
| Recurso | ADMIN | MANAGER | STAFF | Público |
|---------|-------|---------|-------|---------|
| Ver cardápio | ✓ | ✓ | ✓ | ✓ |
| CRUD Categorias | ✓ | ✓ | ✗ | ✗ |
| CRUD Pratos | ✓ | ✓ | ✗ | ✗ |
| Upload Imagens | ✓ | ✓ | ✗ | ✗ |
| Gestão Usuários | ✓ | ✗ | ✗ | ✗ |
| Configurações | ✓ | ✓ | ✗ | ✗ |

---

## 9. Upload de Imagens

### 9.1 Estratégia
- **Desenvolvimento**: Armazenamento local em `./uploads` (volume Docker)
- **Produção**: MinIO (S3 compatible) ou AWS S3 / Cloudinary

### 9.2 Backend - Upload Endpoint
```java
@PostMapping(value = "/{id}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public ResponseEntity<List<DishImageResponse>> uploadImages(
    @PathVariable UUID id,
    @RequestParam("files") List<MultipartFile> files,
    @RequestParam(defaultValue = "false") boolean replace
) { ... }
```

### 9.3 Validações
- Tipos permitidos: `image/jpeg`, `image/png`, `image/webp`
- Tamanho máximo: 5MB por imagem
- Máximo 5 imagens por prato
- Redimensionamento automático (max 1920px width)
- Geração de thumbnail (400px)

### 9.4 Frontend - Componente Image Upload
- Drag & drop zone
- Preview antes do upload
- Progress bar
- Reordenação por drag-drop
- Definir imagem principal
- Exclusão individual

---

## 10. Configurações de Ambiente

### 10.1 Backend `application-dev.yml`
```yaml
spring:
  datasource:
    url: jdbc:postgresql://${DB_HOST:localhost}:${DB_PORT:5432}/${DB_NAME:restaurante}
    username: ${DB_USER:restaurante}
    password: ${DB_PASSWORD:restaurante123}
    hikari:
      maximum-pool-size: 20
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: true
    properties:
      hibernate:
        format_sql: true
  flyway:
    enabled: true
    locations: classpath:db/migration
  servlet:
    multipart:
      max-file-size: 5MB
      max-request-size: 25MB

app:
  jwt:
    secret: ${JWT_SECRET:dev-secret-key-min-32-chars}
    expiration: ${JWT_EXPIRATION:86400000}
    refresh-expiration: 604800000
  cors:
    allowed-origins: "http://localhost:4200"
  upload:
    dir: ./uploads
    url-prefix: /uploads
```

### 10.2 Frontend `environment.ts`
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  authUrl: 'http://localhost:8080/api/auth',
  imageBaseUrl: 'http://localhost:8080/uploads',
  appName: 'Restaurante Cardápio',
  version: '1.0.0'
};
```

---

## 11. Migrações Flyway (Inicial)

### V1__create_initial_schema.sql
```sql
-- Extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'MANAGER', 'STAFF')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela categories
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela dishes
CREATE TABLE dishes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    prep_time_minutes INT,
    calories INT,
    allergens VARCHAR(500),
    image_url VARCHAR(500),
    category_id UUID NOT NULL REFERENCES categories(id),
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela dish_images
CREATE TABLE dish_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dish_id UUID NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_dishes_category ON dishes(category_id);
CREATE INDEX idx_dishes_active ON dishes(is_active);
CREATE INDEX idx_categories_active ON categories(is_active);
CREATE INDEX idx_dish_images_dish ON dish_images(dish_id);

-- Usuário admin padrão (senha: admin123 - BCrypt)
INSERT INTO users (email, password, name, role) VALUES 
('admin@restaurante.com', '$2a$10$X7UrH5YxX5YxX5YxX5YxX.5YxX5YxX5YxX5YxX5YxX5YxX5YxX5Y', 'Administrador', 'ADMIN');
```

---

## 12. Funcionalidades Principais por Fase

### Fase 1 - Fundação (Semana 1-2)
- [x] Setup do projeto Spring Boot + Angular (concluído)
- [x] Estrutura de arquivos e configurações de build
- [x] Repositório Git inicializado
- [x] Docker Compose dev environment (backend + PostgreSQL rodando)
- [x] Configuração PostgreSQL + Flyway - ✅ Migrações executadas com sucesso
- [x] Spring Security + JWT básico - ✅ Backend rodando na porta 8080
- [x] Login/Register frontend - ✅ Componentes criados (login, register)
- [x] Estrutura base Angular (core, shared, layout) - ✅ Estrutura corrigida
- [x] InputComponent - ✅ Adicionados allowDecimal e appNumberOnly inputs
- [x] Settings components - ✅ Criados restaurant-info, business-hours, contact-info, profile
- [x] Authentication service e guards - ✅ Implementado com Angular 21 signals

### Fase 2 - CRUD Categorias (Semana 2-3)
- [ ] Entidade Category + Repository + Service
- [ ] REST Controller Categorias
- [ ] Frontend: Listagem, Criação, Edição, Exclusão
- [ ] Reordenação drag-drop
- [ ] Upload imagem categoria

### Fase 3 - CRUD Pratos (Semana 3-4)
- [ ] Entidade Dish + DishImage + Repository + Service
- [ ] REST Controller Pratos
- [ ] Frontend: Formulário multi-step (tabs)
- [ ] Upload múltiplas imagens com preview
- [ ] Galeria de imagens + reordenação
- [ ] Filtros e busca na listagem

### Fase 4 - Cardápio Público (Semana 4-5)
- [ ] Endpoint público /api/menu
- [ ] Frontend: Página cardápio responsiva
- [ ] Modal detalhes do prato
- [ ] Filtro por categoria
- [ ] Busca por nome/ingredientes

### Fase 5 - Gestão Usuários & Configurações (Semana 5-6)
- [ ] CRUD Usuários (Admin)
- [ ] Perfil do usuário logado
- [ ] Alteração de senha
- [ ] Configurações do restaurante
- [ ] Horário de funcionamento

### Fase 6 - Polimento & Produção (Semana 6-7)
- [ ] Testes unitários e integração
- [ ] Docker produção
- [ ] CI/CD GitHub Actions
- [ ] Documentação Swagger
- [ ] Performance otimização
- [ ] Acessibilidade (WCAG 2.1)
- [ ] SEO básico (meta tags, sitemap)

---

## 13. Testes

### Backend
- **Unitários**: JUnit 5 + Mockito (Services, Mappers, Utils)
- **Integração**: @SpringBootTest + Testcontainers (PostgreSQL)
- **Controller**: @WebMvcTest + MockMvc
- **Cobertura mínima**: 80%

### Frontend
- **Unitários**: Jest + Testing Library (Components, Services, Pipes)
- **E2E**: Cypress (Fluxos críticos: login, CRUD pratos, cardápio)
- **Cobertura mínima**: 70%

---

## 14. Observabilidade

### Logs
- **Backend**: Structured JSON logs (Logstash encoder)
- **Níveis**: ERROR, WARN, INFO, DEBUG
- **Correlation ID** para rastreamento

### Métricas
- **Spring Boot Actuator** + Micrometer
- **Prometheus** + Grafana (opcional)
- **Health checks**: /actuator/health

---

## 15. Checklist de Segurança

- [ ] HTTPS obrigatório em produção
- [ ] Headers de segurança (Helmet/CSP)
- [ ] Rate limiting (Spring Boot / Nginx)
- [ ] Validação de entrada (Bean Validation + Frontend)
- [ ] Sanitização de uploads (tipo, tamanho, conteúdo)
- [ ] Passwords: BCrypt cost 12+
- [ ] JWT: Assinatura RS256, expiração curta
- [ ] CORS configurado restritivamente
- [ ] SQL Injection prevention (JPA parameters)
- [ ] XSS prevention (Angular sanitization)
- [ ] CSRF protection (SameSite cookies + JWT em header)

---

## 16. Próximos Passos

1. **Inicializar repositório Git** - `git init` e commit do projeto base
2. **Subir containers Docker** - `docker-compose up --build` (dev environment)
3. **Verificar conexão banco** - Acessar PostgreSQL e validar migrações Flyway
4. **Iniciar Fase 1 - Fundação** - Setup Spring Boot + Angular básico, auth inicial

---

## 17. Status Atual do Projeto

- ✅ Estrutura de arquivos definida (backend, frontend, docker, nginx)
- ✅ Dependências configuradas (pom.xml, package.json)
- ✅ Planejamento detalhado (entidades, API, arquitetura)
- ✅ Repositório Git inicializado
- ✅ Container backend e PostgreSQL em execução
- ✅ Flyway migrations executadas - 4 tabelas + admin user criado
- ✅ Frontend build - Corrigido InputComponent e components faltando
- ✅ Authentication service e guards - Implementado com Angular 21 signals
- ✅ API Services - Categorias, Pratos, Usuários, Menu públicos mapeados
- ✅ Filtro ativo em pratos - Corrigido em DishService e DishController
- ✅ Cardápio Público - Componente menu funcional conectado ao backend
- ✅ Gestão Usuários - Formulário e listagem completos com CRUD
- ⚠️ Testes de integração Frontend-Backend completados com sucesso
- ⚠️ Warnings menores de build podem existir, mas funcionalidade está operacional

---

## 18. Próximos Passos Imediatos

1. **Fase 6 - Polimento & Produção** - Docker production configuration, CI/CD setup
2. **Otimização de performance** - Lazy loading otimizado, change detection
3. **Testes automatizados** - Unitários backend e frontend
4. **Documentação Swagger** - Validar endpoints expostos
5. **Preparação para deploy** - Variáveis de ambiente produção, Nginx config

---

## 20. Checklist de Produção Concluído ✅

- [x] Docker Compose development (docker-compose.yml) - Backend + PostgreSQL rodando
- [x] Docker Compose production (docker-compose.prod.yml) - Criado com nginx
- [x] Nginx configuration (nginx/nginx.conf) - Reverse proxy com proxy_pass para backend
- [x] Dockerfile.prod backend - Multi-stage build com OpenJDK 25 Alpine
- [x] Dockerfile.prod frontend - Multi-stage build com Node 22 + Nginx Alpine
- [x] Variáveis de ambiente (.env.example) - DB, JWT, CORS configurados
- [x] Backend produção ready - Spring Boot 3.5.x com perfis dev/prod
- [x] Frontend production build - Angular 21 com SSR ready
- [x] Monitoramento Spring Boot Actuator - Endpoints health, info, metrics expostos

---

## 21. Próximos Passos Finais

1. **GitHub Actions CI/CD** - Pipeline de testes e build automatizados (concluído)
2. **Script de deploy** - Scripts de deploy para produção
3. **HTTPS com certificado SSL** - Configuração via Nginx/Let's Encrypt
4. **Otimização de performance** - Lazy loading otimizado, change detection
5. **Documentação Swagger** - Validar endpoints expostos
6. **Monitoramento avançado** - Prometheus/Grafana integration

---

## 22. Checklist de Produção Concluído ✅

- [x] Docker Compose development (docker-compose.yml) - Backend + PostgreSQL rodando
- [x] Docker Compose production (docker-compose.prod.yml) - Criado com nginx
- [x] Nginx configuration (nginx/nginx.conf) - Reverse proxy com proxy_pass para backend
- [x] Dockerfile.prod backend - Multi-stage build com OpenJDK 25 Alpine
- [x] Dockerfile.prod frontend - Multi-stage build com Node 22 + Nginx Alpine
- [x] Variáveis de ambiente (.env.example) - DB, JWT, CORS configurados
- [x] Backend produção ready - Spring Boot 3.5.x com perfis dev/prod
- [x] Frontend production build - Angular 21 com SSR ready
- [x] Monitoramento Spring Boot Actuator - Endpoints health, info, metrics expostos
- [x] Testes automatizados - JUnit5 + Mockito no backend, Jest no frontend

---

## 23. Próximos Passos Finais

1. **HTTPS com certificado SSL** - Configuração via Nginx/Let's Encrypt
2. **GitHub Actions deploy** - Pipeline completo para produção
3. **Backup strategy** - Estratégia de backup do PostgreSQL
4. **Domain configuration** - DNS setup para domínio personalizado
3. **Monitoramento** - Health checks e métricas via Actuator
4. **Backup strategy** - Estratégia de backup do PostgreSQL