# Arquitetura do Projeto

## Visão Geral

Sistema de cardápio para restaurante com arquitetura cliente-servidor:
- **Backend**: Spring Boot 3.5.0 (Java 21) - API REST
- **Frontend**: Angular 21 (TypeScript 5.9) - SPA
- **Banco**: PostgreSQL 16
- **Infra**: Docker Compose (dev/prod), Nginx (prod)

## Estrutura de Módulos (Backend)

```
com.restaurante
├── config              # Configurações (SecurityBeansConfig)
├── controller          # Controllers REST (Auth, Category, Dish)
├── dto                 # Data Transfer Objects
├── entity              # Entidades JPA (User, Category, Dish, DishImage)
├── exception           # Exceções customizadas + GlobalExceptionHandler
├── mapper              # MapStruct mappers (Category, Dish, User)
├── repository          # Spring Data JPA Repositories
├── security            # JWT, SecurityConfig, UserDetailsService, Roles
└── service             # Camada de negócio (Category, Dish, DishImage, User)
```

## Padrão Arquitetural

**Controller → Service → Repository → Entity**

- Controllers: Recebem HTTP, validam entrada (Bean Validation), delegam para Services
- Services: Regras de negócio, transações (@Transactional implícito via Spring Data), orquestração
- Repositories: Acesso a dados via Spring Data JPA (query methods derivados)
- Entities: JPA com Lombok (@Data, @Builder, @NoArgsConstructor, @AllArgsConstructor)
- DTOs: Isolamento de entidades, controle de campos expostos
- Mappers: MapStruct (componentModel = "spring") para conversão Entity↔DTO

## Separação de Responsabilidades

✅ **Observado**: Separação clara entre camadas
- Controllers não contêm regras de negócio complexas
- Services concentram lógica de negócio
- Repositories apenas acesso a dados
- DTOs usados em todas as APIs públicas
- Entidades não expostas diretamente

## Convenções de Pacotes

- `com.restaurante.*` - pacote base
- Subpacotes por responsabilidade (controller, service, repository, entity, dto, mapper, security, exception, config)
- Nomes de classes sufixados por responsabilidade: `Controller`, `Service`, `Repository`, `DTO`, `Mapper`, `Entity`

## Fluxo de Dados

```
HTTP Request
    ↓
Controller (validação @Valid)
    ↓
DTO → Mapper → Entity
    ↓
Service (regras de negócio, @Transactional)
    ↓
Repository (Spring Data JPA)
    ↓
PostgreSQL
    ↓
Entity → Mapper → DTO
    ↓
HTTP Response (JSON)
```

## Pontos de Integração

- **REST API**: `/api/auth/**`, `/api/categories/**`, `/api/dishes/**`, `/api/menu/**`
- **JWT**: Header `Authorization: Bearer <token>`
- **CORS**: `http://localhost:4200` (dev), variável `CORS_ALLOWED_ORIGINS` (prod)
- **Upload**: Multipart até 5MB/arquivo, 25MB/request
- **Flyway**: Migrações em `classpath:db/migration`

## Confiança

**Alta** - Arquitetura claramente definida e consistente em todo o códigobase.

## Data

2026-09-18