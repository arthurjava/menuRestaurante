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
│   ├── Dockerfile.dev
│   ├── Dockerfile.prod
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/              # Services, Guards, Interceptors
│   │   │   │   ├── auth/          # AuthService, JWT Interceptor, Guards
│   │   │   │   ├── services/      # ApiService, NotificationService, LoadingService, ImageUploadService
│   │   │   │   └── models/        # Interfaces/Types compartilhados
│   │   │   ├── shared/            # Componentes/diretivas/pipes reutilizáveis
│   │   │   │   ├── components/    # Button, Input, Select, Modal, Table, ImageUpload, Badge, Card, DataTable, EmptyState, StatCard
│   │   │   │   ├── directives/    # Autofocus, ClickOutside, NumberOnly
│   │   │   │   ├── pipes/         # CurrencyBRL, Truncate, SafeUrl
│   │   │   │   └── validators/    # CPF, PasswordMatch, UniqueEmail (async)
│   │   │   ├── features/          # Lazy-loaded feature modules
│   │   │   │   ├── auth/          # Login, Register
│   │   │   │   ├── dashboard/     # Dashboard admin
│   │   │   │   ├── dishes/        # CRUD Pratos (admin)
│   │   │   │   ├── categories/    # CRUD Categorias (admin)
│   │   │   │   ├── users/         # Gestão Usuários (admin)
│   │   │   │   ├── menu/          # Cardápio público
│   │   │   │   └── settings/      # Configurações restaurante
│   │   │   ├── layout/            # Header, Sidebar, Footer
│   │   │   ├── app.routes.ts      # Rotas principais
│   │   │   ├── app.config.ts      # Providers globais
│   │   │   └── app.component.ts
│   │   ├── assets/                # Imagens, ícones
│   │   ├── styles/                # Design Tokens (tokens.scss), Tailwind, global styles
│   │   ├── environments/          # environment.ts, environment.prod.ts
│   │   ├── main.ts
│   │   ├── index.html
│   │   └── styles.scss
│   ├── Dockerfile.dev
│   ├── Dockerfile.prod
│   ├── nginx.conf
│   ├── package.json
│   ├── angular.json
│   └── tailwind.config.js
└── docs/
    ├── api-docs.md
    └── database-schema.md
```

---

## 4. Design System (Concluído - Set/2026)

### 4.1 Arquitetura de Tokens
```
Primitive Tokens (Valores brutos)
    ↓
Semantic Tokens (Alias com significado)
    ↓
Component Tokens (Tokens específicos de componentes)
    ↓
Shared Components
    ↓
Features
    ↓
Pages
```

### 4.2 Tokens Implementados
**Cores (Palette Semântica):**
- Brand: Primary, Secondary, Accent
- Surface: Primary, Secondary, Tertiary, Hover, Active, Disabled, Inverse
- Content: Primary, Secondary, Tertiary, Inverse, Disabled, Link
- Border: Subtle, Default, Strong, Focus, Error, Success, Warning
- State: Success, Warning, Danger, Info (cada um com base, hover, subtle, border, on)

**Tipografia:**
- Display (3rem), H1 (2.25rem), H2 (1.875rem), H3 (1.5rem), H4 (1.25rem)
- Body-lg (1.125rem), Body (1rem), Body-sm (0.875rem), Label (0.875rem/500), Caption (0.75rem)

**Espaçamento:** 0, 1(4px), 2(8px), 3(12px), 4(16px), 5(20px), 6(24px), 7(28px), 8(32px), 10(40px), 12(48px), 16(64px), 20(80px), 24(96px)

**Border Radius:** none, xs(2px), sm(4px), md(6px), lg(8px), xl(12px), 2xl(16px), 3xl(24px), full

**Elevação/Sombras:** none, xs, sm, md, lg, xl, 2xl, inner, card, card-hover, dropdown, modal, tooltip, chip, chip-hover, lg-custom

**Transições:** fast(100ms), normal(150ms), slow(200ms), slower(300ms)

**Z-Index:** hide(-1), base(0), dropdown(100), sticky(200), fixed(300), drawer(400), modal-backdrop(500), modal(600), popover(700), tooltip(800), toast(900), max(9999)

**Breakpoints:** sm(640px), md(768px), lg(1024px), xl(1280px), 2xl(1536px)

### 4.3 Componentes Shared Padronizados
| Componente | Variants | Sizes | Estados |
|------------|----------|-------|---------|
| **Button** | primary, secondary, tertiary, danger, warning, info, outline, ghost | sm, md, lg, icon | hover, active, focus, disabled, loading |
| **Input** | text, email, password, number, tel, url, search | sm, md, lg | error, success, disabled, readonly, focus |
| **Badge** | primary, success, warning, danger, info, neutral, secondary, gray | sm, md, lg | dot, count, icon |
| **Card** | default, outlined, elevated, filled | - | hoverable, padded |
| **DataTable** | selectable, sortable, paginatable, striped, hoverable | - | loading, empty state, row selection |
| **EmptyState** | default, search, filter, error, offline, success | sm, md, lg | action button |
| **StatCard** | default, primary, success, warning, danger, info | - | trend up/down/neutral |
| **Modal** | base, form, confirm, reorder | sm, md, lg, xl, full | backdrop, animation, focus trap |
| **ImageUpload** | drag-drop, preview, reorder, primary, progress | - | validation, error handling |

### 4.4 Integração Angular Material + Tailwind
- **Tailwind**: Layout, spacing, colors, responsive, composição
- **Angular Material**: Componentes complexos (Table, Dialog, Select, Datepicker, Autocomplete)
- **CSS Custom Properties**: Bridge entre tokens SCSS e componentes via `::ng-deep`

---

## 5. Modelo de Dados (Entidades JPA)

### 5.1 Diagrama Entidade-Relacionamento

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

### 5.2 Entidades Detalhadas

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

## 6. API REST Endpoints

### 6.1 Autenticação (`/api/auth`)
| Método | Endpoint | Descrição | Acesso |
|--------|----------|-----------|--------|
| POST | `/api/auth/login` | Login (retorna JWT) | Público |
| POST | `/api/auth/register` | Registro de usuário | Público |
| POST | `/api/auth/refresh` | Refresh token | Autenticado |
| POST | `/api/auth/logout` | Logout (blacklist token) | Autenticado |
| GET | `/api/auth/me` | Dados do usuário logado | Autenticado |
| PUT | `/api/auth/me` | Atualizar perfil | Autenticado |
| PUT | `/api/auth/me/password` | Alterar senha | Autenticado |

### 6.2 Usuários (`/api/users`) - ADMIN/MANAGER
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/users` | Listar usuários (paginado, filtros) |
| GET | `/api/users/{id}` | Buscar usuário por ID |
| POST | `/api/users` | Criar usuário |
| PUT | `/api/users/{id}` | Atualizar usuário |
| PATCH | `/api/users/{id}/toggle-active` | Ativar/Desativar |
| DELETE | `/api/users/{id}` | Excluir usuário |

### 6.3 Categorias (`/api/categories`)
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

### 6.4 Pratos (`/api/dishes`)
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

### 6.5 Cardápio Público (`/api/menu`)
| Método | Endpoint | Descrição |
|--------|----------|-------------|
| GET | `/api/menu` | Cardápio completo organizado por categorias |
| GET | `/api/menu/categories` | Categorias com contagem de pratos |

---

## 7. Frontend Angular 21 - Estrutura Detalhada

### 7.1 Core Module (`src/app/core/`)
```
core/
├── auth/
│   ├── auth.service.ts           # Login, register, token management
│   ├── auth.guard.ts             # CanActivate para rotas protegidas
│   ├── role.guard.ts             # CanActivate para roles específicas
│   ├── jwt.interceptor.ts        # Adiciona Authorization header
│   └── token.storage.ts          # Memory storage (não localStorage)
├── services/
│   ├── api.service.ts            # HttpClient wrapper com retry, loading global
│   ├── notification.service.ts   # Snackbar/Toast notifications
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

### 7.2 Shared Module (`src/app/shared/`)
```
shared/
├── components/
│   ├── button/                   # Botões padronizados (Design System)
│   ├── input/                    # Inputs com validação visual
│   ├── select/                   # Select com search
│   ├── modal/                    # Modal base, form modal, confirm, reorder
│   ├── table/                    # Data table com sort, pagination, selection
│   ├── image-upload/             # Componente drag-drop upload
│   ├── image-gallery/            # Galeria de imagens do prato
│   ├── badge/                    # Status badges
│   ├── card/                     # Card component (Design System)
│   ├── data-display/             # DataTable, EmptyState, StatCard
│   ├── loading-spinner/
│   └── forms/                    # FormSection, ImageUploadField
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

### 7.3 Feature Modules (Lazy Loaded)

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
└── auth.module.ts (standalone routes)
```

#### Dashboard Feature (`features/dashboard/`)
```
dashboard/
├── dashboard.component.ts        # Stats cards, quick actions, recent activity
├── dashboard.routes.ts
```

#### Dishes Feature (`features/dishes/`) - Admin
```
dishes/
├── dishes-list/
│   ├── dishes-list.component.ts
│   └── filters component
├── dish-form/
│   ├── dish-form.component.ts    # Multi-step: basic info, images, details
│   └── image upload integration
├── dishes.service.ts
└── dishes.routes.ts
```

#### Categories Feature (`features/categories/`)
```
categories/
├── categories-list/
├── category-form/
├── category-reorder/ (drag-drop)
├── categories.service.ts
└── categories.routes.ts
```

#### Users Feature (`features/users/`) - Admin
```
users/
├── users-list/
├── user-form/
├── users.service.ts
└── users.routes.ts
```

#### Menu Feature (`features/menu/`) - Público
```
menu/
├── menu.component.ts             # Página principal do cardápio
├── category-section/
├── dish-card/
├── dish-modal/                   # Detalhes do prato (modal)
├── image-gallery/
├── menu.service.ts
└── menu.routes.ts
```

#### Settings Feature (`features/settings/`)
```
settings/
├── restaurant-info/              # Nome, slogan, descrição, logo, cover
├── business-hours/               # Horários de funcionamento (array dinâmico)
├── contact-info/                 # Telefone, email, endereço, redes sociais
├── profile/                      # Avatar, nome, email, alterar senha
├── settings.service.ts
└── settings.routes.ts
```

---

## 8. Docker Configuration

### 8.1 `docker-compose.yml` (Desenvolvimento)
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

### 8.2 `docker-compose.prod.yml` (Produção)
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

### 8.3 Dockerfiles

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

## 9. Autenticação e Autorização (JWT)

### 9.1 Configuração Spring Security
- **Stateless** session management
- **JWT** com HS256 (simétrico para dev) / RS256 (produção)
- **Access Token**: 24h expiração
- **Refresh Token**: 7 dias, armazenado em HttpOnly cookie
- **Roles**: ADMIN, MANAGER, STAFF

### 9.2 Fluxo de Autenticação
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

### 9.3 Permissões por Role
| Recurso | ADMIN | MANAGER | STAFF | Público |
|---------|-------|---------|-------|---------|
| Ver cardápio | ✓ | ✓ | ✓ | ✓ |
| CRUD Categorias | ✓ | ✓ | ✗ | ✗ |
| CRUD Pratos | ✓ | ✓ | ✗ | ✗ |
| Upload Imagens | ✓ | ✓ | ✗ | ✗ |
| Gestão Usuários | ✓ | ✗ | ✗ | ✗ |
| Configurações | ✓ | ✓ | ✗ | ✗ |

---

## 10. Upload de Imagens

### 10.1 Estratégia
- **Desenvolvimento**: Armazenamento local em `./uploads` (volume Docker)
- **Produção**: MinIO (S3 compatible) ou AWS S3 / Cloudinary

### 10.2 Backend - Upload Endpoint
```java
@PostMapping(value = "/{id}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public ResponseEntity<List<DishImageResponse>> uploadImages(
    @PathVariable UUID id,
    @RequestParam("files") List<MultipartFile> files,
    @RequestParam(defaultValue = "false") boolean replace
) { ... }
```

### 10.3 Validações
- Tipos permitidos: `image/jpeg`, `image/png`, `image/webp`
- Tamanho máximo: 5MB por imagem
- Máximo 5 imagens por prato
- Redimensionamento automático (max 1920px width)
- Geração de thumbnail (400px)

### 10.4 Frontend - Componente Image Upload
- Drag & drop zone
- Preview antes do upload
- Progress bar
- Reordenação por drag-drop
- Definir imagem principal
- Exclusão individual

---

## 11. Configurações de Ambiente

### 11.1 Backend `application-dev.yml`
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

### 11.2 Frontend `environment.ts`
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

## 12. Migrações Flyway (Inicial)

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

## 13. Configuração MCPs (Model Context Protocol)

### 13.1 MCP Servers Configurados

| Server | Propósito | Configuração |
|--------|-----------|--------------|
| **context7** | Documentação atualizada de bibliotecas/frameworks | Auto-configurado via `.opencode/mcp.json` |
| **github** | Operações GitHub (issues, PRs, repos, code search) | Token via `GH_TOKEN` env var |
| **browseros** / **browseros-neo** | Navegador dedicado para agentes (live logins, cookies) | BrowserOS neo desktop app |
| **postgresql** | Query direta no banco PostgreSQL | Conexão via docker-compose network |

### 13.2 Uso dos MCPs

#### Context7
```bash
# Resolver library ID
resolve-library-id(query="Spring Boot 3.5", libraryName="Spring Boot")

# Consultar documentação
query-docs(libraryId="/spring-projects/spring-boot", query="SecurityFilterChain permitAll configuration")
```

#### GitHub
```bash
# Listar issues
list_issues(owner="arthurjava", repo="menuRestaurante", state="open")

# Criar PR
create_pull_request(owner="arthurjava", repo="menuRestaurante", title="feat: ...", head="feature-branch", base="main")

# Buscar código
search_code(query="SecurityConfig", repo="arthurjava/menuRestaurante", language=["Java"])
```

#### BrowserOS neo
```bash
# Nova aba
tabs(action="new", url="http://localhost:4200")

# Snapshot + act loop
snapshot(page=0, mode="interactive")
act(page=0, kind="click", ref="e12")
```

#### PostgreSQL
```bash
# Query direta
postgresql_query(sql="SELECT * FROM categories WHERE is_active = true")
```

### 13.3 Configuração Local (`.opencode/mcp.json`)
```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@context7/mcp-server"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@github/mcp-server"],
      "env": { "GH_TOKEN": "${GH_TOKEN}" }
    },
    "postgresql": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": { "DATABASE_URL": "postgresql://restaurante:restaurante123@localhost:5432/restaurante" }
    }
  }
}
```

---

## 14. Agents e Sub-Agents (OpenCode)

### 14.1 Agent Principal (General Purpose)
**Arquivo**: `.opencode/agent/general.md`
- Agente de propósito geral para tarefas complexas multi-step
- Acesso a todas as ferramentas (bash, read, write, edit, glob, grep, task, webfetch)
- Usado para: investigação, planejamento, execução de tarefas amplas

### 14.2 Sub-Agents Especializados

| Sub-Agent | Arquivo | Especialidade | Quando Usar |
|-----------|---------|---------------|-------------|
| **java-senior** | `.opencode/agent/java-senior.md` | Java 25, Spring Boot 3.5, arquitetura backend | Regras de negócio, services, repositories, performance |
| **spring-boot** | `.opencode/agent/spring-boot.md` | Spring Boot 3.5.x, configuração, starters | Setup projeto, profiles, actuator, health checks |
| **spring-security** | `.opencode/agent/spring-security.md` | Spring Security 6, JWT, OAuth2, RBAC | Auth, guards, filters, CORS, CSRF, 401/403 debug |
| **jwt** | `.opencode/agent/jwt.md` | JWT (jjwt 0.12.x), tokens, refresh, claims | Geração/validação token, refresh flow, assinatura RS256/HS256 |
| **jpa-hibernate** | `.opencode/agent/jpa-hibernate.md` | JPA/Hibernate 6.6, entidades, queries, N+1 | Entities, repositories, @Query, EntityGraph, migrations |
| **postgresql** | `.opencode/agent/postgresql.md` | PostgreSQL 16, índices, particionamento, tuning | Schema, migrações Flyway, query optimization, backup |
| **angular** | `.opencode/agent/angular.md` | Angular 21, signals, standalone, Material 21 | Components, services, guards, interceptors, forms |
| **frontend-reviewer** | `.opencode/agent/frontend-reviewer.md` | Code review Angular, a11y, performance | PR review, best practices, bundle analysis |
| **backend-reviewer** | `.opencode/agent/backend-reviewer.md` | Code review Java/Spring, segurança, arquitetura | PR review, security audit, SOLID, clean code |
| **security-reviewer** | `.opencode/agent/security-reviewer.md` | AppSec, OWASP, threat modeling, pentest | Auditoria segurança, secrets scan, dependency check |
| **architecture-reviewer** | `.opencode/agent/architecture-reviewer.md` | Arquitetura de software, DDD, clean architecture | Decisões arquiteturais, bounded contexts, coupling |
| **debugger** | `.opencode/agent/debugger.md` | Root cause analysis, stack traces, logs | Bug investigation, reprodução, causa raiz |
| **testing** | `.opencode/agent/testing.md` | JUnit5, Mockito, Testcontainers, Cypress, Jest | Test strategy, unit/integration/e2e, coverage |
| **docker** | `.opencode/agent/docker.md` | Docker, Docker Compose, multi-stage, networks | Containerização, volumes, healthchecks, prod/dev |
| **rest-api** | `.opencode/agent/rest-api.md` | REST design, OpenAPI, versioning, pagination | API contracts, DTOs, error responses, HATEOAS |

### 14.3 Como Invocar Sub-Agents

```bash
# Via CLI opencode
opencode run --agent java-senior "Implementar service de pedidos com transações"

# Via tool task (programático)
task(
  subagent_type="java-senior",
  description="Implementar OrderService",
  prompt="Criar OrderService com @Transactional, validação de estoque, evento de domínio"
)
```

### 14.4 Regras de Uso dos Agents

1. **Sempre use sub-agent especializado** quando a tarefa encaixar na especialidade
2. **General agent** para: orquestração, investigação inicial, tarefas não cobertas
3. **Nunca invoque múltiplos sub-agents** para mesma tarefa (conflito de contexto)
4. **Passe contexto completo** no prompt: arquivos relevantes, erro, objetivo, constraints
5. **Valide resultado** do sub-agent antes de prosseguir (build, testes, lint)

### 14.5 Skills Disponíveis

| Skill | Arquivo | Descrição |
|-------|---------|-----------|
| **browseros-neo** | `.opencode/skill/browseros-neo/SKILL.md` | Navegador dedicado para tarefas web |
| **context7-mcp** | `.opencode/skill/context7-mcp/SKILL.md` | Documentação atualizada de libs/frameworks |
| **customize-opencode** | Built-in | Configuração do próprio opencode (agents, skills, mcp) |

### 14.6 Learning Agent
**Arquivo**: `.agents/learning.md`
- Registra conhecimento arquitetural, padrões recorrentes, troubleshooting
- Salvo em `.agents/knowledge/` (sem secrets/tokens)
- Baseado em evidências, não em suposições

---

## 15. Funcionalidades Principais por Fase

### Fase 1 - Fundação (Concluída)
- [x] Setup do projeto Spring Boot + Angular
- [x] Estrutura de arquivos e configurações de build
- [x] Repositório Git inicializado
- [x] Docker Compose dev environment (backend + PostgreSQL rodando)
- [x] Configuração PostgreSQL + Flyway - ✅ Migrações executadas com sucesso
- [x] Spring Security + JWT básico - ✅ Backend rodando na porta 8080
- [x] Login/Register frontend - ✅ Componentes criados (login, register)
- [x] Estrutura base Angular (core, shared, layout)
- [x] Authentication service e guards - ✅ Implementado com Angular 21 signals

### Fase 2 - CRUD Categorias (Concluída)
- [x] Entidade Category + Repository + Service
- [x] REST Controller Categorias
- [x] Frontend: Listagem, Criação, Edição, Exclusão
- [x] Reordenação drag-drop
- [x] Upload imagem categoria

### Fase 3 - CRUD Pratos (Concluída)
- [x] Entidade Dish + DishImage + Repository + Service
- [x] REST Controller Pratos
- [x] Frontend: Formulário multi-step (tabs)
- [x] Upload múltiplas imagens com preview
- [x] Galeria de imagens + reordenação
- [x] Filtros e busca na listagem

### Fase 4 - Cardápio Público (Concluída)
- [x] Endpoint público /api/menu
- [x] Frontend: Página cardápio responsiva
- [x] Modal detalhes do prato
- [x] Filtro por categoria
- [x] Busca por nome/ingredientes

### Fase 5 - Gestão Usuários & Configurações (Concluída)
- [x] CRUD Usuários (Admin)
- [x] Perfil do usuário logado
- [x] Alteração de senha
- [x] Configurações do restaurante (info, horários, contato)
- [x] Horário de funcionamento (array dinâmico)

### Fase 6 - Design System & Polimento (Concluída - Set/2026)
- [x] **Design Tokens centralizados** - tokens.scss + tailwind.config.js + CSS custom properties
- [x] **Paleta semântica** - Zero hardcoded colors
- [x] **Componentes Shared padronizados** - Button, Input, Badge, Card, DataTable, EmptyState, StatCard, Modal, ImageUpload
- [x] **Layout global refatorado** - AdminSidebar, AdminHeader com tokens semânticos
- [x] **Features refatoradas** - Dashboard, Dishes, Categories, Users, Settings, Login, Register, Menu (Público)
- [x] **Acessibilidade** - Focus visible, ARIA, contraste WCAG AA, navegação teclado
- [x] **Responsividade** - Mobile-first, breakpoints consistentes
- [x] **Build validado** - `npm run build` PASS

---

## 16. Testes

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

## 17. Observabilidade

### Logs
- **Backend**: Structured JSON logs (Logstash encoder)
- **Níveis**: ERROR, WARN, INFO, DEBUG
- **Correlation ID** para rastreamento

### Métricas
- **Spring Boot Actuator** + Micrometer
- **Prometheus** + Grafana (opcional)
- **Health checks**: /actuator/health

---

## 18. Checklist de Segurança

- [x] HTTPS obrigatório em produção (Nginx + Let's Encrypt)
- [x] Headers de segurança (CSP, HSTS, X-Frame-Options)
- [x] Rate limiting (Spring Boot / Nginx)
- [x] Validação de entrada (Bean Validation + Frontend)
- [x] Sanitização de uploads (tipo, tamanho, conteúdo)
- [x] Passwords: BCrypt cost 12+
- [x] JWT: Assinatura HS256 (dev) / RS256 (prod), expiração curta
- [x] CORS configurado restritivamente
- [x] SQL Injection prevention (JPA parameters)
- [x] XSS prevention (Angular sanitization)
- [x] CSRF protection (SameSite cookies + JWT em header)

---

## 19. Status Atual do Projeto (Set/2026)

| Componente | Status | Observações |
|------------|--------|-------------|
| **Backend** | ✅ COMPLETO | Spring Boot 3.5.x, Security, JWT, Flyway, CRUDs, Docker |
| **Frontend** | ✅ COMPLETO | Angular 21, Design System, todas features, Build PASS |
| **Design System** | ✅ COMPLETO | Tokens, componentes, layout, features refatoradas |
| **Docker Dev** | ✅ COMPLETO | docker-compose.yml funcional |
| **Docker Prod** | ✅ COMPLETO | docker-compose.prod.yml + Nginx |
| **PostgreSQL** | ✅ COMPLETO | Flyway migrations, schema completo |
| **MCPs** | ✅ CONFIGURADO | context7, github, browseros, postgresql |
| **Agents/Sub-Agents** | ✅ CONFIGURADO | 15 sub-agents especializados + general |
| **Git Repository** | ✅ PUSHED | https://github.com/arthurjava/menuRestaurante.git |

---

## 20. Próximos Passos (Opcional - Pós-Entrega)

1. **CI/CD GitHub Actions** - Pipeline de testes e build automatizados
2. **Script de deploy** - Scripts de deploy para produção
3. **Monitoramento avançado** - Prometheus/Grafana integration
4. **Backup strategy** - Estratégia de backup do PostgreSQL
5. **Documentação Swagger** - Validar endpoints expostos em produção
6. **Testes E2E Cypress** - Fluxos críticos automatizados

---

## 21. Resumo das Principais Conquistas

### Backend (Java 25 / Spring Boot 3.5.x)
- Arquitetura limpa: Controller → Service → Repository → Entity
- Spring Security 6 + JWT (HS256 dev / RS256 prod)
- Flyway migrations com schema completo (4 tabelas + admin user)
- Global Exception Handler com respostas padronizadas
- MapStruct para DTO mapping
- Validação Bean Validation em todos os endpoints

### Frontend (Angular 21 / TypeScript 5.9)
- **Design System completo** com tokens centralizados
- **Standalone Components + Signals** em todo o projeto
- **OnPush Change Detection** para performance
- **Lazy Loading** em todas as features
- **Angular Material 21 + Tailwind CSS 3.4** integrados via tokens
- **Reactive Forms** com validação robusta
- **Componentes Shared reutilizáveis** (Button, Input, Modal, Table, etc.)

### DevOps & Infra
- **Docker multi-stage builds** (dev + prod)
- **Docker Compose** para dev (hot reload) e prod (nginx reverse proxy)
- **PostgreSQL 16** com health checks
- **Nginx** configurado para SPA + API proxy
- **Variáveis de ambiente** separadas por ambiente

### Qualidade & Segurança
- **Zero hardcoded colors/spacing** - tudo via Design Tokens
- **Acessibilidade WCAG 2.1 AA** - focus, ARIA, contraste, teclado
- **JWT em memory** (não localStorage) + HttpOnly refresh cookie
- **CORS, CSRF, Rate Limiting** configurados
- **Headers de segurança** no Nginx

---

*Documento atualizado em: 23/09/2026*  
*Versão: 2.0 - Pós Redesign Completo do Design System*  
*Repositório: https://github.com/arthurjava/menuRestaurante.git*