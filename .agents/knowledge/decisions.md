# Decisões Arquiteturais — Decisões Confirmadas

## 1. Arquitetura em Camadas (Controller → Service → Repository)

### Decisão
Adotar separação clara em 4 camadas:
- **Controller**: HTTP, validação, serialização
- **Service**: Regras de negócio, transações, orquestração
- **Repository**: Acesso a dados (Spring Data JPA)
- **Entity**: Mapeamento JPA

### Evidência
- Estrutura de pacotes: `controller`, `service`, `repository`, `entity`
- Controllers delegam para Services
- Services usam Repositories
- Nenhuma regra de negócio em Controllers

### Confiança
**Alta** — Consistente em todo o backend.

---

## 2. DTOs para Todas as APIs Públicas

### Decisão
Não expor entidades JPA diretamente. Usar DTOs em todos os Controllers.

### Evidência
- `CategoryController` → `CategoryDTO`
- `DishController` → `DishDTO`
- `AuthController` → `AuthResponse` (inner class) + `UserDTO`
- Mappers MapStruct para conversão

### Confiança
**Alta** — Padrão aplicado consistentemente.

---

## 3. MapStruct para Mapeamento Entity↔DTO

### Decisão
Usar MapStruct (compile-time) em vez de mapeamento manual ou ModelMapper (runtime).

### Evidência
- `CategoryMapper`, `DishMapper`, `UserMapper` interfaces com `@Mapper(componentModel = "spring")`
- Implementações geradas em `target/generated-sources/annotations/`
- Zero boilerplate no código

### Confiança
**Alta** — Configurado corretamente no pom.xml com annotation processor.

---

## 4. Lombok para Boilerplate

### Decisão
Usar Lombok (`@Data`, `@Builder`, `@NoArgsConstructor`, `@AllArgsConstructor`) nas Entities e DTOs.

### Evidência
- Todas entities: `@Data @Builder @NoArgsConstructor @AllArgsConstructor`
- Todos DTOs: `@Data`
- `lombok` dependency com `scope: provided` + `maven-compiler-plugin` annotationProcessorPaths

### Confiança
**Alta** — Padrão consistente.

---

## 5. UUID como Primary Key

### Decisão
Usar `UUID` (PostgreSQL `uuid_generate_v4()`) como PK em todas as tabelas.

### Evidência
- `@Id @GeneratedValue(strategy = GenerationType.UUID)` em todas entities
- Migration V1: `id UUID PRIMARY KEY DEFAULT uuid_generate_v4()`
- Repositories: `JpaRepository<Entity, UUID>`

### Confiança
**Alta** — Implementado em todas as 4 entidades.

---

## 6. Soft Delete com `is_active` Boolean

### Decisão
Não excluir fisicamente por padrão. Usar coluna `is_active` (boolean) para desativação.

### Evidência
- `users.is_active`, `categories.is_active`, `dishes.is_active` — todos `BOOLEAN NOT NULL DEFAULT true`
- Repositories: `findByActiveTrue()`, `findByActiveFalse()`
- Controllers: Endpoints `/toggle-active` para alternar
- Delete físico apenas via `repository.deleteById()` em endpoints `DELETE`

### Confiança
**Alta** — Padrão em 3 de 4 entidades (DishImage não tem).

---

## 7. JWT Stateless Authentication

### Decisão
Autenticação stateless com JWT (HS256), sem sessão server-side.

### Evidência
- `SessionCreationPolicy.STATELESS` no SecurityConfig
- `JWTAuthFilter` extends `OncePerRequestFilter`
- `JWTUtil` com secret configurável, expiração 24h
- `UserDetailsServiceImpl` carrega usuário do banco a cada request

### Confiança
**Alta** — Implementação completa e funcional.

---

## 8. Roles como Enum String (ADMIN, MANAGER, STAFF)

### Decisão
Roles definidas como `enum Role { ADMIN, MANAGER, STAFF }` armazenadas como VARCHAR no banco.

### Evidência
- `Role.java` enum
- `User.role` com `@Enumerated(EnumType.STRING)`
- Migration: `role VARCHAR(20) CHECK (role IN ('ADMIN', 'MANAGER', 'STAFF'))`
- `UserDetailsServiceImpl`: `builder.authorities(user.getRole().name())`

### Confiança
**Alta** — Consistente entre Java, banco e security.

---

## 9. BCrypt para Password Encoding

### Decisão
Usar `BCryptPasswordEncoder` (strength 10 default) para hash de senhas.

### Evidência
- `SecurityBeansConfig` expõe `@Bean BCryptPasswordEncoder`
- `UserService.createUser()` usa `passwordEncoder.encode()`
- `AuthController.login()` usa `passwordEncoder.matches()`
- Migration: Admin user com hash BCrypt `$2a$10$...`

### Confiança
**Alta** — Padrão Spring Security.

---

## 10. CSRF Desabilitado Explicitamente

### Decisão
Desabilitar CSRF pois API é stateless (JWT em header, não cookies).

### Evidência
```java
// SecurityConfig
.csrf(csrf -> csrf.disable())
```

### Justificativa
- JWT no header `Authorization` (não cookie)
- `SessionCreationPolicy.STATELESS`
- CSRF só relevante para cookie-based auth

### Confiança
**Alta** — Decisão arquitetural correta para JWT.

---

## 11. CORS Configurado via Properties (Parcial)

### Decisão
Origens permitidas configuráveis via `app.cors.allowed-origins` (dev: `http://localhost:4200`, prod: env var).

### Evidência
- `application.yml`: `app.cors.allowed-origins: "http://localhost:4200"`
- `application-prod.yml`: `app.cors.allowed-origins: "${CORS_ALLOWED_ORIGINS}"`
- **Porém**: Não há `CorsConfigurationSource` bean no SecurityConfig

### Confiança
**Média** — Configuração existe mas pode não estar sendo aplicada pelo Spring Security.

---

## 12. Flyway para Migrações de Banco

### Decisão
Gerenciar schema via Flyway (versionado, repetível).

### Evidência
- `flyway-core` + `flyway-database-postgresql` no pom.xml
- `application.yml`: `flyway.enabled: true`, `locations: classpath:db/migration`
- `V1__create_initial_schema.sql` cria schema completo
- `ddl-auto: none` (dev) / `validate` (prod)

### Confiança
**Alta** — Configuração padrão Spring Boot + Flyway.

---

## 13. Multi-stage Docker Build (Prod)

### Decisão
Build em dois stages: builder (JDK + Maven) → runtime (JRE apenas, usuário não-root).

### Evidência
- `Dockerfile.prod`: Stage 1 `eclipse-temurin:25-jdk-alpine` compila, Stage 2 `eclipse-temurin:25-jre-alpine` roda
- `addgroup/appuser`, `chown`, `USER appuser`
- Dev usa volume mount para hot reload

### Confiança
**Alta** — Boa prática de segurança e tamanho de imagem.

---

## 14. Angular Standalone Components + Signals

### Decisão
Componentes standalone (padrão Angular 14+) + Signals para estado reativo.

### Evidência
- `angular.json` schematic: `"standalone": true`, `"changeDetection": "OnPush"`
- `AuthService` usa `signal`, `computed`, `effect`
- `provideHttpClient(withInterceptorsFromDi())` no app.config
- Lazy loading em todas features

### Confiança
**Alta** — Angular 21 patterns modernos.

---

## 15. HTTP Interceptor via DI (withInterceptorsFromDi)

### Decisão
Registrar `JwtInterceptor` via `HTTP_INTERCEPTORS` multi-provider (não functional interceptors).

### Evidência
```typescript
// app.config.ts
provideHttpClient(withInterceptorsFromDi()),
{ provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
```

### Confiança
**Alta** — Padrão Angular para interceptors baseados em classe.

---

## 16. Lazy Loading de Features

### Decisão
Todas features carregadas sob demanda (`loadChildren`).

### Evidência
- `app.routes.ts`: `loadChildren: () => import('./features/.../xxx.routes')`
- Features: auth, categories, dishes, dashboard, menu, settings, users

### Confiança
**Alta** — Otimização de bundle inicial.

---

## 17. Nginx como Reverse Proxy (Prod)

### Decisão
Nginx serve frontend estático + proxy `/api` para backend.

### Evidência
- `docker-compose.prod.yml`: service `nginx` + volumes `nginx.conf` + `ssl`
- `nginx.conf`: `location /api { proxy_pass http://backend:8080; }`
- Frontend prod Dockerfile: build Angular → Nginx

### Confiança
**Alta** — Arquitetura padrão para SPA + API.

---

## 18. Environment-based Config (Dev/Prod)

### Decisão
Configs sensíveis via env vars, perfis Spring (`dev`/`prod`), Angular `environment.ts`.

### Evidência
- Backend: `SPRING_PROFILES_ACTIVE`, `JWT_SECRET`, `DB_*` via env
- Frontend: `environment.ts` (dev) vs `environment.prod.ts` (prod)
- Docker Compose: `.env` file esperado para prod

### Confiança
**Alta** — 12-factor app compliant.

---

## 19. Healthcheck PostgreSQL (Dev)

### Decisão
Backend aguarda PostgreSQL estar saudável antes de iniciar.

### Evidência
```yaml
# docker-compose.yml
postgres:
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U restaurante -d restaurante"]
    interval: 10s, timeout: 5s, retries: 5
backend:
  depends_on:
    postgres:
      condition: service_healthy
```

### Confiança
**Alta** — Evita race condition startup.

---

## 20. Global Exception Handler

### Decisão
Centralizar tratamento de exceções com `@ControllerAdvice`.

### Evidência
- `GlobalExceptionHandler` com handlers para:
  - `ResourceNotFoundException` → 404
  - `BadRequestException` → 400
  - `Exception` (genérico) → 500 (mensagem genérica, sem stack trace)
- `ErrorResponse` padronizado: `status`, `message`, `timestamp`

### Confiança
**Alta** — Implementado e usado.

---

## Decisões Pendentes / Para Revisão

| Tópico | Status | Observação |
|--------|--------|------------|
| Refresh Token | ❌ Não implementado | Backend não tem endpoint, frontend espera |
| Method Security (`@PreAuthorize`) | ❌ Não usado | Apenas SecurityFilterChain |
| CORS Bean | ⚠️ Configurado mas não aplicado | Falta `CorsConfigurationSource` |
| Bean Validation nos DTOs | ❌ Não usado | Dependency existe mas DTOs sem anotações |
| Testes | ❌ Nenhum | Estrutura pronta, zero testes |
| N+1 Queries | ⚠️ Provável | Relacionamentos LAZY sem fetch join |
| Token Storage Frontend | ❌ Inconsistente | AuthService (signal) vs ApiService (localStorage) |
| Java Version | ⚠️ Mismatch | AGENTS.md: 25, pom.xml: 21, Docker: 25 |

---

## Confiança Geral

**Alta** para decisões implementadas e visíveis no código.
**Média/Baixa** para decisões documentadas mas não implementadas ou inconsistentes.

## Data

2026-09-18