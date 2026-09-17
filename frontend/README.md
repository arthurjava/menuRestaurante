# Restaurante - Frontend (Angular 21)

Frontend do sistema de cardápio de restaurante construído com Angular 21, Signals, Angular Material 21 e Tailwind CSS.

## 🚀 Tecnologias

- **Angular 21** - Standalone components, Signals, nova sintaxe de controle de fluxo
- **TypeScript 5.9** - Strict mode habilitado
- **Angular Material 21** - Componentes UI acessíveis
- **Tailwind CSS 3.4** - Estilização utility-first
- **RxJS 7.8** - Programação reativa
- **Jest** - Testes unitários
- **ESLint + Prettier** - Linting e formatação

## 📁 Estrutura do Projeto

```
src/app/
├── core/                    # Singleton services, guards, interceptors
│   ├── auth.guard.ts       # Auth guard (CanActivateFn)
│   ├── jwt.interceptor.ts  # JWT HTTP Interceptor
│   ├── role.guard.ts       # Role-based guard
│   ├── models/             # Interfaces compartilhadas
│   └── services/           # AuthService, ApiService, NotificationService, LoadingService, ImageUploadService
├── shared/                 # Componentes/diretivas/pipes reutilizáveis
│   ├── components/         # Button, Input, Select, Modal, Table, ImageUpload, ImageGallery, Badge
│   ├── directives/         # (futuras)
│   ├── pipes/              # (futuras)
│   ├── validators/         # (futuras)
│   └── paginators/         # PtBrPaginatorIntl
├── features/               # Lazy-loaded feature modules
│   ├── auth/               # Login, Register
│   ├── dashboard/          # Dashboard admin
│   ├── categories/         # CRUD Categorias + drag-drop reorder
│   ├── dishes/             # CRUD Pratos + gallery + reorder + upload
│   ├── users/              # Gestão Usuários (admin)
│   ├── menu/               # Cardápio público responsivo
│   └── settings/           # Configurações (restaurant-info, business-hours, contact, profile)
├── layout/                 # Header, Sidebar, Footer (futuras)
├── app.routes.ts           # Rotas principais com lazy loading
├── app.config.ts           # Providers globais
└── app.component.ts        # Root component
```

## 🛠️ Comandos Disponíveis

```bash
# Instalar dependências
npm install

# Desenvolvimento
npm start           # ng serve (porta 4200)
npm run watch       # build watch mode

# Build
npm run build       # Build produção (dist/)
npm run build:dev   # Build desenvolvimento

# Testes
npm run test        # Jest unitários
npm run test:watch  # Jest watch mode
npm run test:coverage # Cobertura de testes

# Qualidade
npm run lint        # ESLint + Prettier check
npm run format      # Prettier write
```

## 🔐 Autenticação

- **JWT Interceptor** adiciona `Authorization: Bearer <token>` automaticamente
- **Access Token** armazenado em memory (Signal no AuthService)
- **Refresh Token** em HttpOnly cookie (gerenciado pelo backend)
- **Guards**: `authGuard` + `roleGuard` para proteção de rotas

## 🎨 Componentes Shared

| Componente | Descrição |
|------------|-----------|
| `ButtonComponent` | Variantes (primary, secondary, danger, outline, ghost), sizes, loading, icon |
| `InputComponent` | Label, error, prefix/suffix icons, contador, validação |
| `SelectComponent` | Search, multiple, grupos, compareWith customizado |
| `ModalComponent` | Confirm, form, sizes (sm, md, lg, xl, full), header/footer customizáveis |
| `TableComponent` | Sort, paginação, seleção, actions, empty state, loading |
| `ImageUploadComponent` | Drag-drop, preview, progress, reorder (CDK), primary image, validação client-side |
| `ImageGalleryComponent` | Thumbnails, fullscreen modal, navegação teclado, contador |
| `BadgeComponent` | Variants (success, warning, danger, info, gray, primary), sizes, dot, count |

## 📱 Features

### Auth (Lazy Loaded)
- `/auth/login` - Login com validação
- `/auth/register` - Registro com seleção de role

### Dashboard (Admin)
- Stats cards (categorias, pratos, usuários)
- Atividade recente
- Ações rápidas

### Categories (Admin)
- CRUD completo
- Drag-drop reorder
- Toggle ativo/inativo
- Busca e filtros

### Dishes (Admin)
- CRUD multi-step (tabs: Info Básicas + Imagens)
- Upload múltiplo com preview e progress
- Galeria de imagens com reorder
- Definir imagem principal
- Drag-drop reorder de pratos
- Filtros por categoria, status, busca

### Users (Admin)
- CRUD usuários
- Roles: ADMIN, MANAGER, STAFF
- Reset de senha com senha temporária
- Proteção contra auto-exclusão

### Menu Público
- Responsivo (mobile-first)
- Filtro por categorias (chips)
- Busca em tempo real
- Modal de detalhes do prato
- Galeria de imagens fullscreen
- Footer com info do restaurante

### Settings (Admin)
- **Restaurant Info**: Nome, slogan, descrição, logo, cover
- **Business Hours**: Horários por dia da semana, toggle fechado
- **Contact Info**: Telefone, email, endereço, redes sociais
- **Profile**: Avatar, nome, email, alteração de senha

## 🐳 Docker

```bash
# Desenvolvimento
docker compose -f docker-compose.dev.yml up frontend

# Produção
docker compose -f docker-compose.prod.yml up frontend
```

## 📝 Convenções de Código

- **Standalone Components** obrigatórios
- **Signals** para estado local (`signal`, `computed`, `effect`)
- **OnPush** change detection em todos componentes
- **Reactive Forms** com `FormBuilder`
- **Lazy Loading** em todas features
- **Tailwind** para layout/spacing, **Material** para componentes complexos
- **Tipagem estrita** - sem `any`, usar interfaces
- **Inputs/Outputs** com `input()`/`output()` (Angular 21+)

## 🔗 Backend API

Espera backend Spring Boot em `http://localhost:8080/api` (dev) ou `/api` (prod).

Endpoints principais:
- `POST /auth/login`, `POST /auth/register`, `POST /auth/refresh`
- `GET/POST /categories`, `PUT/DELETE /categories/{id}`, `PUT /categories/reorder`
- `GET/POST /dishes`, `PUT/DELETE /dishes/{id}`, `POST /dishes/{id}/images`
- `GET/POST /users`, `PUT/DELETE /users/{id}`
- `GET /menu`, `GET /menu/categories`
- `GET/PUT /settings/*`