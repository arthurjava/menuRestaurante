# Segurança — Autenticação, Autorização, CORS, CSRF

## Mecanismo de Autenticação

**JWT (JSON Web Token)** com filtro customizado `JWTAuthFilter` extends `OncePerRequestFilter`.

### Fluxo de Autenticação

```
1. Cliente → POST /api/auth/login (email + password)
2. AuthController → UserService.findByEmail → BCryptPasswordEncoder.matches()
3. Se válido → UserDetails criado com authorities = role.name() (ex: "ADMIN")
4. JWTUtil.generateToken(userDetails) → token com claims: subject=email, authorities
5. Response: { "token": "eyJ..." }
6. Cliente → Header "Authorization: Bearer <token>" nas requisições subsequentes
7. JWTAuthFilter.doFilterInternal():
   - Extrai token do header
   - jwtUtil.extractEmail(token)
   - userDetailsService.loadUserByUsername(email)
   - jwtUtil.tokenValido(token, userDetails)
   - Cria UsernamePasswordAuthenticationToken com authorities do userDetails
   - SecurityContextHolder.setAuthentication(authToken)
```

### JWTUtil

- **Algoritmo**: HS256 (HMAC SHA-256)
- **Secret**: Configurável via `app.jwt.secret` (env var `JWT_SECRET`)
- **Expiração**: `app.jwt.expiration` (default 86400000ms = 24h)
- **Refresh expiration**: 604800000ms (7 dias) - configurado mas não usado no backend atual
- **Claims**: `subject` (email), `authorities` (lista de roles), `iat`, `exp`
- **Validação**: Verifica assinatura, expiração, e se subject == userDetails.username

### TokenValido

```java
public Boolean tokenValido(String token, UserDetails userDetails) {
    final String email = extractEmail(token);
    return (email.equals(userDetails.getUsername()) && !isExpirado(token));
}
```

**Observação**: Não verifica se as authorities do token batem com as do userDetails carregado do banco. Se role mudar no banco, token antigo ainda funciona até expirar.

## Autorização

### SecurityConfig

```java
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        .csrf(csrf -> csrf.disable())
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/auth/**").permitAll()
            .requestMatchers("/api/menu/**").permitAll()
            .requestMatchers("/api/categories/**").permitAll()
            .anyRequest().authenticated()
        )
        .exceptionHandling(ex -> ex.authenticationEntryPoint(jwtAuthEntryPoint))
        .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
    return http.build();
}
```

### Roles

```java
public enum Role {
    ADMIN,
    MANAGER,
    STAFF
}
```

### UserDetailsServiceImpl

```java
builder.authorities(user.getRole().name()); // Ex: "ADMIN", "MANAGER", "STAFF"
```

**Importante**: Authorities são o nome do enum **sem prefixo "ROME_"**.

### Method Security

**Não utilizado atualmente**: Não há `@EnableMethodSecurity`, `@PreAuthorize`, `@Secured`, `@RolesAllowed` nos controllers/services.

**Inferido**: Autorização é feita apenas no nível do `SecurityFilterChain` (permitAll para endpoints públicos, authenticated para o resto). Não há controle granular por role nos endpoints.

### Endpoints Públicos (permitAll)

- `/api/auth/**` - login, register
- `/api/menu/**` - cardápio público
- `/api/categories/**` - categorias públicas

### Endpoints Protegidos (authenticated)

- `/api/dishes/**` - CRUD de pratos
- `/api/users/**` - CRUD de usuários (não implementado no controller)
- `/api/settings/**` - configurações (não implementado no controller)

## CORS

### Configuração

**Backend**: `app.cors.allowed-origins` em application.yml
- Dev: `http://localhost:4200`
- Prod: `${CORS_ALLOWED_ORIGINS}` (env var)

**Spring Security**: Não há configuração explícita de CORS no `SecurityConfig`. O Spring Boot auto-configura CORS baseado em `spring.mvc.cors` ou `spring.web.cors` se presente, mas não visto nos arquivos.

**Frontend (nginx prod)**: Proxy `/api` para `backend:8080` - CORS não necessário em prod pois mesmo origem.

**Frontend (dev)**: Angular dev server na porta 4200, backend na 8080 - CORS necessário.

### Observação: CORS Pode Estar Faltando

**Inferido**: Não há `CorsConfigurationSource` bean ou `spring.web.cors` configurado. Se o frontend dev (4200) chamar backend (8080), pode falhar com CORS. Precisa verificar se funciona ou se há configuração implícita.

## CSRF

**Desabilitado explicitamente**:
```java
.csrf(csrf -> csrf.disable())
```

### Justificativa

- API stateless (JWT)
- SessionCreationPolicy.STATELESS
- CSRF não aplicável a APIs token-based sem cookies

**Confirmado**: Decisão arquitetural correta para JWT stateless.

## Tratamento de 401/403

### JWTAuthEntryPoint (401)

```java
@Component
public class JWTAuthEntryPoint implements AuthenticationEntryPoint {
    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException, ServletException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.getWriter().write("{\"error\": \"Não autorizado\", \"message\": \"" + authException.getMessage() + "\"}");
    }
}
```

- Retorna 401 com JSON: `{"error": "Não autorizado", "message": "..."}`
- Chamado quando: token ausente, inválido, expirado, ou assinatura inválida

### 403 (Forbidden)

**Não há handler explícito para 403**. Spring Security retorna 403 quando:
- Usuário autenticado mas sem permissão para o recurso
- Como não há method security, 403 só ocorre se `authorizeHttpRequests` negar acesso

### Frontend: JwtInterceptor

```typescript
catchError((error: HttpErrorResponse) => {
    if (error.status === 401 && !this.isRefreshTokenRequest(request.url)) {
        return this.handle401Error(request, next); // Tenta refresh token
    }
    if (error.status === 403) {
        this.authService.logout(); // Logout automático
    }
    return throwError(() => error);
})
```

- **401**: Tenta refresh token automático, se falhar → logout
- **403**: Logout imediato + redirect para login

### AuthGuard / RoleGuard

```typescript
// authGuard
if (authService.isLoggedIn()) return true;
router.navigate(['/auth/login']);

// roleGuard
const allowedRoles = route.data?.['roles'];
if (authService.hasAnyRole(allowedRoles)) return true;
router.navigate(['/unauthorized']);
```

## Password Encoding

- **BCryptPasswordEncoder** (bean em `SecurityBeansConfig`)
- Strength padrão (10 rounds)
- Usado em `UserService.createUser()` e `AuthController.login()`

## Headers de Segurança

**Não configurados explicitamente**: Spring Security defaults aplicados.
- HSTS, X-Frame-Options, X-Content-Type-Options, etc. - defaults do Spring Boot 3.x

## Confiança

**Alta** - Implementação JWT padrão, CSRF corretamente desabilitado, stateless.

## Data

2026-09-18