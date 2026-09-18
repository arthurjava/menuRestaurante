# Troubleshooting — Problemas Conhecidos e Soluções

## 1. [HTTP 401] Token JWT Inválido ou Expirado

### Sintoma
- Requisições autenticadas retornam 401
- Frontend faz logout automático

### Causas Possíveis
1. Token expirado (24h padrão)
2. Secret JWT diferente entre geração e validação
3. Clock skew entre client/server
4. Token malformado no header

### Diagnóstico
```bash
# Verificar token no frontend (DevTools > Application > LocalStorage > user)
# Verificar header Authorization: Bearer <token>
# Decodificar em jwt.io (não valida assinatura)
# Verificar logs backend: JWTAuthFilter, JWTUtil
```

### Solução Confirmada
- Verificar `JWT_SECRET` consistente entre ambientes
- Implementar refresh token (backend não tem endpoint `/auth/refresh`)
- Sincronizar relógios (NTP)

### Workaround Proibido
- Aumentar expiração para valor muito alto
- Desabilitar validação de expiração

---

## 2. [HTTP 403] Acesso Negado em Endpoint Autenticado

### Sintoma
- Usuário logado recebe 403 em endpoint protegido
- Frontend faz logout e redireciona para login

### Causas Possíveis
1. **Authorities sem prefixo ROLE_** — `hasRole('ADMIN')` falha (authorities são "ADMIN")
2. Endpoint não está em `permitAll()` mas deveria
3. Role do usuário não tem permissão para o recurso
4. `SecurityFilterChain` order incorreto

### Diagnóstico
```java
// Verificar authorities no UserDetailsServiceImpl
builder.authorities(user.getRole().name()); // "ADMIN" não "ROLE_ADMIN"

// Verificar SecurityConfig
.requestMatchers("/api/dishes/**").authenticated() // Não tem permitAll por role

// Verificar se usa hasRole vs hasAuthority
@PreAuthorize("hasRole('ADMIN')") // Espera ROLE_ADMIN
@PreAuthorize("hasAuthority('ADMIN')") // Espera ADMIN
```

### Solução Confirmada
- **Opção A**: Usar `hasAuthority('ADMIN')` em vez de `hasRole('ADMIN')`
- **Opção B**: Adicionar prefixo no UserDetailsService: `builder.authorities("ROLE_" + user.getRole().name())`

### Workaround Proibido
- Adicionar `.requestMatchers("/api/dishes/**").permitAll()` para mascarar
- Remover segurança do endpoint

---

## 3. [CORS] Erro de CORS no Development

### Sintoma
- Frontend (localhost:4200) não consegue chamar Backend (localhost:8080)
- Erro no console: "Access-Control-Allow-Origin"

### Causas Possíveis
1. `spring.web.cors` não configurado
2. `CorsConfigurationSource` bean ausente
3. `allowed-origins` não inclui `http://localhost:4200`

### Diagnóstico
```yaml
# application.yml
app:
  cors:
    allowed-origins: "http://localhost:4200"
```
**Mas**: Spring Security não usa `app.cors` automaticamente. Precisa de `CorsConfigurationSource` bean.

### Solução Confirmada
Adicionar bean em SecurityConfig ou configuração separada:
```java
@Bean
CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOrigins(List.of("http://localhost:4200"));
    config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
    config.setAllowedHeaders(List.of("*"));
    config.setAllowCredentials(true);
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", config);
    return source;
}
```
E no SecurityConfig:
```java
http.cors(cors -> cors.configurationSource(corsConfigurationSource()));
```

---

## 4. [N+1 Queries] Lentidão em Listagem de Pratos

### Sintoma
- `GET /api/dishes` lento com muitas categorias/imagens
- Logs SQL mostram muitas queries similares

### Causa
- Relacionamentos `LAZY` em Dish → Category, User, Images
- Mapper acessa `dish.getCategory()`, `dish.getCreatedBy()`, `dish.getImages()` para cada dish
- Sem `@EntityGraph` ou fetch join

### Diagnóstico
```properties
# Ativar SQL logging
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
```

### Solução Confirmada
**Opção A**: `@EntityGraph` no repository
```java
@EntityGraph(attributePaths = {"category", "createdBy", "images"})
List<Dish> findByActiveTrueOrderByNameAsc();
```

**Opção B**: Query com fetch join
```java
@Query("SELECT d FROM Dish d LEFT JOIN FETCH d.category LEFT JOIN FETCH d.createdBy LEFT JOIN FETCH d.images WHERE d.active = true ORDER BY d.name ASC")
List<Dish> findAllActiveWithDetails();
```

**Opção C**: DTO projection (mais performático)
```java
@Query("SELECT new com.restaurante.dto.DishDTO(d.id, d.name, ...) FROM Dish d JOIN d.category c JOIN d.createdBy u LEFT JOIN d.images i WHERE d.active = true")
List<DishDTO> findAllActiveDTO();
```

---

## 5. [Frontend] Token Não Enviado nas Requisições ApiService

### Sintoma
- Requisições via `ApiService` retornam 401
- Header `Authorization` ausente

### Causa
**Inconsistência crítica**:
- `AuthService` salva token em `signal` (memory)
- `ApiService.getHeaders()` lê `localStorage.getItem('auth_token')` — **nunca setado**

### Evidência
```typescript
// AuthService.setSession()
private setSession(response: AuthResponse): void {
  this._accessToken.set(response.accessToken);
  this._user.set(response.user);
  localStorage.setItem('user', JSON.stringify(response.user));
  // FALTA: localStorage.setItem('auth_token', response.accessToken);
}

// ApiService.getHeaders()
private getHeaders() {
  const token = localStorage.getItem('auth_token'); // SEMPRE NULL
  if (token) headers = headers.set('Authorization', `Bearer ${token}`);
}
```

### Solução Confirmada
**Opção A** (recomendada): Atualizar AuthService
```typescript
private setSession(response: AuthResponse): void {
  this._accessToken.set(response.accessToken);
  this._user.set(response.user);
  localStorage.setItem('user', JSON.stringify(response.user));
  localStorage.setItem('auth_token', response.accessToken); // ADICIONAR
}

private clearSession(): void {
  // ...
  localStorage.removeItem('auth_token'); // ADICIONAR
}
```

**Opção B**: ApiService injeta AuthService e usa `authService.getAccessToken()`

---

## 6. [Frontend] Refresh Token Falha — Backend Não Implementado

### Sintoma
- Token expira → interceptor tenta refresh → erro 404/500 → logout

### Causa
- Frontend `AuthService.refreshToken()` chama `POST /api/auth/refresh`
- Backend `AuthController` **não tem** endpoint `/refresh`

### Solução Confirmada
Implementar no backend:
```java
// AuthController
@PostMapping("/refresh")
public ResponseEntity<?> refresh(@RequestHeader("Authorization") String authHeader) {
    // Extrair refresh token (header ou cookie)
    // Validar
    // Gerar novo access token
    // Retornar { "accessToken": "..." }
}

// JWTUtil
public String generateRefreshToken(UserDetails userDetails) { ... }
public Boolean validateRefreshToken(String token) { ... }
```

---

## 7. [Frontend] Login/Register Response Mismatch

### Sintoma
- Login falha silenciosamente ou erro de parsing
- Register não autentica automaticamente

### Causa
**Backend retorna**: `{ "token": "..." }`
**Frontend espera**: `{ "accessToken": "...", "user": {...} }`

**Register Backend**: Retorna `UserDTO` (sem token)
**Register Frontend**: Espera `AuthResponse` (com token)

### Solução Confirmada
**Alinhar contratos**:
- Opção A: Backend retorna `{ "accessToken": "...", "user": {...} }`
- Opção B: Frontend adapta para `{ "token": "..." }`

---

## 8. [Docker] Java Version Mismatch

### Sintoma
- Build funciona mas versão Java inconsistente

### Causa
- AGENTS.md: "Java 25.0.4.1 (language level 25)"
- pom.xml: `<java.version>21</java.version>`
- Dockerfiles: `eclipse-temurin:25-jdk-alpine`

### Solução Confirmada
**Padronizar para Java 21** (LTS, suportado por Spring Boot 3.5):
- pom.xml: manter `<java.version>21</java.version>`
- Dockerfiles: `eclipse-temurin:21-jdk-alpine` / `eclipse-temurin:21-jre-alpine`
- AGENTS.md: atualizar para Java 21

---

## 9. [Docker] Conflito de Porta Nginx + Frontend Prod

### Sintoma
- `docker-compose.prod.yml` falha: "port already allocated"

### Causa
- `frontend` service expõe `ports: ["80:80", "443:443"]`
- `nginx` service também expõe `ports: ["80:80", "443:443"]`
- Ambos tentam bind nas mesmas portas do host

### Solução Confirmada
- **Opção A**: Remover `ports` do `frontend` (nginx faz proxy)
- **Opção B**: Remover service `nginx` (frontend já usa nginx internamente no Dockerfile.prod)
- **Opção C**: Usar portas diferentes (ex: frontend em 8081, nginx em 80/443)

---

## 10. [Database] Flyway Migration Falha em Prod

### Sintoma
- `docker-compose.prod.yml` backend falha na inicialização
- Erro: "Validate failed: Migration checksum mismatch"

### Causa
- `spring.jpa.hibernate.ddl-auto: validate` em prod
- Schema do banco não corresponde às entities
- Migration V1 já aplicada mas schema divergente

### Diagnóstico
```bash
# Verificar migrations aplicadas
flyway info

# Verificar schema atual vs entities
```

### Solução Confirmada
- Não alterar migrations já aplicadas (V1)
- Criar novas migrations (V2, V3...) para mudanças
- Em dev, pode usar `flyway clean` + `migrate` (apaga dados)

---

## 11. [Upload] Imagens Não Funcionam

### Sintoma
- `POST /api/dishes/{id}/images` retorna lista vazia
- Upload de arquivos não implementado

### Causa
- `DishController.uploadImages()` tem `// TODO: Implement actual file upload logic`
- `DishImageService.uploadImage()` espera `imageUrl` string, não `MultipartFile`
- Config `spring.servlet.multipart` ok (5MB/25MB)

### Solução Confirmada
Implementar:
1. Controller: Salvar arquivo em disco/S3, gerar URL
2. Service: Criar `DishImage` com URL retornada
3. Configurar `app.upload.dir` e servir arquivos estáticos ou usar cloud storage

---

## 12. [Security] UserDetails Recarregado a Cada Request

### Sintoma
- Query `SELECT * FROM users WHERE email = ?` executada em **toda** requisição autenticada

### Causa
- `JWTAuthFilter.doFilterInternal()` chama `userDetailsService.loadUserByUsername(email)` a cada request
- Não há cache

### Solução Confirmada
Adicionar cache no `UserDetailsServiceImpl`:
```java
@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    
    @Autowired private UserRepository userRepository;
    private final Cache<String, UserDetails> cache = Caffeine.newBuilder()
        .maximumSize(1000)
        .expireAfterWrite(Duration.ofMinutes(15))
        .build();
    
    @Override
    public UserDetails loadUserByUsername(String email) {
        return cache.get(email, key -> {
            User user = userRepository.findByEmail(key)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado: " + key));
            return buildUserDetails(user);
        });
    }
}
```

---

## 13. [Architecture] Endpoints Duplicados (/categories vs /categories/admin)

### Sintoma
- Dois endpoints retornam mesmos dados: `GET /api/categories` e `GET /api/categories/admin`
- Mesmo para dishes: `GET /api/dishes` e `GET /api/dishes/admin`

### Causa
- Implementação idêntica nos controllers
- Possível intenção: futuras permissões diferentes não implementadas

### Solução Confirmada
- **Remover duplicatas** se não há diferença de permissão
- **Ou** implementar diferença real (ex: admin retorna inativos, público só ativos)
- Atualmente ambos chamam `categoryService.findAllActive()`

---

## Confiança

**Alta** para problemas diagnosticados com evidência de código.
**Média** para problemas inferidos (precisam validação prática).

## Data

2026-09-18