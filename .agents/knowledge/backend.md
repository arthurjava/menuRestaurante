# Backend — Padrões e Convenções

## Stack

- **Java**: 21 (pom.xml: `<java.version>21</java.version>`)
- **Spring Boot**: 3.5.0
- **Spring Framework**: 6.2.x
- **Spring Security**: 6.3.2
- **Spring Data JPA**: Via spring-boot-starter-data-jpa
- **Hibernate**: Gerenciado pelo Spring Boot
- **PostgreSQL Driver**: 42.7.3
- **JWT**: jjwt 0.12.5
- **MapStruct**: 1.6.0
- **Lombok**: 1.18.38
- **Flyway**: Migrações de banco
- **Springdoc OpenAPI**: 2.1.0 (Swagger)
- **Maven**: Build tool

## Controllers

### Padrões Observados

1. **Anotações**: `@RestController`, `@RequestMapping("/api/...")`
2. **Injeção**: `@Autowired` em campos (não construtor)
3. **Validação**: Bean Validation nos DTOs (`@Valid` implícito no `@RequestBody`)
4. **Respostas**: `ResponseEntity<?>` com status HTTP apropriados
5. **Mapeamento**: DTO ↔ Entity via MapStruct mappers
6. **Endpoints públicos**: `/api/auth/**`, `/api/menu/**`, `/api/categories/**` (permitAll no SecurityConfig)
7. **Endpoints admin**: Duplicados com sufixo `/admin` (ex: `/api/categories` e `/api/categories/admin`)

### Exemplos

```java
// AuthController - login público
@PostMapping("/login")
public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest)

// CategoryController - listagem pública e admin
@GetMapping
public ResponseEntity<List<CategoryDTO>> listar()

@GetMapping("/admin")
public ResponseEntity<List<CategoryDTO>> listarAdmin()

// DishController - query params para filtros
@GetMapping
public ResponseEntity<List<DishDTO>> listar(
    @RequestParam(required = false) UUID categoryId,
    @RequestParam(required = false) Boolean active)
```

### Observação: Duplicação de Endpoints

**Inferido**: Existem endpoints duplicados (`/categories` e `/categories/admin`, `/dishes` e `/dishes/admin`) que retornam os mesmos dados. Possível razão: separação futura de permissões ou resposta diferente não implementada ainda.

## Services

### Padrões Observados

1. **Anotação**: `@Service`
2. **Injeção**: `@Autowired` em campos
3. **Transações**: Implícitas via Spring Data JPA `save()` (não há `@Transactional` explícito nos services)
4. **Validação**: Lançam `ResourceNotFoundException` quando entidade não encontrada
5. **Regras de negócio**: Validação de existência de FKs (category, user) antes de salvar

### Exemplos

```java
// CategoryService
public Category createCategory(Category category) {
    return categoryRepository.save(category);
}

public Category updateCategory(UUID id, Category categoryDetails) {
    Category category = findById(id); // lança ResourceNotFoundException
    category.setName(categoryDetails.getName());
    // ... copia campos
    return categoryRepository.save(category);
}

// DishService - valida FKs
public Dish createDish(Dish dish) {
    if (dish.getCategory() != null) {
        Category category = categoryRepository.findById(dish.getCategory().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada"));
        dish.setCategory(category);
    }
    // ...
    return dishRepository.save(dish);
}
```

### Observação: Transações

**Inferido**: Não há `@Transactional` explícito. As operações de escrita usam `repository.save()` que roda em transação pelo Spring Data JPA. Para operações multi-repository (ex: DishService criando dish + validando category + user), a transação abrange apenas o `save()` final. Pode haver inconsistência se falhar após validações parciais.

## Repositories

### Padrões Observados

1. **Interface**: Extende `JpaRepository<Entity, UUID>`
2. **Query Methods**: Derivados por convenção de nome (`findByActiveTrue`, `findByCategoryIdAndActive`)
3. **Sem @Query**: Não há queries JPQL/SQL customizadas
4. **Retorno**: `Optional<Entity>` para buscas por ID/unique, `List<Entity>` para listas

### Exemplos

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

## DTOs

### Padrões Observados

1. **Lombok**: `@Data` (getters, setters, toString, equals, hashCode)
2. **Campos**: Apenas dados necessários para API (sem password, sem relações internas completas)
3. **Nested DTOs**: DishDTO contém CategoryDTO, UserDTO, List<DishImageDTO>
4. **Sem validação Bean Validation**: DTOs não têm anotações `@NotNull`, `@Size`, etc. (validação pode estar faltando)

### Exemplos

```java
// CategoryDTO
@Data
public class CategoryDTO {
    private UUID id;
    private String name;
    private String description;
    private String imageUrl;
    private int displayOrder;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<DishDTO> dishes; // nested - pode causar serialização profunda
}

// DishDTO
@Data
public class DishDTO {
    private UUID id;
    private String name;
    private String description;
    private BigDecimal price;
    private boolean active;
    private Integer prepTimeMinutes;
    private Integer calories;
    private String allergens;
    private String imageUrl;
    private CategoryDTO category; // nested
    private UserDTO createdBy;    // nested
    private List<DishImageDTO> images; // nested
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

### Observação: Serialização Circular

**Inferido**: DTOs aninhados (DishDTO → CategoryDTO → List<DishDTO>) podem causar loops de serialização Jackson. Não há `@JsonIgnore` ou `@JsonManagedReference`/`@JsonBackReference` nos DTOs. Precisa verificar se `CategoryDTO.dishes` é populado (no CategoryController não parece ser).

## Mappers (MapStruct)

### Padrões Observados

1. **Interface**: `@Mapper(componentModel = "spring")`
2. **Métodos**: `toDTO(Entity)`, `toEntity(DTO)`
3. **Geração**: Implementações em `target/generated-sources/annotations/`
4. **Mapeamento implícito**: Campos com mesmo nome/tipo mapeados automaticamente

### Exemplos

```java
@Mapper(componentModel = "spring")
public interface CategoryMapper {
    CategoryDTO toDTO(Category category);
    Category toEntity(CategoryDTO categoryDTO);
}
```

## Exceptions

### Padrões Observados

1. **ResourceNotFoundException**: `@ResponseStatus(HttpStatus.NOT_FOUND)`, extends `RuntimeException`
2. **BadRequestException**: Extends `RuntimeException` (sem @ResponseStatus)
3. **GlobalExceptionHandler**: `@ControllerAdvice` com handlers para:
   - `ResourceNotFoundException` → 404
   - `BadRequestException` → 400
   - `Exception` (genérico) → 500
4. **ErrorResponse**: Classe estática interna com `status`, `message`, `timestamp`

### Observação: Tratamento Genérico

**Confirmado**: `Exception.class` handler captura tudo e retorna 500 com mensagem genérica "Erro interno do servidor". Não expõe stack trace.

## Validação

### Estado Atual

**Observado**: Bean Validation **NÃO** está sendo usado nos DTOs.
- DTOs não têm anotações `@NotNull`, `@NotBlank`, `@Size`, `@Email`, `@Pattern`, `@Valid`
- `spring-boot-starter-validation` está no pom.xml mas não utilizado
- Validação ocorre apenas no service (lança exceções) ou no banco (constraints)

### Recomendação

Adicionar validação nos DTOs:
```java
@Data
public class CategoryDTO {
    @NotBlank @Size(max = 100)
    private String name;
    
    @Size(max = 500)
    private String imageUrl;
    // ...
}
```

## Configurações

### application.yml (base)
- Datasource: PostgreSQL com HikariCP (pool 20)
- JPA: `ddl-auto: none` (Flyway gerencia schema), `show-sql: true`
- Flyway: Habilitado, location `classpath:db/migration`
- Multipart: 5MB/arquivo, 25MB/request
- JWT: Secret e expiração via env vars
- CORS: `allowed-origins: http://localhost:4200`
- Upload: `dir: ./uploads`, `url-prefix: /uploads`

### application-dev.yml
- Igual ao base, `show-sql: true`

### application-prod.yml
- `ddl-auto: validate`
- `show-sql: false`
- `format_sql: false`
- Upload dir: `/mnt/uploads`
- CORS: via `${CORS_ALLOWED_ORIGINS}`

## Build

```bash
mvn clean package -DskipTests   # Build produção (Dockerfile.prod)
mvn spring-boot:run             # Dev (Dockerfile.dev)
```

## Confiança

**Alta** - Padrões consistentes em todo o backend.

## Data

2026-09-18