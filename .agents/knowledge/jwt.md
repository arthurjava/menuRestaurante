# JWT — Implementação Detalhada

## Visão Geral

Implementação JWT stateless com:
- **Geração**: `JWTUtil.generateToken(UserDetails)`
- **Validação**: `JWTUtil.tokenValido(token, UserDetails)`
- **Extração**: `JWTUtil.extractEmail(token)`, `extractExpiration(token)`, `extractAllClaims(token)`
- **Filtro**: `JWTAuthFilter` (OncePerRequestFilter)
- **Secret**: `app.jwt.secret` (env var `JWT_SECRET`)
- **Algoritmo**: HS256

## Estrutura do Token

### Claims (Payload)

```json
{
  "sub": "usuario@email.com",
  "authorities": ["ADMIN"],
  "iat": 1699999999,
  "exp": 1700086399
}
```

- `sub` (subject): Email do usuário
- `authorities`: Array com role(s) do usuário (ex: `["ADMIN"]`)
- `iat`: Issued at (timestamp)
- `exp`: Expiration (timestamp)

### Geração

```java
public String generateToken(UserDetails userDetails) {
    Map<String, Object> claims = new HashMap<>();
    claims.put("authorities", userDetails.getAuthorities());
    return createToken(claims, userDetails.getUsername());
}

private String createToken(Map<String, Object> claims, String subject) {
    return Jwts.builder()
            .setClaims(claims)
            .setSubject(subject)
            .setIssuedAt(new Date(System.currentTimeMillis()))
            .setExpiration(new Date(System.currentTimeMillis() + expiration))
            .signWith(key, SignatureAlgorithm.HS256)
            .compact();
}
```

### Parsing/Validação

```java
private Claims extractAllClaims(String token) {
    return Jwts
            .parser()
            .verifyWith((javax.crypto.SecretKey) key)
            .build()
            .parseSignedClaims(token)
            .getPayload();
}

public Boolean tokenValido(String token, UserDetails userDetails) {
    final String email = extractEmail(token);
    return (email.equals(userDetails.getUsername()) && !isExpirado(token));
}
```

## Configuração

### application.yml

```yaml
app:
  jwt:
    secret: ${JWT_SECRET:dev-secret-key-min-32-chars-long-enough}
    expiration: ${JWT_EXPIRATION:86400000}      # 24 horas
    refresh-expiration: 604800000               # 7 dias (não usado)
```

### Requisitos do Secret

- Mínimo 32 caracteres (256 bits para HS256)
- Dev: `dev-secret-key-min-32-chars-long-enough` (36 chars)
- Prod: Deve ser configurado via `JWT_SECRET` env var

## Fluxo Completo

### Login

```
POST /api/auth/login
{ "email": "user@test.com", "password": "123456" }

→ AuthController.login()
  → UserService.findByEmail()
  → BCryptPasswordEncoder.matches()
  → Cria UserDetails com authorities = role.name()
  → JWTUtil.generateToken(userDetails)
  → Retorna { "token": "eyJ..." }
```

### Requisição Autenticada

```
GET /api/dishes
Authorization: Bearer eyJ...

→ JWTAuthFilter.doFilterInternal()
  → Extrai "Bearer " do header
  → jwtUtil.extractEmail(token)
  → userDetailsService.loadUserByUsername(email)
  → jwtUtil.tokenValido(token, userDetails)
  → Cria UsernamePasswordAuthenticationToken(userDetails, null, authorities)
  → SecurityContextHolder.setAuthentication(authToken)
  → Chain continua
```

## Refresh Token

### Status: **Não Implementado no Backend**

- `app.jwt.refresh-expiration` configurado (7 dias)
- `JWTUtil` não tem método `generateRefreshToken()`
- `AuthController` não tem endpoint `/refresh`
- Frontend `AuthService.refreshToken()` chama `${environment.authUrl}/refresh` mas backend não tem

### Frontend Espera

```typescript
// AuthService.refreshToken()
return this.http.post<{ accessToken: string }>(`${environment.authUrl}/refresh`, {});
```

### Necessário Implementar

1. `JWTUtil.generateRefreshToken(UserDetails)` - token com expiração maior
2. `JWTUtil.validateRefreshToken(String token)` - validação específica
3. `AuthController@PostMapping("/refresh")` - endpoint que:
   - Extrai refresh token (header ou cookie)
   - Valida
   - Gera novo access token
   - Retorna `{ "accessToken": "..." }`
4. Armazenamento seguro do refresh token (httpOnly cookie recomendado)

## Authorities e Roles

### Problema Identificado

**Authorities no token/Authentication**: Nome do enum **sem prefixo** (ex: `"ADMIN"`)

```java
// UserDetailsServiceImpl
builder.authorities(user.getRole().name()); // "ADMIN"

// JWTUtil.generateToken
claims.put("authorities", userDetails.getAuthorities()); // ["ADMIN"]
```

### Spring Security hasRole()

- `hasRole("ADMIN")` espera authority `"ROLE_ADMIN"`
- `hasAuthority("ADMIN")` espera authority `"ADMIN"`

### Consequência

**Inferido**: Se usar `@PreAuthorize("hasRole('ADMIN')")`, **não funcionará** com authorities atuais.
Precisa usar `@PreAuthorize("hasAuthority('ADMIN')")` ou adicionar prefixo `ROLE_` nas authorities.

### Soluções

1. **Opção A** (recomendada): Usar `hasAuthority()` em vez de `hasRole()`
2. **Opção B**: Modificar `UserDetailsServiceImpl` para adicionar prefixo:
   ```java
   builder.authorities("ROLE_" + user.getRole().name());
   ```

## Expiração e Renovação

| Token | Expiração Padrão | Config |
|-------|------------------|--------|
| Access Token | 24h (86400000ms) | `JWT_EXPIRATION` |
| Refresh Token | 7d (604800000ms) | `app.jwt.refresh-expiration` (não usado) |

## Segurança

### Pontos Fortes

- ✅ HS256 com secret configurável
- ✅ Validação de assinatura e expiração
- ✅ Stateless (SessionCreationPolicy.STATELESS)
- ✅ Secret via env var (não hardcoded em prod)
- ✅ BCrypt para senhas

### Pontos de Atenção

1. **Refresh token não implementado** - Access token de 24h expira, usuário precisa relogar
2. **Authorities sem prefixo ROLE_** - Incompatível com `hasRole()`
3. **Token não revogável** - Até expirar, token válido mesmo se usuário desativado
4. **UserDetails carregado a cada request** - `loadUserByUsername` no banco a cada request autenticado (pode ser otimizado com cache)
5. **Não há rotação de secret** - Mesmo secret para todos tokens

## Confiança

**Alta** - Implementação padrão jjwt 0.12.x, bem estruturada.

## Data

2026-09-18