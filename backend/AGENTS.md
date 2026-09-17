# Backend AGENTS.md - Regras Específicas do Backend Spring Boot

## 1. Objetivo
Este arquivo define regras obrigatórias para desenvolvimento no módulo backend (Spring Boot 3.5.x + Java 25).

---

## 2. Stack Backend
- Java 25
- Spring Boot 3.5.x
- Spring Framework 6.2.x
- Spring Data JPA + Hibernate
- Spring Security 6.x + JWT (jjwt 0.12.x)
- Spring Validation (Bean Validation)
- PostgreSQL Driver
- Flyway (migrações)
- MapStruct (DTO mapping)
- Lombok
- Springdoc OpenAPI (Swagger UI)
- Maven 3.9.x

---

## 3. Arquitetura Obrigatória

### Separação de Camadas
```
controller/  →  service/  →  repository/  →  entity/
     ↓            ↓            ↓             ↓
   DTOs        Regras      Queries       JPA Entities
  Request/     Negócio     Spring Data   @Entity
 Response
```

### Regras
- **Controllers**: Apenas recepção HTTP, validação entrada, delegação para Service, resposta HTTP
- **Services**: Regras de negócio puras, sem acesso HTTP, sem lógica de apresentação
- **Repositories**: Acesso a dados via Spring Data JPA, JPQL, @Query, Specifications
- **Entities**: Apenas mapeamento JPA, sem lógica de negócio
- **DTOs**: Isolamento de contratos, validação Bean Validation, não expor entidades diretamente

---

## 4. Convenções de Código

### Anotações Obrigatórias em Entities
```java
@Entity @Table(name = "tabela")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Entity {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    // ...
}
```

### DTOs
- Request DTOs: `@Valid` no Controller, Bean Validation
- Response DTOs: Apenas getters, sem setters para campos sensíveis
- MapStruct mappers: `@Mapper(componentModel = "spring")`

### Exceções
- Usar `@RestControllerAdvice` global
- Nunca engolir exceções (`catch (Exception e) {}`)
- Exceções customizadas para regras de negócio
- HTTP status apropriados (400, 401, 403, 404, 409, 500)

### Transações
- `@Transactional` apenas em Services (métodos de escrita)
- `readOnly = true` para consultas
- Evitar transações longas ou abrangentes demais
- Propagação padrão `REQUIRED`, avaliar `REQUIRES_NEW` quando necessário

---

## 5. Segurança (Spring Security + JWT)

### Obrigatório
- Stateless session management
- JWT com HS256 (dev) / RS256 (prod)
- Access Token: 24h | Refresh Token: 7d (HttpOnly cookie)
- Roles: ADMIN, MANAGER, STAFF
- `@PreAuthorize` / `@Secured` em endpoints protegidos

### Proibido
- `permitAll()` como workaround
- Remover/desabilitar filtros de segurança
- Logar JWT completo
- Expor secrets no código

### Diagnóstico 401/403
Verificar em ordem: SecurityFilterChain → JWT Filter → Token parsing → Claims → Authorities → SecurityContext → AuthenticationProvider → UserDetailsService → @PreAuthorize

---

## 6. Banco de Dados (PostgreSQL + JPA/Hibernate)

### Migrações Flyway
- Arquivos em `src/main/resources/db/migration/`
- Naming: `V{versao}__{descricao}.sql`
- Nunca alterar migrações já aplicadas
- `ddl-auto: validate` em dev/prod

### JPA/Hibernate
- `FetchType.LAZY` padrão (evitar EAGER)
- `@BatchSize` ou `EntityGraph` para evitar N+1
- Índices via `@Index` ou migração SQL
- Cascade/OrphanRemoval com cuidado
- Dirty checking automático (não chamar `save` desnecessariamente)

### Queries
- Derivadas (`findBy...`) para simples
- `@Query` com JPQL para complexas
- Specifications/Criteria para filtros dinâmicos
- Paginação obrigatória em listagens (`Pageable`)

---

## 7. API REST

### Convenções
| Operação | Método | Status Sucesso |
|----------|--------|----------------|
| Listar | GET | 200 |
| Buscar por ID | GET | 200 |
| Criar | POST | 201 |
| Atualizar total | PUT | 200 |
| Atualizar parcial | PATCH | 200 |
| Excluir | DELETE | 204 |

### Respostas Padronizadas
```json
// Sucesso
{ "data": {}, "meta": {} }

// Erro
{ "timestamp": "", "status": 400, "error": "Bad Request", "message": "", "path": "" }
```

### Validação
- Bean Validation em DTOs Request
- `@Valid` no Controller
- Global Exception Handler para `MethodArgumentNotValidException`

---

## 8. Upload de Imagens
- Endpoint: `POST /api/dishes/{id}/images` (multipart)
- Tipos: JPEG, PNG, WebP
- Max: 5MB/imagem, 5 imagens/prato
- Validação conteúdo (não apenas extensão)
- Armazenamento: local (dev) / MinIO/S3 (prod)

---

## 9. Testes

### Unitários (JUnit 5 + Mockito)
- Services: regras de negócio, casos sucesso/erro, validações
- Mappers: conversão DTO ↔ Entity
- Utils: funções puras
- Cobertura mínima: 80%

### Integração (@SpringBootTest + Testcontainers)
- Controller + Security (JWT, roles)
- Repository + PostgreSQL real
- Transações @Transactional + rollback
- Flyway migrations

### Controller (@WebMvcTest + MockMvc)
- Serialização/deserialização JSON
- Validação Bean Validation
- Security context (mock JWT)

---

## 10. Configuração

### Perfis
- `dev`: `application-dev.yml` (show-sql, validate, local upload)
- `prod`: `application-prod.yml` (otimizado, S3/MinIO, RS256)

### Variáveis de Ambiente (obrigatórias)
```
DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
JWT_SECRET (min 32 chars), JWT_EXPIRATION
CORS_ALLOWED_ORIGINS
UPLOAD_DIR, UPLOAD_URL_PREFIX
```

---

## 11. Build & Validação
```bash
mvn clean test        # Testes unitários
mvn verify            # Testes + integração + checkstyle/spotbugs se configurado
mvn clean package     # Build JAR produção
```

---

## 12. Checklist Antes de Commit
- [ ] `mvn test` passa
- [ ] `mvn verify` passa (se configurado)
- [ ] Nenhum `System.out.println` ou log de debug
- [ ] Secrets não commitados
- [ ] Migração Flyway versionada (se schema alterado)
- [ ] DTOs não expõem campos sensíveis (password, token)
- [ ] `@Transactional` apenas onde necessário
- [ ] N+1 queries verificadas em listagens