# Testes — Estratégia e Estado Atual

## Estado Atual: **Nenhum Teste Implementado**

### Backend

- **Diretório**: `backend/src/test/` — **Não existe**
- **Dependencies no pom.xml**: Nenhuma dependência de teste explícita (Spring Boot Starter Test vem transitivo via parent)
- **Plugins**: `spring-boot-maven-plugin` com exclusão do lombok
- **Comando**: `mvn test` — rodaria mas não encontra testes

### Frontend

- **Arquivo**: `frontend/src/test.ts` — Existe (configuração Karma padrão)
- **Diretório**: `frontend/src/app/**/*.spec.ts` — **Nenhum arquivo encontrado**
- **Karma**: Configurado em `karma.conf.js`
- **Dependencies**: `jasmine-core`, `karma`, `karma-chrome-launcher`, `karma-coverage`, `karma-jasmine`, `karma-jasmine-html-reporter`
- **Comando**: `npm test` — roda Karma mas não encontra specs

## Frameworks Disponíveis

### Backend (Spring Boot 3.5)

| Framework | Disponível | Uso Recomendado |
|-----------|------------|-----------------|
| JUnit 5 (Jupiter) | ✅ Via spring-boot-starter-test | Testes unitários |
| Mockito | ✅ Via spring-boot-starter-test | Mocks |
| AssertJ | ✅ Via spring-boot-starter-test | Assertions fluent |
| Spring Boot Test | ✅ | Testes de integração (@SpringBootTest) |
| Testcontainers | ❌ Não no pom.xml | Testes com banco real |
| REST Assured | ❌ Não no pom.xml | Testes de API REST |
| MockMvc | ✅ Via spring-boot-starter-test | Testes de controllers |

### Frontend (Angular 21)

| Framework | Disponível | Uso Recomendado |
|-----------|------------|-----------------|
| Jasmine | ✅ | Testes unitários |
| Karma | ✅ | Test runner |
| Angular Testing Utilities | ✅ | TestBed, ComponentFixture |
| TestBed | ✅ | Configuração de módulos de teste |
| HttpTestingController | ✅ | Mock HTTP |

## Estrutura Recomendada

### Backend

```
backend/src/test/java/com/restaurante/
├── controller/
│   ├── AuthControllerTest.java
│   ├── CategoryControllerTest.java
│   └── DishControllerTest.java
├── service/
│   ├── CategoryServiceTest.java
│   ├── DishServiceTest.java
│   ├── DishImageServiceTest.java
│   └── UserServiceTest.java
├── repository/
│   ├── CategoryRepositoryTest.java
│   ├── DishRepositoryTest.java
│   ├── UserRepositoryTest.java
│   └── DishImageRepositoryTest.java
├── security/
│   ├── JWTUtilTest.java
│   ├── JWTAuthFilterTest.java
│   └── UserDetailsServiceImplTest.java
├── mapper/
│   ├── CategoryMapperTest.java
│   ├── DishMapperTest.java
│   └── UserMapperTest.java
└── integration/
    ├── AuthIntegrationTest.java
    ├── CategoryIntegrationTest.java
    └── DishIntegrationTest.java
```

### Frontend

```
frontend/src/app/
├── core/
│   ├── services/
│   │   ├── auth.service.spec.ts
│   │   ├── api.service.spec.ts
│   │   └── notification.service.spec.ts
│   ├── guards/
│   │   ├── auth.guard.spec.ts
│   │   └── role.guard.spec.ts
│   └── interceptors/
│       └── jwt.interceptor.spec.ts
├── features/
│   ├── auth/
│   │   ├── login/login.component.spec.ts
│   │   └── register/register.component.spec.ts
│   ├── categories/
│   │   └── categories-list.component.spec.ts
│   ├── dishes/
│   │   └── dishes-list.component.spec.ts
│   └── ...
└── shared/
    └── components/
        ├── button/button.component.spec.ts
        ├── table/table.component.spec.ts
        └── ...
```

## Padrões de Teste Recomendados

### Backend - Unitários (JUnit 5 + Mockito)

```java
@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock CategoryRepository categoryRepository;
    @InjectMocks CategoryService categoryService;

    @Test
    void findById_whenExists_returnsCategory() {
        UUID id = UUID.randomUUID();
        Category category = Category.builder().id(id).name("Test").build();
        when(categoryRepository.findById(id)).thenReturn(Optional.of(category));

        Category result = categoryService.findById(id);

        assertThat(result).isEqualTo(category);
    }

    @Test
    void findById_whenNotExists_throwsResourceNotFoundException() {
        UUID id = UUID.randomUUID();
        when(categoryRepository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> categoryService.findById(id))
            .isInstanceOf(ResourceNotFoundException.class)
            .hasMessage("Categoria não encontrada");
    }
}
```

### Backend - Integração (@SpringBootTest + Testcontainers)

```java
@SpringBootTest
@Testcontainers
class CategoryIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @Autowired CategoryRepository categoryRepository;

    @Test
    void saveAndFindById() {
        Category category = Category.builder().name("Test").build();
        Category saved = categoryRepository.save(category);
        Optional<Category> found = categoryRepository.findById(saved.getId());
        assertThat(found).isPresent().get().extracting(Category::getName).isEqualTo("Test");
    }
}
```

### Backend - Controller (MockMvc)

```java
@WebMvcTest(CategoryController.class)
class CategoryControllerTest {

    @Autowired MockMvc mockMvc;
    @MockBean CategoryService categoryService;
    @MockBean CategoryMapper categoryMapper;

    @Test
    @WithMockUser(roles = "ADMIN")
    void listar_returnsOk() throws Exception {
        when(categoryService.findAllActive()).thenReturn(List.of());
        mockMvc.perform(get("/api/categories"))
            .andExpect(status().isOk());
    }
}
```

### Frontend - Services (Jasmine + TestBed)

```typescript
describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService, NotificationService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should login and set session', () => {
    const mockResponse = { accessToken: 'token123', user: { id: '1', email: 'test@test.com', name: 'Test', role: 'ADMIN', active: true } };
    
    service.login({ email: 'test@test.com', password: '123' }).subscribe();
    
    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
    
    expect(service.isLoggedIn()).toBeTrue();
    expect(service.getAccessToken()).toBe('token123');
  });
});
```

### Frontend - Components

```typescript
describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', ['login']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

### Frontend - Interceptors

```typescript
describe('JwtInterceptor', () => {
  let interceptor: JwtInterceptor;
  let httpMock: HttpTestingController;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', ['getAccessToken', 'refreshToken', 'logout', 'isLoggedIn']);
    
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        JwtInterceptor,
        { provide: AuthService, useValue: authSpy },
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
      ]
    });

    interceptor = TestBed.inject(JwtInterceptor);
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  it('should add Authorization header for private endpoints', () => {
    authService.getAccessToken.and.returnValue('token123');
    
    TestBed.inject(HttpClient).get('/api/dishes').subscribe();
    
    const req = httpMock.expectOne('/api/dishes');
    expect(req.request.headers.get('Authorization')).toBe('Bearer token123');
  });
});
```

## Comandos de Validação

### Backend

```bash
# Testes unitários
mvn test

# Testes + verificação (inclui integration tests se existirem)
mvn verify

# Cobertura (requer plugin jacoco)
mvn jacoco:report
```

### Frontend

```bash
# Testes unitários (watch mode)
npm test

# Testes CI (single run)
npm test -- --watch=false --browsers=ChromeHeadless

# Cobertura
npm test -- --watch=false --code-coverage
```

## Prioridades de Implementação

### Alta Prioridade (Crítico)

1. **AuthControllerTest** - Login, register, validação de token
2. **JWTUtilTest** - Geração, parsing, validação de token
3. **JWTAuthFilterTest** - Filtro de autenticação
4. **UserDetailsServiceImplTest** - Carregamento de usuário
5. **AuthService.spec.ts** - Login, logout, refresh, guards
6. **JwtInterceptor.spec.ts** - Headers, 401 handling, refresh flow

### Média Prioridade

7. **Category/Dish Service Tests** - Regras de negócio, validações FK
8. **Repository Tests** - Query methods, constraints
9. **Controller Tests** - Serialização, status codes, validação
10. **ApiService.spec.ts** - Métodos CRUD, error handling

### Baixa Prioridade

11. **Mapper Tests** - Conversão Entity↔DTO
12. **Component Tests** - UI logic
13. **Integration Tests** - Fluxos completos

## Observações

### Testcontainers

- Não configurado no pom.xml
- Recomendado para testes de integração com PostgreSQL real
- Adicionar:
  ```xml
  <dependency>
      <groupId>org.testcontainers</groupId>
      <artifactId>junit-jupiter</artifactId>
      <scope>test</scope>
  </dependency>
  <dependency>
      <groupId>org.testcontainers</groupId>
      <artifactId>postgresql</artifactId>
      <scope>test</scope>
  </dependency>
  ```

### Perfil de Teste

- Criar `application-test.yml` com:
  - H2 em memória ou Testcontainers PostgreSQL
  - `ddl-auto: create-drop`
  - `show-sql: false`
  - JWT secret fixo para testes

### Cobertura Mínima Alvo

- Services: 80%+
- Controllers: 70%+
- Security: 90%+
- Mappers: 50%+ (gerados)
- Frontend Services/Interceptors: 80%+

## Confiança

**Baixa** — Estado atual sem testes. Documentação baseada em padrões recomendados para a stack, não em código existente.

## Data

2026-09-18