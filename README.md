# Sistema de Menu

Módulo de cardápio digital público do sistema Restaurante. Permite a visualização de pratos e categorias por clientes finais, com suporte a busca, filtro por categoria, galeria de imagens, detalhes do prato e informações do restaurante (horários, contato, localização). O módulo é acessível sem autenticação e consome endpoints públicos da API.

---

## 1. Visão Geral

### Finalidade
Exibir o cardápio digital do restaurante para clientes finais, permitindo navegação por categorias, busca textual, visualização de imagens dos pratos, detalhes completos (descrição, preço, categoria) e acesso a informações institucionais do restaurante.

### Escopo
- **Público-alvo**: Clientes do restaurante (acesso anônimo)
- **Funcionalidades principais**:
  - Listagem de pratos agrupados por categoria
  - Busca textual por nome/descrição
  - Filtro por categoria (chips)
  - Galeria de imagens por prato (múltiplas imagens, fullscreen)
  - Modal de detalhes do prato (imagem principal, descrição, preço, categoria)
  - Informações do restaurante (logo, nome, tagline, descrição)
  - Horário de funcionamento por dia da semana
  - Contato (telefone, email, endereço, redes sociais)
  - Botão "Adicionar" (integração futura com carrinho/pedido)

### Usuários/Perfis
- **Cliente final**: Acesso público sem autenticação (rota `/menu`)
- **Administrador/Gerente**: Gerenciam categorias e pratos via rotas protegidas (`/categories`, `/dishes`)

---

## 2. Funcionalidades

### Categorias (Público)
- **Listagem**: Exibição de todas as categorias ativas com imagem e ordem de exibição
- **Filtro por categoria**: Chips interativos ("Todas" + uma por categoria)
- **Ordenação**: Por `displayOrder` (configurado no admin)
- **Imagem da categoria**: Exibida no header da seção (fallback para ícone Material)

### Pratos (Público)
- **Listagem**: Cards responsivos (1 coluna mobile, 2 tablet, 3 desktop, 4 xl)
- **Busca textual**: Por nome e descrição (case-insensitive, tempo real)
- **Filtro por categoria**: Chips de categoria
- **Imagem principal**: Primeira imagem do prato (aspect-ratio 4:3, lazy loading)
- **Galeria**: Botão para abrir galeria se prato tem >1 imagem
- **Preço**: Formato brasileiro (R$ 00,00)
- **Descrição**: Truncada em 2 linhas (line-clamp-2)
- **Badge de categoria**: Nome da categoria no card
- **Botão "Adicionar"**: Hover no card, notificação de sucesso (mock)

### Galeria de Imagens (Por Prato)
- **Miniaturas**: Thumbnails clicáveis (20x20, scroll horizontal)
- **Imagem principal**: Aspect-ratio 4:3, hover zoom
- **Fullscreen**: Navegação setas/teclado (ESC, ←, →), contador, ESC para fechar
- **Indicador principal**: Badge "Principal" na imagem marcada como `isMain`

### Modal de Detalhes do Prato
- **Imagem principal**: Maior (aspect-ratio 4:3)
- **Preço**: Destaque (R$ 00,00)
- **Badge da categoria**: Variante primary
- **Descrição completa**: Se existir
- **Ações**: "Adicionar ao Pedido" (primary, fullWidth) + "Ver Imagens" (outline, se >1 imagem)

### Informações do Restaurante
- **Header**: Logo + Nome + Tagline (sticky top)
- **Footer**: Nome, descrição, horários (7 dias), contato (telefone, email, endereço, redes sociais)
- **Copyright**: Ano dinâmico

### Ordenação (Admin - evidenciado no código)
- **Drag-and-drop**: Implementado via `CdkDragDrop` (`@angular/cdk/drag-drop`)
- **Persistência**: `PUT /categories/reorder` e `PUT /dishes/reorder` com array `{ id, displayOrder }`
- **Componente**: `ReorderWrapperComponent` (modal dedicado)
- **Feedback**: Notificação de sucesso/erro via `NotificationService`
- **Fallback**: Em caso de erro, mantém estado local

---

## 3. Arquitetura

### Stack
- **Angular 21** (Standalone Components)
- **TypeScript 5.9**
- **RxJS 7.8** (signals + computed + effect)
- **Angular Material 21** (componentes UI)
- **Tailwind CSS 3.4** (utilitários + design system)
- **Angular CDK** (DragDrop, Overlay, A11y)

### Padrão Arquitetural
```
MenuComponent (Smart)
  ↓
ApiService (HTTP)
  ↓
Backend REST API
```

**Responsabilidades**:
- **MenuComponent**: Estado, filtros, modais, renderização, ciclo de vida
- **ApiService**: Comunicação HTTP, loading, error handling, mapeamento DTO → Model
- **Shared Components**: UI reutilizável (Button, Badge, Modal, ImageGallery, Table)
- **Services**: NotificationService (toast), LoadingService (spinner global)

### Guards/Interceptors (não aplicam a /menu)
- `authGuard`: Protege rotas admin (`/categories`, `/dishes`, `/users`, `/settings`)
- `roleGuard`: Verifica roles (`ADMIN`)
- `JwtInterceptor`: Injeta `Authorization: Bearer <token>` exceto endpoints públicos (`/menu`, `/categories`, `/auth/*`)

### Change Detection
- `OnPush` em todos os componentes
- Signals para estado reativo (`signal`, `computed`, `effect`)
- `HostBinding` para controle de visibilidade (modais)

---

## 4. Estrutura de Diretórios

```text
src/
└── app/
    ├── core/
    │   ├── services/
    │   │   ├── api.service.ts          # HTTP + endpoints Menu
    │   │   ├── auth.service.ts         # Auth state (token, user)
    │   │   ├── notification.service.ts # Toast queue
    │   │   └── loading.service.ts      # Spinner global
    │   ├── auth.guard.ts               # Protege rotas admin
    │   ├── role.guard.ts               # Verifica roles (ADMIN)
    │   ├── jwt.interceptor.ts          # Injeta Authorization + refresh 401
    │   └── models/
    │       ├── category.model.ts       # Category interface
    │       └── user.model.ts           # User interface
    ├── features/
    │   ├── menu/
    │   │   ├── menu.component.ts       # Componente principal (400+ linhas)
    │   │   └── menu.routes.ts          # Lazy load standalone
    │   ├── categories/
    │   │   ├── categories-list.component.ts
    │   │   └── categories.routes.ts
    │   ├── dishes/
    │   │   ├── dishes-list.component.ts
    │   │   └── dishes.routes.ts
    │   └── auth/
    ├── shared/
    │   ├── components/
    │   │   ├── button/button.component.ts
    │   │   ├── badge/badge.component.ts
    │   │   ├── image-gallery/image-gallery.component.ts
    │   │   ├── modal/
    │   │   │   ├── modal.component.ts           # Host + variants
    │   │   │   ├── cat-form.component.ts        # Category CRUD
    │   │   │   ├── dish-form.component.ts       # Dish CRUD (tabs + images)
    │   │   │   ├── del-confirm.component.ts     # Confirma exclusão
    │   │   │   ├── reorder-wrapper.component.ts # Drag-drop reorder
    │   │   │   └── modal.component.ts           # Base + variants
    │   │   ├── table/table.component.ts         # Material Table wrapper
    │   │   ├── image-upload/image-upload.component.ts
    │   │   └── index.ts                         # Barrel exports
    │   └── paginators/pt-br-paginator.ts
    └── environments/environment.ts
```

---

## 5. Componentes

| Componente | Responsabilidade | Inputs | Outputs | Dependências |
|------------|------------------|--------|---------|--------------|
| `MenuComponent` | View principal, estado, filtros, modais | - | - | `ApiService`, `NotificationService`, `LoadingService`, `ImageGalleryComponent`, `ButtonComponent`, `BadgeComponent`, `ModalComponent` |
| `ImageGalleryComponent` | Galeria thumbnails + fullscreen | `images: GalleryImage[]`, `emptyMessage`, `aspectRatio` | `imageSelected: number` | `MatButtonModule`, `MatIconModule`, `MatDialogModule` |
| `ModalComponent` | Host de modais (variants) | `isOpen`, `title`, `description`, `variant`, `size`, `confirmLabel`, `confirmVariant`, `confirmLoading`, `cancelLabel`, `closable`, `categoryInitialData`, `dishCategoryOptions`, `dishInitialData`, `reorderItemsInput`, `reorderConfig`, `userRoleOptions`, `userInitialData`, `userEditing` | `isOpenChange`, `confirmed`, `cancelled`, `closed`, `categoryConfirmed`, `dishConfirmed`, `userConfirmed`, `reorderConfirmed` | `CatFormComponent`, `DelConfirmComponent`, `ReorderWrapperComponent`, `DishFormComponent`, `UserFormComponent`, `ButtonComponent` |
| `ButtonComponent` | Botão reutilizável | `label`, `icon`, `variant`, `size`, `type`, `disabled`, `loading`, `fullWidth` | `clicked: MouseEvent` | `MatButtonModule`, `MatProgressSpinnerModule`, `MatIconModule` |
| `BadgeComponent` | Badge/status | `label`, `variant`, `size`, `shape`, `icon`, `dot`, `count`, `ariaLabel` | - | - |
| `DishFormComponent` (admin) | Form CRUD Prato (tabs + images) | `title`, `confirmLabel`, `confirmLoading`, `categoryOptions`, `initialData`, `existingImages`, `editingDishId`, `size` | `confirmed: DishFormData`, `cancelled`, `imagesChange`, `uploadComplete`, `uploadError` | `ImageUploadComponent`, `ButtonComponent`, `InputComponent`, `SelectComponent`, `MatTabsModule`, `MatSlideToggleModule` |
| `ReorderWrapperComponent` | Drag-drop reorder modal | `items: ReorderItem[]`, `config: ReorderModalConfig`, `confirmLabel`, `confirmLoading`, `size` | `confirmed: ReorderItem[]`, `cancelled` | `CdkDragDrop`, `BadgeComponent`, `ButtonComponent` |
| `TableComponent` (admin) | Material Table wrapper | `columns: ColumnDef[]`, `data: T[]`, `actions: TableAction[]`, `config: TableConfig`, `totalItems`, `pageIndex`, `pageSize`, `sortActive`, `sortDirection`, `loading`, `rowClickable` | `rowClick`, `selectionChange`, `pageChange`, `sortChange`, `actionClick` | `MatTableModule`, `MatPaginatorModule`, `MatSortModule` (removido), `ButtonComponent` |
| `CatFormComponent` (admin) | Form CRUD Categoria | `title`, `confirmLabel`, `confirmLoading`, `initialData`, `size` | `confirmed: CategoryFormData`, `cancelled` | `ButtonComponent`, `InputComponent`, `MatFormFieldModule`, `MatInputModule`, `MatCheckboxModule` |
| `DelConfirmComponent` | Confirmação exclusão | `title`, `description`, `icon`, `iconColor`, `confirmLabel`, `confirmVariant`, `confirmLoading`, `cancelLabel`, `size` | `confirmed`, `cancelled` | `ButtonComponent` |
| `UserFormComponent` (admin) | Form CRUD Usuário | `title`, `confirmLabel`, `confirmLoading`, `roleOptions`, `initialData`, `editing`, `size` | `confirmed: UserFormData`, `cancelled` | `ButtonComponent`, `InputComponent`, `SelectComponent` |

---

## 6. Fluxos Funcionais

### Carregar Menu (Inicialização)
```
MenuComponent.ngOnInit()
  → loadMenuData()
    → apiService.getPublicCategories()      → categories.set()
    → apiService.getPublicMenu()            → dishes.set()
    → apiService.getRestaurantInfo()        → restaurantInfo.set()
    → apiService.getBusinessHours()         → businessHours.set()
    → apiService.getContactInfo()           → contactInfo.set()
    → setTimeout(loading=false, 500ms)
```

### Filtrar por Categoria
```
Usuário clica chip
  → selectCategory(categoryId)
    → selectedCategory.set(id)
    → showCategoryFilter.set(false)
    → filteredDishes() recomputa (computed)
```

### Busca Textual
```
Usuário digita no input
  → onSearchChange(term)
    → searchTerm = term
    → filteredDishes() recomputa (computed)
```

### Abrir Galeria de Imagens
```
Usuário clica botão foto_library no card
  → openImageGallery(dish)
    → galleryDish.set(dish)
    → galleryImages.set(mapeia images → GalleryImage[])
    → galleryModalOpen.set(true)
    → ModalComponent abre (variant default + ImageGalleryComponent)
```

### Ver Detalhes do Prato
```
Usuário clica "Adicionar" no card OU clica no card (futuro)
  → openDetailModal(dish)
    → detailDish.set(dish)
    → detailModalOpen.set(true)
    → ModalComponent abre (variant default + conteúdo inline)
```

### Fechar Modal (ESC/Backdrop/Botão)
```
HostListener('document:keydown.escape')
  → closeGalleryModal() / closeDetailModal()
    → isOpen.set(false)
    → limpa estado (galleryDish, detailDish, etc.)
```

### Adicionar ao Pedido (Mock)
```
Clica "Adicionar" no card ou modal
  → addToOrder(dish)
    → notification.success(`${dish.name} adicionado ao pedido!`)
    // TODO: Integrar com carrinho/service real
```

---

## 7. Comunicação com a API

### Endpoints Públicos (Sem Autenticação)

| Método | Endpoint | Operação | Componente/Service |
|--------|----------|----------|-------------------|
| `GET` | `/menu` | Listar pratos públicos (com filtros) | `ApiService.getPublicMenu()` → `MenuComponent` |
| `GET` | `/menu/categories` | Listar categorias públicas | `ApiService.getPublicCategories()` → `MenuComponent` |
| `GET` | `/settings/restaurant-info` | Info do restaurante (logo, nome, tagline, descrição) | `ApiService.getRestaurantInfo()` → `MenuComponent` |
| `GET` | `/settings/business-hours` | Horários de funcionamento | `ApiService.getBusinessHours()` → `MenuComponent` |
| `GET` | `/settings/contact-info` | Contato (phone, email, address, website, instagram, facebook) | `ApiService.getContactInfo()` → `MenuComponent` |

### Endpoints Admin (Requerem JWT + Role ADMIN)

| Método | Endpoint | Operação | Componente/Service |
|--------|----------|----------|-------------------|
| `GET` | `/categories` | Listar categorias (com filtros) | `ApiService.listCategories()` |
| `GET` | `/categories/admin` | Listar todas (admin) | `ApiService.listCategoriesAdmin()` → `CategoriesListComponent` |
| `POST` | `/categories` | Criar categoria | `ApiService.createCategory()` |
| `PUT` | `/categories/{id}` | Atualizar categoria | `ApiService.updateCategory()` |
| `DELETE` | `/categories/{id}` | Excluir categoria | `ApiService.deleteCategory()` |
| `PATCH` | `/categories/{id}/toggle-active` | Ativar/Desativar | `ApiService.toggleCategoryActive()` |
| `PUT` | `/categories/reorder` | Reordenar | `ApiService.reorderCategories([{id, displayOrder}])` |
| `GET` | `/dishes` | Listar pratos (filtros) | `ApiService.listDishes()` |
| `GET` | `/dishes/admin` | Listar todos (admin) | `ApiService.listDishesAdmin()` → `DishesListComponent` |
| `POST` | `/dishes` | Criar prato | `ApiService.createDish()` |
| `PUT` | `/dishes/{id}` | Atualizar prato | `ApiService.updateDish()` |
| `DELETE` | `/dishes/{id}` | Excluir prato | `ApiService.deleteDish()` |
| `PATCH` | `/dishes/{id}/toggle-active` | Ativar/Desativar | `ApiService.toggleDishActive()` |
| `PUT` | `/dishes/reorder` | Reordenar pratos | `ApiService.reorderDishes([{id, displayOrder}])` |
| `POST` | `/dishes/{dishId}/images` | Upload imagens (multipart) | `ApiService.uploadImages()` |
| `DELETE` | `/dishes/images/{imageId}` | Remover imagem | `ApiService.removeImage()` |

### Payloads Relevantes

**Criar Categoria** (`POST /categories`):
```json
{
  "name": "string (required, max 100)",
  "description": "string (max 500)",
  "active": "boolean",
  "displayOrder": "number (min 0)"
}
```

**Criar Prato** (`POST /dishes`):
```json
{
  "name": "string (required, max 100)",
  "description": "string (max 1000)",
  "price": "number (required, min 0)",
  "categoryId": "string (required)",
  "active": "boolean",
  "displayOrder": "number (min 0)"
}
```

**Reordenar** (`PUT /categories/reorder` ou `/dishes/reorder`):
```json
{
  "items": [
    { "id": "uuid", "displayOrder": 0 },
    { "id": "uuid", "displayOrder": 1 }
  ]
}
```

**Upload Imagem** (`POST /dishes/{id}/images`):
- `multipart/form-data` com campo `file` (máx 5MB, 5 arquivos)
- Resposta: `[{ id, url, isMain, displayOrder }]`

---

## 8. Modelos de Dados

### Frontend (Interfaces)

```typescript
// MenuComponent
interface PublicDish {
  id: string;
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  categoryName: string;
  images: { id: string; url: string; isMain: boolean }[];
  active: boolean;
}

interface PublicCategory {
  id: string;
  name: string;
  imageUrl?: string;
  displayOrder: number;
}

// Core Models
interface Category {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  displayOrder: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'MANAGER' | 'STAFF';
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ImageGalleryComponent
interface GalleryImage {
  id: string;
  url: string;
  thumbnailUrl?: string;
  alt: string;
  isMain?: boolean;
}

// Modal Variants Data
interface CategoryFormData {
  name: string;
  description: string;
  active: boolean;
  displayOrder: number;
  displayInMenu: boolean;
}

interface DishFormData {
  name: string;
  description: string;
  price: number;
  categoryId: string;
  active: boolean;
  displayOrder: number;
}

interface CategoryOption { value: string; label: string; }
```

### Campos Relevantes
- **displayOrder**: Ordenação visual (drag-drop persiste via API)
- **active**: Soft delete (toggle via PATCH /toggle-active)
- **isMain**: Imagem principal do prato/categoria (badge amarelo)
- **displayInMenu**: Categoria visível no cardápio público

---

## 9. Formulários e Validações

### Abordagem
- **Reactive Forms** (`FormBuilder`, `FormGroup`, `FormControl`)
- **ControlValueAccessor** no `SelectComponent` (integração nativa)
- **Validators**: `required`, `minLength`, `maxLength`, `min`, `email`, `pattern`

### Regras por Formulário

#### Categoria (CatFormComponent)
| Campo | Tipo | Obrigatório | Validação | Mensagem Erro |
|-------|------|-------------|-----------|---------------|
| name | text | Sim | `required`, `maxLength(100)` | "Nome é obrigatório" / "Máx 100 chars" |
| description | text | Não | `maxLength(500)` | "Máx 500 chars" |
| active | checkbox | - | - | - |
| displayOrder | number | Sim | `min(0)` | - |
| displayInMenu | checkbox | - | - | - |

#### Prato (DishFormComponent - Admin)
| Campo | Tipo | Obrigatório | Validação |
|-------|------|-------------|-----------|
| name | text | Sim | `required`, `maxLength(100)` |
| description | textarea | Não | `maxLength(1000)` |
| price | number | Sim | `required`, `min(0)`, `step(0.01)` |
| categoryId | select | Sim | `required` |
| active | slide-toggle | - | - |
| displayOrder | number | - | `min(0)` |

### Comportamento Submit
- **Desabilitado** se `form.invalid` ou `loading()`
- **Loading state**: Botão mostra spinner + label "Salvando..."
- **Erro API**: `NotificationService.error()` com mensagem do backend
- **Sucesso**: `NotificationService.success()` + fecha modal + recarrega lista

### Tratamento Erros API
- `ApiService` captura via `catchError`
- Extrai `error.error?.message` ou `error.message`
- Exibe via `NotificationService.error()`
- Re-lança erro para componente tratar (fechar modal, etc.)

---

## 10. Modais

### Arquitetura Atual
`ModalComponent` atua como **host** com variants injetadas via `@if (variant() === '...')`:

| Variant | Componente Filho | Uso |
|---------|------------------|-----|
| `category-form` | `CatFormComponent` | CRUD Categoria |
| `dish-form` | `DishFormComponent` | CRUD Prato (tabs + imagens) |
| `user-form` | `UserFormComponent` | CRUD Usuário |
| `confirm` | `DelConfirmComponent` | Confirma exclusão |
| `reorder` | `ReorderWrapperComponent` | Drag-drop reorder |
| `default` | `ngTemplateOutlet` | Conteúdo arbitrário |

### Wrapper Components (Inlined - sem `<app-modal>` aninhado)

#### `CatFormComponent`
- **Finalidade**: Create/Edit categoria
- **Inputs**: `title`, `confirmLabel`, `confirmLoading`, `initialData: CategoryFormData|null`, `size`
- **Outputs**: `confirmed: CategoryFormData`, `cancelled`
- **Form**: Reactive (name, description, active, displayOrder, displayInMenu)

#### `DishFormComponent`
- **Finalidade**: Create/Edit prato (tabs: Informações Básicas + Imagens)
- **Inputs**: `title`, `confirmLabel`, `confirmLoading`, `categoryOptions`, `initialData`, `existingImages`, `editingDishId`, `size`
- **Outputs**: `confirmed: DishFormData`, `cancelled`, `imagesChange`, `uploadComplete`, `uploadError`
- **Tabs**: Informações Básicas (form) + Imagens (ImageUploadComponent)

#### `UserFormComponent`
- **Finalidade**: Create/Edit usuário
- **Inputs**: `title`, `confirmLabel`, `confirmLoading`, `roleOptions`, `initialData`, `editing`, `size`
- **Outputs**: `confirmed: UserFormData`, `cancelled`

#### `DelConfirmComponent`
- **Finalidade**: Confirmação genérica de exclusão
- **Inputs**: `title`, `description`, `icon`, `iconColor`, `confirmLabel`, `confirmVariant`, `confirmLoading`, `cancelLabel`, `size`
- **Outputs**: `confirmed`, `cancelled`
- **Content Projection**: `<ng-content>` para descrição customizada

#### `ReorderWrapperComponent`
- **Finalidade**: Drag-drop reorder (categorias ou pratos)
- **Inputs**: `items: ReorderItem[]`, `config: ReorderModalConfig`, `confirmLabel`, `confirmLoading`, `size`
- **Outputs**: `confirmed: ReorderItem[]`, `cancelled`
- **CDK**: `CdkDragDrop`, `moveItemInArray`
- **Badge**: Status ativo/inativo por item

### Comportamento Abertura/Fechamento
- **Abertura**: `isOpen.set(true)` → `HostBinding('class.hidden')` remove `.hidden`
- **Fechamento**: `isOpenChange.emit(false)` → `HostBinding` adiciona `.hidden` → `cancelled.emit()`
- **Backdrop Click**: Fecha se `closable() === true`
- **ESC**: `HostListener('document:keydown.escape')` → `close()`
- **Animação**: CSS `@keyframes fadeIn` + `slideUp` (opacity + transform)

---

## 11. Tabelas (Admin)

### `TableComponent` (Genérico)
- **Datasource**: `MatTableDataSource<T>` + signals
- **Colunas**: `ColumnDef<T>[]` (key, header, sortable, width, align, render, sticky)
- **Ações**: `TableAction<T>[]` (label, icon, color, disabled, hidden, action)
- **Paginação**: `MatPaginator` (pageSizeOptions: 5,10,25,50)
- **Seleção**: `SelectionModel` (checkbox header + rows)
- **Ordenação**: **Removido** (`MatSortModule` causava NG8002) — ordenação manual nos componentes
- **Filtros**: Não implementado no componente (feito no componente pai via `filteredData` computed)
- **Estados**: Loading (spinner), Empty (inbox icon), Selected row (indigo-50)

### Uso no Menu (Admin)
- `CategoriesListComponent`: 4 colunas (Nome, Descrição, Ordem, Status) + 3 ações (Editar, Ativar/Desativar, Excluir)
- `DishesListComponent`: 6 colunas (Prato, Categoria, Preço, Ordem, Status, Imagens) + 4 ações (Ver imagens, Editar, Ativar/Desativar, Excluir)
- `UsersListComponent`: 5 colunas + ações

---

## 12. Autenticação e Autorização

### Fluxo Autenticação
1. **Login** (`/auth/login`) → `AuthService.login()` → `POST /auth/login`
2. **Resposta**: `{ accessToken, user }` → `AuthService.setSession()`
3. **Armazenamento**: `_accessToken` (signal), `_user` (signal), `localStorage.setItem('user', JSON.stringify(user))`
4. **Interceptor**: `JwtInterceptor` injeta `Authorization: Bearer <token>` em **todas** requisições exceto:
   - `/auth/login`, `/auth/register`, `/auth/refresh`
   - `/menu`, `/categories` (endpoints públicos)

### Refresh Token (401)
- `JwtInterceptor` detecta 401 → `AuthService.refreshToken()` → `POST /auth/refresh`
- Sucesso: Atualiza `_accessToken`, reenvia request original
- Falha: `AuthService.logout()` → limpa estado + redirect `/auth/login`

### Guards
- **authGuard**: `CanActivateFn` → `AuthService.isLoggedIn()` → senão `/auth/login?returnUrl=...`
- **roleGuard**: `CanActivateFn` → `route.data['roles']` → `AuthService.hasAnyRole(roles)` → senão `/unauthorized`

### Rotas Protegidas
| Rota | Guards | Roles |
|------|--------|-------|
| `/categories` | `authGuard`, `roleGuard` | `['ADMIN']` |
| `/dishes` | `authGuard`, `roleGuard` | `['ADMIN']` |
| `/users` | `authGuard`, `roleGuard` | `['ADMIN']` |
| `/settings` | `authGuard`, `roleGuard` | `['ADMIN']` |
| `/menu` | *(nenhum)* | Público |

### Menu Público
- **Rota**: `/menu` (sem guards)
- **Interceptor**: `isPublicRequest()` retorna `true` para `/menu` e `/categories` → **não injeta token**
- **Backend**: Endpoints `/menu/*` e `/menu/categories` devem ser públicos (Spring Security `permitAll()`)

---

## 13. Tratamento de Erros

| Cenário | Implementação |
|---------|---------------|
| **Erro HTTP (4xx/5xx)** | `ApiService.handleError()` → `NotificationService.error(message)` + `throwError` |
| **Validação Form** | `form.invalid` → botão desabilitado + `mat-error` nos campos |
| **Timeout** | Não implementado (padrão Angular HttpClient) |
| **Falha Conexão** | `HttpErrorResponse` → `error.message` → Notification |
| **Erro 401** | `JwtInterceptor` → tenta `refreshToken()` → sucesso: retry; falha: `logout()` |
| **Erro 403** | `JwtInterceptor` → `AuthService.logout()` + redirect login |
| **Falha Salvar** | Modal mantém aberto, `confirmLoading=false`, `Notification.error()` |
| **Falha Excluir** | Modal mantém aberto, `deleteLoading=false`, `Notification.error()` |
| **Falha Reordenar** | `ReorderWrapperComponent` mantém estado local, `Notification.error()`, não persiste |
| **Upload Imagem** | `ImageUploadComponent` → `onImageError()` → `Notification.error()` |

---

## 14. Estados da Interface

| Estado | Implementação |
|--------|---------------|
| **Loading Inicial** | `loading = signal(true)` → skeleton cards (8 cards, pulse animation) |
| **Loading API** | `LoadingService.show()/hide()` → spinner global (não usado no Menu público) |
| **Empty State** | `@if (filteredDishes().length === 0)` → ícone + mensagem "Nenhum prato encontrado" |
| **Error State** | `NotificationService` (toast queue, 5s auto-dismiss, tipos: success/error/warning/info) |
| **Disabled State** | Botões: `[disabled]="form.invalid \|\| loading()"` |
| **Confirmação** | `DelConfirmComponent` (modal dedicado) |
| **Feedback Sucesso** | `NotificationService.success()` (verde, 5s) |
| **Feedback Erro** | `NotificationService.error()` (vermelho, 5s) |
| **Skeleton Loading** | Grid 8 cards com `animate-pulse` (bg-gray-200) |

---

## 15. Como Executar

### Pré-requisitos
| Ferramenta | Versão |
|------------|--------|
| Node.js | 22.x (conforme `package.json`: `^22.0.0`) |
| npm | 10.x |
| Angular CLI | 21.x (`@angular/cli: ^21.0.0`) |

### Comandos
```bash
# Instalar dependências
cd D:\Projetos\restaurante\frontend
npm install

# Desenvolvimento (hot reload)
npm run start
# ou: ng serve
# → http://localhost:4200

# Build produção
npm run build
# → dist/restaurante/

# Testes
npm run test
# ng test --watch=false --browsers=ChromeHeadless

# Lint
npm run lint
# ng lint

# Format
npm run format
# prettier --write "src/**/*.{ts,html,scss,json}"
```

### Configuração Necessária
- **Backend rodando**: `http://localhost:8080/api` (Spring Boot 3.5 + PostgreSQL)
- **CORS**: Backend deve permitir `http://localhost:4200` (Spring Security `cors().allowedOrigins("http://localhost:4200")`)
- **Endpoints Públicos**: `/menu`, `/menu/categories`, `/settings/*` devem ser `permitAll()` no Spring Security

### Porta
- Frontend: **4200** (padrão `ng serve`)
- Backend API: **8080** (`http://localhost:8080/api`)

---

## 16. Como Testar

### Testes Existentes
```bash
npm run test
# ng test --watch=false --browsers=ChromeHeadless
```
**Resultado atual**: 0 testes (projeto sem specs implementados)

### O que Testar (Manual)
| Cenário | Passos |
|---------|--------|
| Carregamento inicial | Acessar `/menu` → ver skeleton → dados carregam |
| Busca textual | Digitar no input → lista filtra em tempo real |
| Filtro categoria | Clicar chip categoria → lista filtra |
| Galeria imagens | Clicar ícone foto_library → abre modal → navegar setas/ESC |
| Detalhes prato | Clicar "Adicionar" → abre modal detalhes → fechar ESC/backdrop |
| Responsividade | Redimensionar viewport → grid adapta (1/2/3/4 colunas) |
| Footer info | Verificar horários, contato, copyright |
| Header sticky | Scroll → header fixa no topo |

### Cobertura Ausente
- [ ] Testes unitários `MenuComponent` (signals, computed, fluxos)
- [ ] Testes `ImageGalleryComponent` (fullscreen, navegação teclado)
- [ ] Testes `ApiService` (mocks HttpClient, error handling)
- [ ] Testes `ModalComponent` variants
- [ ] Testes `ImageGalleryComponent` (a11y ARIA)
- [ ] Testes E2E (Cypress/Playwright)

---

## 17. Dependências

### Diretas (package.json)
| Pacote | Versão | Uso no Menu |
|--------|--------|-------------|
| `@angular/core` | 21.0.0 | Signals, DI, Component |
| `@angular/common` | 21.0.0 | `CommonModule`, pipes |
| `@angular/forms` | 21.0.0 | `FormsModule`, `ReactiveFormsModule` |
| `@angular/router` | 21.0.0 | Lazy load, guards |
| `@angular/material` | 21.0.0 | Card, Button, Icon, FormField, Input, Select, Chips, ProgressSpinner, Dialog, Badge, Divider, Tooltip, Tabs, SlideToggle |
| `@angular/cdk` | 21.0.0 | `DragDropModule` (reorder), `OverlayModule`, `A11yModule` |
| `@angular/animations` | 21.0.0 | (não usado diretamente - CSS animations) |
| `rxjs` | 7.8.0 | `Observable`, `switchMap`, `catchError`, `BehaviorSubject` |
| `zone.js` | 0.15.0 | Change detection |

### DevDependencies Relevantes
| Pacote | Versão |
|--------|--------|
| `typescript` | 5.9.0 |
| `tailwindcss` | 3.4.3 |
| `prettier` | 3.3.0 |
| `jasmine-core` | 5.4.0 |
| `karma` | 6.4.0 |

---

## 18. Segurança

### Implementado
- **Autenticação**: JWT + Refresh Token (HttpOnly cookies não usados - token em signal/memory)
- **Interceptor**: Injeta `Authorization` header automaticamente
- **Guards**: Proteção de rotas admin (`authGuard` + `roleGuard`)
- **Endpoints Públicos**: Lista explícita no `JwtInterceptor.isPublicRequest()`
- **Refresh Token**: Automático em 401 (single-flight via `BehaviorSubject`)
- **Logout em 403**: Limpa estado + redirect login

### Ausente / Atenção
- **Token Storage**: Apenas em memória (signal) + `localStorage` apenas para `user` — token **não** persiste no localStorage (bom para segurança, ruim para refresh após reload)
- **HttpOnly Cookies**: Não utilizado (backend retorna token no body)
- **CSP**: Não configurado
- **Rate Limiting**: Não implementado no frontend
- **XSS**: Angular sanitiza interpolation (`{{ }}`), mas `innerHTML` não usado

---

## 19. Acessibilidade

### Implementado
| Recurso | Onde |
|---------|------|
| **ARIA Labels** | `ImageGalleryComponent` (thumbnails: `aria-label`, `aria-current`), `ModalComponent` (`aria-label="Fechar modal"`, `aria-modal="true"`, `role="dialog"`), `TableComponent` (`role="grid"`, `aria-label` checkboxes) |
| **Navegação Teclado** | `ImageGalleryComponent`: ESC (fecha), ←/→ (navega), Enter/Space (seleciona thumbnail); `ModalComponent`: ESC (fecha), Tab order; `TableComponent`: Enter/Click row |
| **Focus Management** | `MatDialogModule` gerencia focus trap; `HostListener('keydown.escape')` |
| **Labels Formulários** | `mat-label` + `mat-error` + `mat-hint` + `aria-describedby` no `SelectComponent` |
| **Contraste** | Tailwind `text-gray-900`/`text-gray-500`/`bg-white` — atende WCAG AA |

### Parcial / Ausente
- **Skip Links**: Não implementado
- **Landmarks**: `<header>`, `<main>`, `<footer>` presentes
- **Live Regions**: `NotificationService` usa toast (não `aria-live`)
- **Reduced Motion**: Não respeita `prefers-reduced-motion` (animações CSS fixas)

---

## 20. Responsividade

### Breakpoints (Tailwind)
| Breakpoint | Classes | Comportamento Menu |
|------------|---------|-------------------|
| **Mobile** (<640px) | `grid-cols-1`, `flex-col`, `sm:w-64` | 1 coluna cards, header stacked, chips scroll horizontal |
| **Tablet** (640-1024px) | `sm:grid-cols-2`, `sm:flex-row`, `sm:w-auto` | 2 colunas, header inline, chips wrap |
| **Desktop** (1024-1280px) | `lg:grid-cols-3` | 3 colunas |
| **XL** (>1280px) | `xl:grid-cols-4` | 4 colunas |

### Componentes Adaptativos
- **Header**: `flex-col sm:flex-row` + `gap-4`
- **Busca**: `flex-1 sm:w-64`
- **Grid Pratos**: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
- **Footer**: `grid-cols-1 md:grid-cols-3`
- **Modais**: `max-w-sm/md/lg/xl/4xl` + `max-h-[calc(100vh-200px)]` + scroll interno
- **Fullscreen Gallery**: `max-h-[80vh] max-w-[90vw]`

### CSS Utilities
- `line-clamp-1/2` para truncamento texto
- `aspect-[4/3]` para imagens consistentes
- `overflow-x-auto` + `scrollbar-thin-custom` para thumbnails
- `sticky top-0` header

---

## 21. Regras de Negócio

| Regra | Origem | Descrição |
|-------|--------|-----------|
| Apenas pratos ativos (`active: true`) aparecem no cardápio | Frontend (`filteredDishes()`) + Backend (filtro) |
| Apenas categorias com pratos ativos são exibidas | Frontend (`categoriesWithDishes()` computed) |
| Ordenação por `displayOrder` asc | Frontend (sort) + Backend (persistência) |
| Apenas imagens do prato (`dish.images[]`) | Frontend mapeia `item.images` |
| Preço formato BRL (R$ 00,00) | Frontend (`toFixed(2).replace('.', ',')`) |
| Busca case-insensitive por nome/descrição | Frontend (`toLowerCase().includes()`) |
| Filtro categoria por `categoryId` | Frontend (`dish.categoryId === selectedCategory()`) |
| Galeria só abre se `images.length > 1` | Frontend (`@if (dish.images.length > 1)`) |
| Imagem principal marcada `isMain` | Frontend (badge "Principal", star icon) |
| Horários: dia 0=Domingo...6=Sábado | Frontend (`getDayName()` array) |
| Copyright ano dinâmico | Frontend (`currentYear()` → `new Date().getFullYear()`) |
| Loading mínimo 500ms | Frontend (`setTimeout(() => loading.set(false), 500)`) |

---

## 22. Limitações Conhecidas

| Área | Status | Observação |
|------|--------|------------|
| **Carrinho/Pedido** | ❌ Não implementado | Botão "Adicionar" apenas exibe toast; sem serviço de carrinho, persistência, checkout |
| **MatSort** | ❌ Removido | Causava NG8002; ordenação manual no componente pai |
| **Testes** | ❌ 0 testes | Nenhum spec implementado |
| **Refresh Token Persistência** | ⚠️ Parcial | Token só em memória; reload perde sessão |
| **CSP/Security Headers** | ❌ Não configurado | Frontend não define CSP |
| **PWA/Offline** | ❌ Não implementado | Sem Service Worker |
| **i18n** | ❌ Apenas PT-BR | Hardcoded strings PT-BR |
| **A11y Reduced Motion** | ❌ Não respeita | Animações CSS fixas |
| **Image Upload (Público)** | ❌ Apenas Admin | `ImageUploadComponent` só em `DishFormComponent` (admin) |
| **Lazy Load Imagens** | ✅ Parcial | `loading="lazy"` nas imagens cards/galeria |
| **Error Boundary** | ❌ Não implementado | Erro em componente quebra toda view |
| **Skeleton Realista** | ⚠️ Parcial | 8 cards fixos, não baseado em dados reais |

---

## 23. Débitos Técnicos

| Prioridade | Item | Impacto |
|------------|------|---------|
| **Alta** | Zero testes unitários | Impossível refatorar com segurança |
| **Alta** | Token não persiste | Usuário perde sessão ao recarregar página |
| **Alta** | `MatSort` removido | Ordenação tabela admin não funciona |
| **Média** | `addToOrder()` mock | Funcionalidade core (pedido) não existe |
| **Média** | Strings hardcoded PT-BR | Impede i18n futuro |
| **Média** | `NotificationService` não usa `aria-live` | Screen readers não anunciam toasts |
| **Baixa** | `reduced-motion` não respeitado | Animações podem causar desconforto |
| **Baixa** | `ImageGalleryComponent` usa `document.body.style.overflow` | Side effect global, não SSR-safe |
| **Baixa** | CSS animations no `ModalComponent` (não Angular animations) | Menos controlável, sem callbacks nativos |
| **Baixa** | `MenuComponent` > 400 linhas | Viola SRP — poderia separar em sub-components |

---

## 24. Histórico da Refatoração (Modais)

### Arquitetura Anterior
- `ModalComponent` genérico com `<ng-content>` (content projection)
- Componentes pais passavam templates complexos (`<form>`, `@for`, componentes aninhados) como children
- **Problema**: Angular 17+ parser (NG5002) não consegue parsear content projection com control flow (`@if`, `@for`, `<form>`) dentro de `<app-modal>`

### Arquitetura Atual
- `ModalComponent` = **Host** com variants via `@if (variant() === '...')`
- Cada variant injeta componente dedicado inline (`CatFormComponent`, `DishFormComponent`, etc.)
- **Elimina** content projection problemática
- Cada wrapper encapsula seu próprio form, validação, lógica

### Componentes Criados
| Componente | Finalidade |
|------------|------------|
| `CatFormComponent` | Form Categoria (create/edit) |
| `DishFormComponent` | Form Prato (tabs + image upload) |
| `UserFormComponent` | Form Usuário |
| `DelConfirmComponent` | Confirmação exclusão |
| `ReorderWrapperComponent` | Drag-drop reorder |

### Componentes Legados (Mantidos p/ compatibilidade)
- `category-modal.component.ts`, `dish-modal.component.ts`, `user-modal.component.ts`, `reorder-modal.component.ts`, `delete-confirm-modal.component.ts` — **não utilizados** no código atual

### Motivo Técnico
- NG5002: "Opening tag not terminated" / "Unexpected closing tag" — parser Angular não consegue resolver `<ng-content>` com `@if`/`@for`/componentes aninhados
- Solução: **Inlining** — mover conteúdo para componente dedicado, remover `<ng-content>`

### Impacto Funcional
- ✅ Build passa (NG5002 eliminado)
- ✅ Mesma UX visual
- ✅ Melhor encapsulamento (cada form gerencia sua validação)
- ⚠️ `ModalComponent` cresceu (agora importa todos os variants)

---

## 25. Status Atual

| Área | Status | Observação |
|------|--------|------------|
| Categorias (Público) | ✅ Implementado | Listagem, filtro, busca, ordenação |
| Pratos (Público) | ✅ Implementado | Listagem, busca, filtro, galeria, detalhes |
| Ordenação (Admin) | ✅ Implementado | Drag-drop + persistência API |
| Formulários (Admin) | ✅ Implementado | Reactive Forms + validação |
| Modais | ✅ Implementado | Architecture refatorada (inline variants) |
| Tabelas (Admin) | ⚠️ Parcial | Sem MatSort (NG8002) |
| Autenticação | ✅ Implementado | JWT + Refresh + Guards |
| Testes | ❌ Ausente | 0 specs |
| Build | ✅ Passando | `npm run build` OK |
| Responsividade | ✅ Implementado | 4 breakpoints Tailwind |

---

## 26. Checklist de Validação

| Item | Verificado |
|------|------------|
| ✅ Build | `npm run build` → PASS |
| ❌ Testes unitários | 0 specs |
| ✅ Categorias | Listagem, filtro, busca |
| ✅ Pratos | Listagem, busca, galeria, detalhes |
| ✅ CRUD (Admin) | Create/Read/Update/Delete + Toggle Active |
| ✅ Ordenação | Drag-drop + API persist |
| ✅ Modais | Refatorados (inline variants, NG5002 fixed) |
| ✅ Validações | Reactive Forms + Validators |
| ✅ Autenticação | JWT + Refresh + Guards + Public endpoints |
| ✅ Tratamento de erros | NotificationService + Interceptor |
| ✅ Responsividade | 4 breakpoints Tailwind |
| ⚠️ Acessibilidade | ARIA básico, keyboard nav, contrast OK; falta reduced-motion, aria-live |
| ✅ API | Endpoints mapeados, tipados, error handling |

---

## Caminho do Arquivo
`D:\Projetos\restaurante\frontend\README.md`

---

**Documentação gerada com base na implementação real (commit `4b36cff`)** — não contém funcionalidades inventadas ou planejadas sem evidência no código.