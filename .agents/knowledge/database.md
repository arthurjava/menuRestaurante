# Banco de Dados — PostgreSQL

## Configuração

- **Engine**: PostgreSQL 16 (Alpine)
- **Driver**: 42.7.3
- **Pool**: HikariCP (max 20 conexões)
- **Migration**: Flyway
- **DDL**: `none` (dev/prod) / `validate` (prod)
- **Naming**: Tabelas em snake_case, colunas snake_case

## Schema (V1__create_initial_schema.sql)

### Tabelas

#### users
```sql
id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
email VARCHAR(100) UNIQUE NOT NULL
password VARCHAR(255) NOT NULL        -- BCrypt encoded
name VARCHAR(100) NOT NULL
role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'MANAGER', 'STAFF'))
is_active BOOLEAN NOT NULL DEFAULT true
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
```

#### categories
```sql
id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
name VARCHAR(100) NOT NULL
description TEXT
image_url VARCHAR(500)
display_order INT NOT NULL DEFAULT 0
is_active BOOLEAN NOT NULL DEFAULT true
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
```

#### dishes
```sql
id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
name VARCHAR(150) NOT NULL
description TEXT
price DECIMAL(10,2) NOT NULL
is_active BOOLEAN NOT NULL DEFAULT true
prep_time_minutes INT
calories INT
allergens VARCHAR(500)                -- JSON array ou CSV
image_url VARCHAR(500)                -- Imagem principal
category_id UUID NOT NULL REFERENCES categories(id)
created_by UUID NOT NULL REFERENCES users(id)
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
```

#### dish_images
```sql
id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
dish_id UUID NOT NULL REFERENCES dishes(id) ON DELETE CASCADE
image_url VARCHAR(500) NOT NULL
is_primary BOOLEAN NOT NULL DEFAULT false
display_order INT NOT NULL DEFAULT 0
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
```

### Índices

```sql
CREATE INDEX idx_dishes_category ON dishes(category_id);
CREATE INDEX idx_dishes_active ON dishes(is_active);
CREATE INDEX idx_categories_active ON categories(is_active);
CREATE INDEX idx_dish_images_dish ON dish_images(dish_id);
```

### Dados Iniciais

```sql
INSERT INTO users (email, password, name, role) VALUES 
('admin@restaurante.com', '$2a$10$X7UrH5YxX5YxX5YxX5YxX.5YxX5YxX5YxX5YxX5YxX5YxX5YxX5Y', 'Administrador', 'ADMIN');
-- Senha: admin123 (BCrypt)
```

## Entidades JPA (Mapeamento)

### Convenções

- **PK**: UUID com `GenerationType.UUID` (Hibernate 6+)
- **Tabelas**: `@Table(name = "snake_case")`
- **Colunas**: `@Column(name = "snake_case")` quando difere do campo
- **Timestamps**: `@CreationTimestamp` (created_at), `@UpdateTimestamp` (updated_at)
- **Enums**: `@Enumerated(EnumType.STRING)` para Role
- **Relacionamentos**: `@ManyToOne(fetch = FetchType.LAZY)` padrão
- **Cascades**: `@OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)` para agregados
- **Ordenação**: `@OrderBy("displayOrder ASC")` em collections

### Relacionamentos

```
User (1) ─────< (N) Dish (createdBy)
Category (1) ──< (N) Dish (category)
Dish (1) ──────< (N) DishImage (dish) [CASCADE ALL, ORPHAN REMOVAL]
```

### Lazy Loading

- Todas associações `@ManyToOne` e `@OneToMany` usam `FetchType.LAZY`
- **N+1 Potential**: DishDTO inclui CategoryDTO e UserDTO e List<DishImageDTO>
- Em `DishController.listar()` → `dishMapper.toDTO(dish)` → acessa `dish.getCategory()`, `dish.getCreatedBy()`, `dish.getImages()`
- Sem `@EntityGraph` ou `fetch join`, causa N+1 queries

## Repositories — Query Methods

### Derivados (Spring Data JPA)

```java
// UserRepository
Optional<User> findByEmail(String email);

// CategoryRepository
Optional<Category> findByName(String name);
List<Category> findByActiveTrue();

// DishRepository
Optional<Dish> findByName(String name);
List<Dish> findByCategoryIdAndActive(UUID categoryId, boolean active);
List<Dish> findByActiveFalse();
List<Dish> findByActiveTrueOrderByNameAsc();

// DishImageRepository
Optional<DishImage> findByDishIdAndPrimary(UUID dishId, boolean primary);
List<DishImage> findByDishId(UUID dishId);
```

### Sem Queries Customizadas

- Não há `@Query` com JPQL/SQL nativo
- Não há `Specifications` ou `Criteria API`
- Não há paginação nativa (`Pageable`) - controllers retornam `List<>`

## Flyway

- **Habilitado**: `flyway.enabled: true`
- **Locations**: `classpath:db/migration`
- **Naming**: `V{version}__{description}.sql`
- **Baseline**: V1 cria schema completo
- **Prod**: `ddl-auto: validate` garante schema compatível

## Configurações por Ambiente

### Dev (application-dev.yml / application.yml)
```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: none
    show-sql: true
    properties:
      hibernate:
        format_sql: true
```

### Prod (application-prod.yml)
```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
    properties:
      hibernate:
        format_sql: false
```

## Docker

### Dev (docker-compose.yml)
```yaml
postgres:
  image: postgres:16-alpine
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
```

### Prod (docker-compose.prod.yml)
```yaml
postgres:
  image: postgres:16-alpine
  environment:
    POSTGRES_DB: ${DB_NAME}
    POSTGRES_USER: ${DB_USER}
    POSTGRES_PASSWORD: ${DB_PASSWORD}
  volumes:
    - postgres_prod_data:/var/lib/postgresql/data
  restart: unless-stopped
  deploy:
    resources:
      limits:
        memory: 1G
```

## Observações e Hipóteses

### N+1 Queries (Hipótese - Precisa Validar)

**Inferido**: `DishController.listar()` carrega lista de dishes, mapper acessa category, createdBy, images para cada dish → N+1 provável.
**Evidência**: Relacionamentos LAZY, sem `@EntityGraph` ou fetch join nos repositórios.
**Validação necessária**: Ativar `show-sql: true` e testar endpoint `/api/dishes`.

### Allergens como String (Observado)

- `allergens VARCHAR(500)` - armazenado como CSV ou JSON string
- Não normalizado (tabela separada de alérgenos)
- **Inferido**: Decisão pragmática para simplicidade, mas limita queries por alérgeno

### Display Order (Observado)

- `display_order` em categories e dish_images para ordenação manual
- Reorder endpoints (`/categories/reorder`, `/dishes/{id}/images/reorder`) atualizam sequencialmente
- **Inferido**: Funciona mas não transacional (múltiplos updates individuais)

### Soft Delete (Observado)

- `is_active BOOLEAN DEFAULT true` em users, categories, dishes
- Não há `deleted_at` timestamp
- `findByActiveTrue()` / `findByActiveFalse()` nos repositórios
- Delete físico (`repository.deleteById()`) usado nos controllers

### UUID Generation (Confirmado)

- PostgreSQL: `uuid_generate_v4()` (requer extension `uuid-ossp`)
- JPA: `GenerationType.UUID` (Hibernate 6 usa `UUID.randomUUID()`)
- **Compatível**: Ambos geram UUID v4 aleatórios

## Confiança

**Alta** - Schema bem definido, migração versionada, mapeamento JPA consistente.

## Data

2026-09-18