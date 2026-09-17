# Frontend AGENTS.md - Regras Específicas do Frontend Angular 21

## 1. Objetivo
Define regras obrigatórias para desenvolvimento no módulo frontend (Angular 21 + TypeScript 5.9 + Signals).

---

## 2. Stack Frontend
- Angular 21.x (standalone components, signals)
- TypeScript 5.9+
- RxJS 7.8+
- Angular Material 21 (UI components)
- Tailwind CSS 3.4+ (estilização)
- Angular Reactive Forms
- Angular Signals nativo (state management)
- JWT Interceptor (autenticação)

---

## 3. Arquitetura de Pastas (Obrigatória)

```
src/app/
├── core/                    # Singleton services, guards, interceptors
│   ├── auth/               # AuthService, JWT Interceptor, Guards
│   ├── services/           # ApiService, NotificationService, LoadingService
│   └── models/             # Interfaces/Types compartilhados
├── shared/                 # Componentes/diretivas/pipes reutilizáveis
│   ├── components/         # Button, Input, Select, Modal, Table, ImageUpload...
│   ├── directives/         # Autofocus, ClickOutside, NumberOnly
│   ├── pipes/              # CurrencyBRL, Truncate, SafeUrl
│   └── validators/         # CPF, PasswordMatch, UniqueEmail (async)
├── features/               # Lazy-loaded feature modules
│   ├── auth/               # Login, Register
│   ├── dashboard/          # Dashboard admin
│   ├── dishes/             # CRUD Pratos (admin)
│   ├── categories/         # CRUD Categorias (admin)
│   ├── users/              # Gestão Usuários (admin)
│   ├── menu/               # Cardápio público
│   └── settings/           # Configurações restaurante
├── layout/                 # Header, Sidebar, Footer
├── app.routes.ts           # Rotas principais
├── app.config.ts           # Providers globais
└── app.component.ts
```

---

## 4. Convenções de Código

### Components (Standalone + Signals)
```typescript
@Component({
  selector: 'app-exemplo',
  standalone: true,
  imports: [CommonModule, SharedComponents, MaterialModules],
  templateUrl: './exemplo.component.html',
  styleUrl: './exemplo.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExemploComponent {
  // Signals para estado local
  readonly loading = signal(false);
  readonly items = signal<Item[]>([]);
  
  // Computed para derivados
  readonly filteredItems = computed(() => 
    this.items().filter(i => i.active)
  );
  
  // Effect para side effects
  private readonly loadEffect = effect(() => {
    if (this.loading()) { /* ... */ }
  });
  
  constructor(private readonly service: ExemploService) {}
}
```

### Services (Injectable + Signals)
```typescript
@Injectable({ providedIn: 'root' })
export class ExemploService {
  private readonly _items = signal<Item[]>([]);
  readonly items = this._items.asReadonly();
  
  constructor(private readonly api: ApiService) {}
  
  load(): void {
    this.api.get<Item[]>('/items').subscribe({
      next: data => this._items.set(data),
      error: err => this.notification.error(err.message)
    });
  }
}
```

### Reactive Forms (Obrigatório)
```typescript
readonly form = this.fb.group({
  name: ['', [Validators.required, Validators.maxLength(100)]],
  email: ['', [Validators.required, Validators.email]],
  price: [0, [Validators.required, Validators.min(0)]]
}, { updateOn: 'blur' });
```

---

## 5. Autenticação e JWT

### Interceptor (Obrigatório)
- Adiciona `Authorization: Bearer <access_token>` em requisições autenticadas
- Não adicionar em `/auth/login`, `/auth/register`, `/auth/refresh`
- Tratar 401: chamar `/auth/refresh` (com cookie HttpOnly) → retry request original
- Tratar 403: redirecionar para `/unauthorized` ou mostrar toast

### Guards
- `AuthGuard`: `canActivate` → verifica token válido, redireciona para `/login`
- `RoleGuard`: `canActivate` → verifica roles permitidas (`data: { roles: ['ADMIN', 'MANAGER'] }`)

### Token Storage
- Access Token: em memory (Signal/Service) — **nunca** localStorage
- Refresh Token: HttpOnly cookie (gerenciado pelo backend)
- Logout: limpar signal + chamar `/auth/logout` (blacklist backend)

---

## 6. Comunicação com Backend

### ApiService (Wrapper HttpClient)
- Base URL via `environment.apiUrl`
- Retry automático (3x) para erros 5xx / network
- Loading global automático (via LoadingService)
- Tratamento erros padronizado → NotificationService

### Endpoints Mapeados (Services por Feature)
| Feature | Service | Endpoints |
|---------|---------|-----------|
| Auth | AuthService | login, register, refresh, logout, me |
| Categorias | CategoriesService | list, get, create, update, delete, reorder, toggle |
| Pratos | DishesService | list, get, create, update, delete, images, toggle |
| Usuários | UsersService | list, get, create, update, delete, toggle |
| Menu Público | MenuService | menu, categories |
| Settings | SettingsService | restaurant-info, business-hours, contact, profile |

### Tipagem Estrita
- Interfaces para Request/Response DTOs
- `ApiResponse<T>`, `PaginatedResponse<T>` genéricos
- Nunca usar `any`

---

## 7. Componentes Shared (Obrigatórios)

### Padrão de Criação
- Standalone components
- Inputs tipados com `input()` (Angular 21+) ou `@Input()`
- Outputs com `output()` ou `@Output()`
- Signals para estado interno
- OnPush change detection

### Componentes Base Existentes
- `ButtonComponent`: variant, size, loading, disabled
- `InputComponent`: label, error, type, allowDecimal, appNumberOnly
- `SelectComponent`: search, multiple, compareWith
- `ModalComponent`: confirm, form, sizes
- `TableComponent`: sort, pagination, selection, actions
- `ImageUploadComponent`: drag-drop, preview, progress, reorder, primary
- `ImageGalleryComponent`: thumbnails, modal fullscreen, navigation
- `BadgeComponent`: status colors (active/inactive/pending)
- `LoadingSpinnerComponent`: inline, overlay, sizes
- `EmptyStateComponent`: icon, title, description, action

---

## 8. Rotas e Lazy Loading

### Estrutura de Rotas
```typescript
// app.routes.ts
export const routes: Routes = [
  { path: '', redirectTo: '/menu', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./features/auth/login/login.component') },
  { path: 'register', loadComponent: () => import('./features/auth/register/register.component') },
  { 
    path: 'admin', 
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'MANAGER'] },
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component') },
      { path: 'categories', loadChildren: () => import('./features/categories/categories.routes') },
      { path: 'dishes', loadChildren: () => import('./features/dishes/dishes.routes') },
      { path: 'users', loadChildren: () => import('./features/users/users.routes') },
      { path: 'settings', loadChildren: () => import('./features/settings/settings.routes') },
    ]
  },
  { path: 'menu', loadComponent: () => import('./features/menu/menu.component') },
  { path: '**', redirectTo: '/menu' }
];
```

---

## 9. Estilização (Tailwind + Angular Material)

### Regras
- Tailwind para layout, spacing, colors, responsive
- Angular Material para componentes complexos (Table, Dialog, Select, Datepicker)
- Não sobrescrever estilos Material globalmente — usar classes Tailwind nos templates
- `styles.scss`: apenas imports Tailwind + variáveis CSS customizadas
- Componentes: `styleUrl` com SCoped styles (padrão Angular)

### Breakpoints (Tailwind padrão)
- `sm`: 640px | `md`: 768px | `lg`: 1024px | `xl`: 1280px | `2xl`: 1536px

---

## 10. Upload de Imagens (Frontend)

### ImageUploadComponent
- Drag & drop zone + click para selecionar
- Preview antes do upload (ObjectURL)
- Progress bar por arquivo
- Validação client-side: tipo (image/*), tamanho (5MB), quantidade (5)
- Reordenação por drag-drop (CDK DragDrop)
- Definir imagem principal (radio/star)
- Exclusão individual antes/depois do upload
- Envio via `ImageUploadService` (multipart/form-data)

---

## 11. Testes

### Unitários (Jest + Testing Library)
- Components: render, inputs, outputs, user interactions
- Services: HTTP calls, signals, error handling
- Pipes: transformações, edge cases
- Guards/Interceptors: lógica de decisão
- Cobertura mínima: 70%

### E2E (Cypress)
- Fluxo login → dashboard → CRUD pratos
- Fluxo menu público: navegação, filtro, busca, modal
- Fluxo upload imagens: drag-drop, reorder, primary, delete
- CI: `npm run e2e:ci`

---

## 12. Build & Validação
```bash
npm run lint          # ESLint + Prettier
npm run test          # Jest unitários
npm run test:coverage # Cobertura
npm run build         # Build produção (dist/)
npm run e2e:ci        # Cypress headless
```

---

## 13. Checklist Antes de Commit
- [ ] `npm run lint` passa (0 errors)
- [ ] `npm run test` passa
- [ ] `npm run build` gera sem erros
- [ ] Nenhum `console.log` / `debugger` no código
- [ ] JWT **nunca** logado no console
- [ ] Signals usados para estado (não BehaviorSubject desnecessário)
- [ ] OnPush em todos componentes
- [ ] Lazy loading em features
- [ ] Tipagem estrita (no `any`, no `unknown` sem narrow)
- [ ] Imports organizados (Angular → 3rd party → local)
- [ ] Tailwind classes ordenadas (layout → spacing → colors → etc)