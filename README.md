# Restaurante Cardápio - Sistema de Gerenciamento

Sistema completo de gerenciamento de cardápio para restaurantes com frontend Angular 17 e backend Spring Boot 3.

## 🚀 Tecnologias

### Backend
- **Java 21** + **Spring Boot 3.3**
- **Spring Data JPA** + **Hibernate**
- **Spring Security** + **JWT** (autenticação stateless)
- **PostgreSQL 16** + **Flyway** (migrações)
- **MapStruct** (DTO mapping)
- **Lombok** (boilerplate reduction)
- **Springdoc OpenAPI** (Swagger UI)
- **Maven** (build)

### Frontend
- **Angular 17** (standalone components, signals)
- **TypeScript 5.3** + **RxJS 7.8**
- **Angular Material 17** + **Tailwind CSS 3.4**
- **Reactive Forms** + **Validators customizados**
- **Lazy Loading** por feature modules

### Infraestrutura
- **Docker** + **Docker Compose** (dev/prod)
- **Nginx** (reverse proxy produção)
- **PostgreSQL** (banco de dados)

## 📋 Funcionalidades

### Público (Cardápio)
- Visualização de cardápio organizado por categorias
- Detalhes de pratos com imagens, alergênicos, tempo de preparo
- Design responsivo mobile-first

### Administrativo (Painel)
- **Autenticação JWT** com roles (ADMIN, MANAGER, STAFF)
- **CRUD Categorias** com reordenação drag-drop
- **CRUD Pratos** com upload múltiplo de imagens
- **Galeria de imagens** com definição de imagem principal
- **CRUD Usuários** (apenas ADMIN)
- **Dashboard** com estatísticas
- **Configurações** do restaurante

## 🏗️ Estrutura do Projeto

```
restaurante/
├── docker-compose.yml          # Desenvolvimento
├── docker-compose.prod.yml     # Produção
├── backend/
│   ├── src/main/java/com/restaurante/
│   │   ├── config/             # Security, OpenAPI, WebMvc
│   │   ├── controller/         # REST Controllers
│   │   ├── dto/                # Request/Response DTOs
│   │   ├── entity/             # JPA Entities
│   │   ├── exception/          # Global Exception Handler
│   │   ├── mapper/             # MapStruct Mappers
│   │   ├── repository/         # Spring Data Repositories
│   │   ├── security/           # JWT, UserDetails, SecurityConfig
│   │   ├── service/            # Business Logic
│   │   └── RestauranteApplication.java
│   ├── src/main/resources/
│   │   ├── application.yml     # Configuração base
│   │   ├── application-dev.yml # Dev overrides
│   │   ├── application-prod.yml# Prod overrides
│   │   └── db/migration/       # Flyway migrations
│   ├── Dockerfile.dev
│   ├── Dockerfile.prod
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/           # Auth, Services, Models
│   │   │   ├── shared/         # Components, Directives, Pipes
│   │   │   ├── features/       # Lazy-loaded feature modules
│   │   │   │   ├── auth/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── dishes/
│   │   │   │   ├── categories/
│   │   │   │   ├── users/
│   │   │   │   ├── menu/
│   │   │   │   └── settings/
│   │   │   └── layout/         # Header, Sidebar, MainLayout
│   │   ├── assets/
│   │   ├── styles/
│   │   └── environments/
│   ├── Dockerfile.dev
│   ├── Dockerfile.prod
│   ├── nginx.conf
│   ├── package.json
│   ├── angular.json
│   └── tailwind.config.js
└── docs/
```

## 🐳 Como Executar

### Pré-requisitos
- Docker 24+ e Docker Compose 2.20+
- Git

### Desenvolvimento

```bash
# Clonar repositório
git clone <repo-url>
cd restaurante

# Subir containers (backend, frontend, postgres)
docker-compose up --build

# Acessar aplicação
# Frontend: http://localhost:4200
# Backend API: http://localhost:8080/api
# Swagger UI: http://localhost:8080/swagger-ui.html
# Banco: localhost:5432 (user: restaurante, pass: restaurante123, db: restaurante)
```

### Produção

```bash
# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com valores de produção

# Subir stack de produção
docker-compose -f docker-compose.prod.yml up --build -d
```

## 🔐 Credenciais Padrão

```
Email: admin@restaurante.com
Senha: admin123
Role: ADMIN
```

## 📚 API Endpoints

### Autenticação (`/api/auth`)
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/login` | Login (retorna JWT) |
| POST | `/register` | Registro de usuário |
| POST | `/refresh` | Refresh token |
| POST | `/logout` | Logout |

### Categorias (`/api/categories`)
| Método | Endpoint | Acesso |
|--------|----------|--------|
| GET | `/` | Público |
| GET | `/admin` | ADMIN/MANAGER |
| POST | `/` | ADMIN/MANAGER |
| PUT | `/{id}` | ADMIN/MANAGER |
| PATCH | `/{id}/toggle-active` | ADMIN/MANAGER |
| PUT | `/reorder` | ADMIN/MANAGER |
| DELETE | `/{id}` | ADMIN |

### Pratos (`/api/dishes`)
| Método | Endpoint | Acesso |
|--------|----------|--------|
| GET | `/` | Público (filtros) |
| GET | `/admin` | ADMIN/MANAGER |
| POST | `/` | ADMIN/MANAGER |
| PUT | `/{id}` | ADMIN/MANAGER |
| PATCH | `/{id}/toggle-active` | ADMIN/MANAGER |
| POST | `/{id}/images` | ADMIN/MANAGER |
| DELETE | `/{id}/images/{imageId}` | ADMIN/MANAGER |
| DELETE | `/{id}` | ADMIN |

### Cardápio Público (`/api/menu`)
| Método | Endpoint |
|--------|----------|
| GET | `/` | Cardápio completo |
| GET | `/categories` | Categorias com contagem |

## 🛠️ Desenvolvimento

### Backend (local)
```bash
cd backend
./mvnw spring-boot:run
```

### Frontend (local)
```bash
cd frontend
npm install
npm start
```

### Testes
```bash
# Backend
cd backend && ./mvnw test

# Frontend
cd frontend && npm test
```

## 📦 Build para Produção

```bash
# Backend
cd backend && ./mvnw clean package -DskipTests

# Frontend
cd frontend && npm run build
```

## 🔧 Configuração de Ambiente

### Backend (`application.yml`)
```yaml
app:
  jwt:
    secret: ${JWT_SECRET}        # Min 32 chars (Base64)
    expiration: 86400000         # 24h em ms
  cors:
    allowed-origins: "https://seudominio.com"
  upload:
    dir: ./uploads
```

### Frontend (`environment.ts`)
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.seudominio.com/api',
  imageBaseUrl: 'https://api.seudominio.com/uploads'
};
```

## 🗄️ Banco de Dados

### Migrações Flyway
Localizadas em `backend/src/main/resources/db/migration/`
- `V1__create_initial_schema.sql` - Schema inicial + admin user

### Acessar PostgreSQL
```bash
docker exec -it restaurante-db psql -U restaurante -d restaurante
```

## 📝 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.

---

Desenvolvido com ❤️ para gestão de restaurantes