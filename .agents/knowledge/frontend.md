# Frontend — Angular 21

## Stack

- **Angular**: 21.0.0
- **TypeScript**: 5.9.0
- **Angular Material**: 21.0.0
- **Angular CDK**: 21.0.0
- **RxJS**: 7.8.0
- **Zone.js**: 0.15.0
- **TailwindCSS**: 3.4.3
- **Node.js**: 22.x (Docker: node:22-alpine)
- **Angular CLI**: 21.0.0

## Estrutura do Projeto

```
src/app/
├── app.component.ts
├── app.config.ts              # Providers globais
├── app.routes.ts              # Rotas principais
├── core/                      # Núcleo da aplicação
│   ├── auth.guard.ts          # Guard de autenticação
│   ├── role.guard.ts          # Guard de roles
│   ├── jwt.interceptor.ts     # HTTP Interceptor JWT
│   ├── models/                # Models TypeScript
│   │   ├── user.model.ts
│   │   ├── category.model.ts
│   │   └── index.ts
│   └── services/              # Services core
│       ├── api.service.ts     # API genérica + endpoints específicos
│       ├── auth.service.ts    # Autenticação, tokens, sessão
│       ├── image-upload.service.ts
│       ├── loading.service.ts
│       ├── notification.service.ts
│       └── index.ts
├── features/                  # Features por domínio
│   ├── auth/
│   │   ├── auth.routes.ts
│   │   ├── login/login.component.ts
│   │   └── register/register.component.ts
│   ├── categories/
│   │   ├── categories-list.component.ts
│   │   └── categories.routes.ts
│   ├── dashboard/
│   │   └── dashboard.component.ts
│   ├── dishes/
│   │   ├── dishes-list.component.ts
│   │   └── dishes.routes.ts
│   ├── menu/
│   │   ├── menu.component.ts
│   │   └── menu.routes.ts
│   ├── settings/
│   │   ├── settings.component.ts
│   │   └── settings.routes.ts
│   └── users/
│       ├── users-list.component.ts
│       └── users.routes.ts
└── shared/                    # Componentes compartilhados
    ├── components/
    │   ├── badge/, button/, image-gallery/, image-upload/
    │   ├── input/, modal/, notification/, select/, table/
    │   └── index.ts
    ├── directives/
    ├── paginators/
    │   └── pt-br-paginator.ts
    ├── pipes/
    └── validators/
```

## Configuração Principal (app.config.ts)

```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(withInterceptorsFromDi()),  // Permite HTTP_INTERCEPTORS
    provideAnimations(),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true
    },
    // Material defaults
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'outline', subscriptSizing: 'dynamic' } },
    { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: { duration: 5000, horizontalPosition: 'end', verticalPosition: 'top' } },
    { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: { hasBackdrop: true, closeOnNavigation: true, autoFocus: true } },
    { provide: MatPaginatorIntl, useValue: getPtBrPaginatorIntl() }
  ]
};
```

**Observações**:
- `withInterceptorsFromDi()` habilita interceptors via DI (classe `JwtInterceptor`)
- `provideZoneChangeDetection({ eventCoalescing: true })` - otimização Angular 21
- Standalone components (padrão Angular 14+)
- `changeDetection: OnPush` no schematic default

## Roteamento (app.routes.ts + feature routes)

### Lazy Loading por Feature

```typescript
// app.routes.ts
export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'auth', loadChildren: () import('./features/auth/auth.routes') },
  { path: 'dashboard', loadChildren: () => import('./features/dashboard/dashboard.routes') },
  { path: 'categories', loadChildren: () => import('./features/categories/categories.routes') },
  { path: 'dishes', loadChildren: () => import('./features/dishes/dishes.routes') },
  { path: 'menu', loadChildren: () => import('./features/menu/menu.routes') },
  { path: 'settings', loadChildren: () => import('./features/settings/settings.routes') },
  { path: 'users', loadChildren: () => import('./features/users/users.routes') },
  { path: '**', redirectTo: '/dashboard' }
];
```

### Guards

```typescript
// auth.guard.ts - CanActivateFn
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  if (authService.isLoggedIn()) return true;
  router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
  return false;
};

// role.guard.ts - CanActivateFn
export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const allowedRoles = route.data?.['roles'] as string[] | undefined;
  if (!allowedRoles || allowedRoles.length === 0) return true;
  if (authService.isLoggedIn() && authService.hasAnyRole(allowedRoles)) return true;
  router.navigate(['/unauthorized']);
  return false;
};
```

### Uso nas Rotas

```typescript
// Exemplo: categories.routes.ts
export const routes: Routes = [
  { path: '', component: CategoriesListComponent, canActivate: [authGuard] },
  { path: 'admin', component: CategoriesAdminComponent, canActivate: [authGuard, roleGuard], data: { roles: ['ADMIN', 'MANAGER'] } }
];
```

## Autenticação (AuthService)

### Estado (Signals)

```typescript
private readonly _accessToken = signal<string | null>(null);
private readonly _user = signal<User | null>(null);
private readonly _isAuthenticated = computed(() => !!this._accessToken() && !!this._user());

readonly accessToken = this._accessToken.asReadonly();
readonly user = this._user.asReadonly();
readonly isAuthenticated = this._isAuthenticated;
```

### Persistência

- `localStorage.setItem('user', JSON.stringify(user))` - apenas user
- **Token NÃO salvo no localStorage** (apenas em memory signal)
- `localStorage.getItem('auth_token')` usado no `ApiService.getHeaders()` mas **não definido pelo AuthService** - **inconsistência**

### Login/Register

```typescript
login(credentials: LoginRequest): Observable<AuthResponse> {
  return this.http.post<AuthResponse>(`${environment.authUrl}/login`, credentials).pipe(
    tap(response => this.setSession(response))
  );
}

private setSession(response: AuthResponse): void {
  this._accessToken.set(response.accessToken);
  this._user.set(response.user);
  localStorage.setItem('user', JSON.stringify(response.user));
  // Token NÃO salvo no localStorage!
}
```

### Refresh Token

```typescript
refreshToken(): Observable<{ accessToken: string }> {
  return this.http.post<{ accessToken: string }>(`${environment.authUrl}/refresh`, {}).pipe(
    tap(response => this._accessToken.set(response.accessToken))
  );
}
```

**Problema**: Backend **não tem** endpoint `/auth/refresh` implementado.

### Logout

```typescript
logout(): Observable<void> {
  return this.http.post<void>(`${environment.authUrl}/logout`, {}).pipe(
    tap(() => this.clearSession())
  );
}

private clearSession(): void {
  this._accessToken.set(null);
  this._user.set(null);
  localStorage.removeItem('user');
  this.router.navigate(['/auth/login']);
}
```

## JWT Interceptor (JwtInterceptor)

### Funcionamento

```typescript
intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
  // 1. Pula endpoints públicos
  if (this.isPublicRequest(request.url)) return next.handle(request);

  // 2. Adiciona token se disponível
  const token = this.authService.getAccessToken();
  if (token) request = this.addToken(request, token);

  // 3. Trata 401/403
  return next.handle(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !this.isRefreshTokenRequest(request.url)) {
        return this.handle401Error(request, next);  // Tenta refresh
      }
      if (error.status === 403) {
        this.authService.logout();  // Logout imediato
      }
      return throwError(() => error);
    })
  );
}
```

### Endpoints Públicos (sem token)

```typescript
private isPublicRequest(url: string): boolean {
  const publicEndpoints = [
    '/auth/login',
    '/auth/register',
    '/auth/refresh',
    '/menu',
    '/categories'
  ];
  return publicEndpoints.some(endpoint => url.includes(endpoint));
}
```

### Refresh Token Automático

```typescript
private handle401Error(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
  if (!this.isRefreshing) {
    this.isRefreshing = true;
    this.refreshTokenSubject.next(null);
    return this.authService.refreshToken().pipe(
      switchMap((response: { accessToken: string }) => {
        this.isRefreshing = false;
        this.refreshTokenSubject.next(response.accessToken);
        return next.handle(this.addToken(request, response.accessToken));
      }),
      catchError((err) => {
        this.isRefreshing = false;
        this.authService.logout();
        return throwError(() => err);
      })
    );
  }
  // Aguarda refresh completar
  return this.refreshTokenSubject.pipe(
    filter(token => token !== null),
    take(1),
    switchMap(token => next.handle(this.addToken(request, token!)))
  );
}
```

## API Service (ApiService)

### Padrão Genérico

```typescript
// GET com loading automático
get<T>(endpoint: string, params?: FilterParams): Observable<T> {
  this.loading.show();
  return this.http.get<T>(`${this.apiUrl}${endpoint}`, {
    headers: this.getHeaders(),
    params: params ? this.buildParams(params) : undefined
  }).pipe(
    tap(() => this.loading.hide()),
    catchError(error => this.handleError(error))
  );
}

// POST/PUT/PATCH/DELETE similares
```

### Headers

```typescript
private getHeaders(customHeaders?: HttpHeaders): HttpHeaders {
  let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  const token = localStorage.getItem('auth_token');  // PROBLEMA: AuthService não salva aqui!
  if (token) headers = headers.set('Authorization', `Bearer ${token}`);
  return headers;
}
```

**Inconsistência Crítica**: `AuthService` salva token em `signal` (memory), `ApiService` lê de `localStorage.getItem('auth_token')` que **nunca é setado**.

### Endpoints Específicos

Métodos wrapper para cada entidade:
- Categories: `listCategories()`, `createCategory()`, `updateCategory()`, `deleteCategory()`, `toggleCategoryActive()`, `reorderCategories()`
- Dishes: `listDishes()`, `createDish()`, `updateDish()`, `deleteDish()`, `toggleDishActive()`, `reorderDishes()`, `uploadImages()`, `removeImage()`
- Users: `listUsers()`, `createUser()`, `updateUser()`, `deleteUser()`, `toggleUserActive()`
- Settings: `getRestaurantInfo()`, `updateRestaurantInfo()`, `getBusinessHours()`, `updateBusinessHours()`, `getContactInfo()`, `updateContactInfo()`, `getProfile()`, `updateProfile()`, `resetPassword()`
- Public: `getPublicMenu()`, `getPublicCategories()`

## Models TypeScript

### UserModel

```typescript
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'MANAGER' | 'STAFF';
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### CategoryModel

```typescript
export interface Category {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  displayOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  dishes?: Dish[];
}
```

## Environments

### Development (environment.ts)

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  authUrl: 'http://localhost:8080/api/auth',
};
```

### Production (environment.prod.ts)

```typescript
export const environment = {
  production: true,
  apiUrl: '/api',           // Relativo - nginx proxy
  authUrl: '/api/auth',     // Relativo - nginx proxy
};
```

**Em prod**: Angular servido pelo Nginx, `/api` proxy para `backend:8080` (mesmo domínio, sem CORS).

## Build e Deploy

### Development

```bash
npm start                    # ng serve --host 0.0.0.0 --poll 2000
npm run build               # ng build (development config)
npm run watch               # ng build --watch --configuration development
npm test                    # ng test (Karma + Jasmine)
npm run lint                # ng lint
npm run format              # prettier --write
```

### Production

```bash
npm run build -- --configuration=production
# Output: dist/restaurante/browser/
```

### Docker

- Dev: `Dockerfile.dev` → `npm start` com hot reload
- Prod: `Dockerfile.prod` multi-stage → `npm run build` → Nginx

## Angular.json - Configurações Relevantes

```json
{
  "schematics": {
    "@angular/cli": {
      "component": {
        "style": "scss",
        "standalone": true,
        "changeDetection": "OnPush"
      }
    }
  },
  "architect": {
    "build": {
      "builder": "@angular/build:application",
      "options": {
        "outputPath": "dist/restaurante",
        "index": "src/index.html",
        "browser": "src/main.ts",
        "polyfills": ["zone.js"],
        "tsConfig": "tsconfig.app.json",
        "styles": ["src/styles.scss"]
      },
      "configurations": {
        "production": {
          "budgets": [
            { "type": "initial", "maximumWarning": "500kb", "maximumError": "1mb" },
            { "type": "anyComponentStyle", "maximumWarning": "4kb", "maximumError": "8kb" }
          ],
          "outputHashing": "all"
        }
      }
    }
  }
}
```

## Observações e Inconsistências

### 1. Token Storage Inconsistency (Crítico)

**AuthService**: Salva token em `signal` (memory only)
**ApiService.getHeaders()**: Lê `localStorage.getItem('auth_token')` 
**Resultado**: Header `Authorization` **nunca enviado** nas requisições `ApiService`

**Correção necessária**: 
- Opção A: `AuthService.setSession()` também faz `localStorage.setItem('auth_token', response.accessToken)`
- Opção B: `ApiService` usa `AuthService.getAccessToken()` (injeta AuthService)

### 2. Refresh Token Backend Missing

**Frontend**: `AuthService.refreshToken()` chama `/auth/refresh`
**Backend**: **Não existe** endpoint `/api/auth/refresh` no `AuthController`
**Resultado**: Refresh falha → logout automático

### 3. Logout Endpoint Backend Missing

**Frontend**: `AuthService.logout()` chama POST `/auth/logout`
**Backend**: **Não existe** endpoint `/api/auth/logout`
**Resultado**: Erro 404, mas `clearSession()` executa no catchError

### 4. AuthResponse Mismatch

**Backend AuthController.login()** retorna:
```json
{ "token": "eyJ..." }
```

**Frontend AuthService espera** `AuthResponse`:
```typescript
export interface AuthResponse {
  accessToken: string;
  user: User;
}
```

**Incompatibilidade**: Backend retorna `{ token }`, Frontend espera `{ accessToken, user }`

### 5. Register Response Mismatch

**Backend AuthController.register()** retorna `UserDTO` (sem token)
**Frontend AuthService.register()** espera `AuthResponse` (com token + user)

### 6. Standalone Components + Material

- Todos componentes standalone (padrão Angular 21)
- Material modules importados individualmente nos componentes
- `provideAnimations()` no app.config.ts

### 7. ChangeDetection OnPush

- Schematic default: `changeDetection: OnPush`
- Requer `signal` ou `markForCheck()` para updates
- `AuthService` usa `signal` ✓

### 8. Lazy Loading

- Todas features carregadas sob demanda (`loadChildren`)
- Bundle inicial menor

## Confiança

**Média** - Arquitetura moderna bem estruturada, mas **inconsistências críticas** na autenticação (token storage, endpoints faltando, response mismatches).

## Data

2026-09-18