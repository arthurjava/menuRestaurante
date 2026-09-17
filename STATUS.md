# Status do Projeto - Sistema de Cardápio de Restaurante

**Última atualização**: 2026-09-17 (Java 25 / Angular 21 upgrade)

---

## 📊 Resumo Executivo

O projeto está **funcionalmente completo no backend** e **estrutura do frontend criada** para desenvolvimento. O frontend Angular 21 possui todos os componentes, services, guards e features implementados, mas **pendente de correção de erros de build** (TypeScript/template) para validação completa. Faltando apenas infraestrutura de deploy final (SSL, backup, DNS, monitoramento avançado) e validação do build do frontend.

---

## ✅ Concluído (Core Funcional)

### Backend (Spring Boot 3.5.x + Java 25)
- [x] Spring Security + JWT (access token 24h, refresh token 7d em HttpOnly cookie)
- [x] Entidades JPA: User, Category, Dish, DishImage + Role enum
- [x] Repositories + Services + Controllers REST completos
- [x] Flyway migrations (4 tabelas + admin user)
- [x] Upload de imagens (validação tipo/tamanho, múltiplas por prato)
- [x] Bean Validation + Global Exception Handler
- [x] Springdoc OpenAPI (Swagger UI)
- [x] Perfis dev/prod configurados

### Frontend (Angular 21 + Signals) — Estrutura Criada / Build Pendente
- [x] Auth: Login, Register, Guards, JWT Interceptor, Token Storage
- [x] Core: ApiService, NotificationService, LoadingService, ImageUploadService
- [x] Shared Components: Button, Input, Select, Modal, Table, ImageUpload, ImageGallery, Badge
- [x] Features (Lazy Loaded):
  - Auth (login/register)
  - Dashboard (stats, activity)
  - Categories (CRUD + drag-drop reorder + upload)
  - Dishes (CRUD multi-step tabs + galeria + reorder)
  - Users (CRUD admin)
  - Menu Público (responsivo, modal detalhes, filtro categoria, busca)
  - Settings (restaurant-info, business-hours, contact-info, profile)
- [x] Tailwind CSS + Angular Material 21
- [⚠️] **Build falhando**: Erros TypeScript/template (boolean inputs, modal nesting, missing properties, $index, new Date() em templates) — correção necessária antes de `npm run build` passar

### Infraestrutura & DevOps
- [x] Docker Compose dev (backend + PostgreSQL)
- [x] Docker Compose prod (backend + PostgreSQL + frontend + Nginx)
- [x] Dockerfiles multi-stage (prod: eclipse-temurin:25 / node:22 + Nginx Alpine)
- [x] Nginx reverse proxy (proxy_pass para backend, SPA fallback)
- [x] Variáveis de ambiente (.env.example)
- [x] Spring Boot Actuator (health, info, metrics)
- [x] Testes: JUnit5 + Mockito (backend), Jest (frontend — estrutura criada, pendente execução após correção de build)
- [x] GitHub Actions CI/CD (build + test)

---

## 🎯 Próximos Passos Finais (Produção)

| Item | Status | Prioridade |
|------|--------|------------|
| HTTPS/SSL (Let's Encrypt via Nginx) | ⏳ Pendente | Alta |
| Pipeline deploy produção (GitHub Actions) | ⏳ Pendente | Alta |
| Estratégia backup PostgreSQL | ⏳ Pendente | Média |
| Configuração domínio/DNS | ⏳ Pendente | Média |
| Monitoramento avançado (Prometheus/Grafana) | ⏳ Pendente | Baixa |

---

## 📦 Versões Principais

| Componente | Versão |
|------------|--------|
| Java | 25.0.4.1 |
| Spring Boot | 3.5.x |
| Spring Framework | 6.2.x |
| PostgreSQL | 16.x |
| Angular | 21.x |
| Angular Material | 21.x |
| TypeScript | 5.9.x |
| Node | 22.x |
| Maven | 3.9.x |

---

## 🔗 Endpoints Principais (Base: `/api`)

| Recurso | Endpoints |
|---------|-----------|
| Auth | `POST /auth/login`, `POST /auth/register`, `POST /auth/refresh`, `GET /auth/me` |
| Categorias | `GET/POST /categories`, `GET/PUT/DELETE /categories/{id}`, `PUT /categories/reorder` |
| Pratos | `GET/POST /dishes`, `GET/PUT/DELETE /dishes/{id}`, `POST /dishes/{id}/images` |
| Menu Público | `GET /menu`, `GET /menu/categories` |
| Usuários (Admin) | `GET/POST /users`, `GET/PUT/DELETE /users/{id}` |

---

## 📝 Observações

- Build backend validado localmente
- **Frontend: estrutura completa criada (Angular 21, Signals, Material 21, Tailwind), mas build falha com erros TypeScript/template — correção necessária**
- Testes de integração frontend-backend **pendentes de validação** (aguardam build do frontend)
- Arquitetura segue separação Controller → Service → Repository → Entity
- DTOs + MapStruct para isolamento de contratos
- Lazy loading em relacionamentos JPA (N+1 mitigado com fetch joins onde necessário)