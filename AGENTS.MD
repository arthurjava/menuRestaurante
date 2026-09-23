# AGENTS.md

## 1. Objetivo

Este arquivo define as regras, restrições e padrões que devem ser seguidos por agentes de IA durante análise, desenvolvimento, refatoração, correção de bugs, testes e manutenção deste projeto.

As regras deste arquivo são obrigatórias, salvo quando o usuário fornecer uma instrução explícita que as substitua.

O agente deve priorizar:

1. Correção funcional.
2. Segurança.
3. Compatibilidade com a arquitetura existente.
4. Manutenibilidade.
5. Testabilidade.
6. Qualidade de código.
7. Alterações mínimas e justificadas.

---

# 2. Stack Tecnológica

## Backend

* Java **25.0.4.1** (language level 25)
* Spring Boot **3.5.x**
* Spring Framework **6.2.x**
* Spring Security **6.x** (compatível com Spring Boot 3.5.x)
* JWT
* Spring Data JPA
* Hibernate (versão gerenciada pelo Spring Boot)
* Maven
* PostgreSQL

## Infraestrutura

* Docker
* Docker Compose
* Containers
* Networks
* Volumes
* Variáveis de ambiente
* **Imagem base backend: eclipse-temurin:25**
* **Imagem base frontend: node:22**

## Frontend

* Angular **21.x**
* Angular Material **21.x**
* Angular CLI **21.x**
* TypeScript **5.9.x**
* Node.js **22.x**
* HTML
* CSS/SCSS

---

# 3. Regra Fundamental: Investigar Antes de Alterar

Nunca modificar código imediatamente com base apenas no sintoma apresentado.
Sempre verifique se existe algum container rodando no docker e se as portas estão liberadas para uso

Antes de realizar alterações:

1. Identificar o comportamento observado.
2. Reproduzir o problema quando possível.
3. Localizar os componentes envolvidos.
4. Investigar dependências e fluxo de execução.
5. Identificar a causa raiz.
6. Verificar se existe implementação semelhante no projeto.
7. Avaliar possíveis efeitos colaterais.
8. Somente então implementar a alteração.

Não utilizar soluções temporárias apenas para fazer um erro desaparecer.

### Proibido

* Alterar código sem investigar a causa.
* Aplicar workaround sem explicar sua necessidade.
* Remover funcionalidades para eliminar erros.
* Desabilitar mecanismos de segurança.
* Reescrever componentes inteiros sem necessidade.
* Introduzir dependências sem justificativa.
* Alterar contratos existentes sem avaliar impacto.

---

# 4. Arquitetura

Respeitar a arquitetura existente do projeto.

Antes de criar uma nova classe, pacote, serviço ou componente:

* procurar implementações existentes;
* identificar padrões já utilizados;
* reutilizar abstrações existentes quando apropriado;
* evitar duplicação;
* manter responsabilidades bem definidas.

## Separação de responsabilidades

Evitar concentrar múltiplas responsabilidades em uma única classe.

Quando aplicável, manter separação entre:

```text
Controller
    ↓
Service
    ↓
Repository
    ↓
Entity
```

DTOs podem ser utilizados entre camadas quando necessário para preservar contratos e encapsulamento.

Não expor entidades JPA diretamente em APIs REST quando isso comprometer o contrato, segurança ou manutenção da aplicação.

---

# 5. Princípios de Design

Aplicar, quando apropriado:

* SOLID
* DRY
* KISS
* Separation of Concerns
* Dependency Inversion
* Composition over Inheritance

Utilizar Design Patterns somente quando houver justificativa arquitetural.

Não introduzir padrões apenas para aumentar a complexidade do código.

Priorizar:

* baixo acoplamento;
* alta coesão;
* responsabilidades bem definidas;
* código testável;
* dependências explícitas.

---

# 6. Backend Java / Spring Boot

## Controllers

Controllers devem:

* receber requisições HTTP;
* validar entrada;
* delegar regras de negócio;
* retornar respostas HTTP apropriadas.

Evitar colocar regras de negócio complexas em Controllers.

## Services

Services devem concentrar regras de negócio.

Evitar:

* acesso HTTP direto;
* lógica de apresentação;
* código específico de infraestrutura quando não necessário.

## Repositories

Repositories devem concentrar acesso aos dados.

Utilizar adequadamente:

* Spring Data JPA;
* JPQL;
* queries derivadas;
* `@Query`;
* Specifications;
* Criteria API quando apropriado.

Evitar consultas desnecessariamente complexas.

---

# 7. DTOs

Utilizar DTOs quando apropriado para:

* requests;
* responses;
* isolamento das entidades;
* controle de campos expostos;
* evolução de contratos;
* validação de entrada.

Não expor automaticamente todos os atributos das entidades.

Avaliar especialmente:

* campos sensíveis;
* relacionamentos;
* informações internas;
* dados utilizados apenas pela persistência.

---

# 8. Validação

Utilizar Bean Validation quando apropriado.

Exemplos:

```java
@NotNull
@NotBlank
@Size
@Email
@Pattern
@Valid
```

A validação deve ocorrer no nível apropriado.

Não duplicar validações desnecessariamente entre Controller e Service.

Regras de negócio que não podem ser expressas adequadamente por Bean Validation devem permanecer na camada de domínio/serviço apropriada.

---

# 9. Tratamento de Exceções

Utilizar tratamento global de exceções quando existente.

Preferir:

```java
@RestControllerAdvice
```

Manter respostas de erro consistentes.

Não utilizar:

```java
try {
    ...
} catch (Exception e) {
    // ignorar
}
```

Não engolir exceções silenciosamente.

Exceções devem:

* possuir contexto suficiente para diagnóstico;
* não expor informações sensíveis;
* possuir HTTP status apropriado;
* manter contrato consistente da API.

---

# 10. Transações

Utilizar transações de forma explícita e adequada.

Quando necessário:

```java
@Transactional
```

Avaliar cuidadosamente:

* atomicidade;
* propagação;
* isolamento;
* operações de leitura;
* operações de escrita;
* lazy loading;
* duração da transação.

Evitar transações excessivamente abrangentes.

Não utilizar `@Transactional` indiscriminadamente.

---

# 11. REST

Manter os contratos REST existentes.

Antes de modificar uma API:

1. localizar Controller;
2. localizar DTOs;
3. localizar Service;
4. localizar consumidores;
5. verificar testes;
6. avaliar compatibilidade.

Evitar alterações incompatíveis sem autorização explícita.

Respeitar semântica HTTP.

Exemplos:

```text
GET     → consulta
POST    → criação
PUT     → substituição/atualização
PATCH   → atualização parcial
DELETE  → remoção
```

Utilizar status HTTP apropriados.

Não retornar `200 OK` para qualquer situação apenas para simplificar o frontend.

---

# 12. Segurança

A autenticação da aplicação utiliza JWT e Spring Security.

A segurança existente deve ser preservada.

## Nunca

* remover autenticação;
* remover autorização;
* utilizar `permitAll()` como workaround;
* desabilitar filtros;
* desabilitar `SecurityFilterChain`;
* remover validação JWT;
* ignorar `SecurityContext`;
* expor credenciais;
* expor secrets;
* registrar tokens JWT nos logs;
* registrar senhas nos logs;
* inserir credenciais diretamente no código;
* desabilitar mecanismos de segurança apenas para fazer testes passarem.

---

# 13. Diagnóstico de 401 / 403

Erros `401 Unauthorized` e `403 Forbidden` devem ser investigados sistematicamente.

Verificar, conforme aplicável:

1. `SecurityFilterChain`
2. filtros customizados
3. JWT
4. assinatura do token
5. expiração do token
6. claims
7. `Authentication`
8. `SecurityContext`
9. `AuthenticationProvider`
10. `UserDetailsService`
11. authorities
12. roles
13. `@PreAuthorize`
14. `@Secured`
15. regras de autorização
16. CORS
17. CSRF
18. headers HTTP
19. origem da requisição
20. configuração do frontend

Não corrigir `401/403` simplesmente adicionando:

```java
.permitAll()
```

ou removendo autenticação.

A causa raiz deve ser identificada.

---

# 14. JWT

Ao investigar problemas relacionados a JWT, verificar:

* presença do token;
* formato `Bearer`;
* assinatura;
* algoritmo;
* secret/key;
* issuer;
* audience;
* expiração;
* claims;
* authorities;
* parsing;
* filtro JWT;
* ordem dos filtros;
* criação do `Authentication`;
* preenchimento do `SecurityContext`.

Nunca registrar o JWT completo nos logs.

Quando necessário para diagnóstico, registrar somente informações não sensíveis, como:

```text
token presente: true
token expirado: false
subject: usuario-x
authorities: [ROLE_USER]
```

Nunca registrar:

```text
Authorization: Bearer eyJ...
```

---

# 15. CORS

Problemas de CORS devem ser tratados na configuração apropriada.

Verificar:

* origem;
* métodos;
* headers;
* credentials;
* preflight `OPTIONS`;
* configuração Spring Security;
* configuração Spring MVC;
* proxy/reverse proxy;
* frontend Angular.

Não resolver CORS desabilitando segurança globalmente.

Evitar:

```text
Access-Control-Allow-Origin: *
```

quando a aplicação utiliza credenciais.

---

# 16. CSRF

Antes de desabilitar CSRF, analisar o modelo de autenticação e arquitetura da aplicação.

Se CSRF for desabilitado, a decisão deve ser tecnicamente justificada e compatível com o mecanismo de autenticação utilizado.

Não desabilitar CSRF simplesmente porque uma requisição está retornando erro.

---

# 17. Banco de Dados

Banco principal:

```text
PostgreSQL
```

Alterações de banco devem considerar:

* schema existente;
* tabelas existentes;
* constraints;
* foreign keys;
* índices;
* sequences;
* dados existentes;
* compatibilidade;
* migrações;
* rollback;
* performance.

Nunca executar alterações destrutivas sem autorização explícita.

### Proibido sem autorização

```sql
DROP TABLE
DROP DATABASE
TRUNCATE
DELETE FROM <tabela>
```

especialmente quando houver possibilidade de perda de dados.

---

# 18. JPA / Hibernate

Considerar:

* ciclo de vida das entidades;
* `EntityManager`;
* lazy/eager loading;
* N+1 queries;
* `fetch join`;
* cascades;
* orphan removal;
* cardinalidade;
* índices;
* paginação;
* dirty checking;
* contexto de persistência.

Evitar:

```java
FetchType.EAGER
```

sem justificativa.

Avaliar cuidadosamente relacionamentos bidirecionais para evitar:

* loops de serialização;
* payloads excessivos;
* consultas inesperadas;
* problemas de performance.

---

# 19. Performance

Não otimizar prematuramente.

Antes de otimizar:

1. identificar o gargalo;
2. medir;
3. formular hipótese;
4. aplicar alteração;
5. medir novamente.

Observar especialmente:

* N+1 queries;
* consultas sem índice;
* paginação;
* carregamento excessivo de entidades;
* chamadas HTTP redundantes;
* loops desnecessários;
* serialização;
* queries repetitivas.

---

# 20. Docker

Antes de modificar Docker ou Docker Compose, verificar:

* containers existentes;
* serviços;
* portas;
* volumes;
* networks;
* imagens;
* Dockerfiles;
* variáveis de ambiente;
* healthchecks;
* dependências entre serviços;
* ordem de inicialização.

Não remover volumes ou dados sem autorização explícita.

Nunca executar destruição indiscriminada como:

```bash
docker compose down -v
```

sem confirmar que a remoção dos volumes é desejada.

Preservar dados persistentes.

---

# 21. Configuração e Secrets

Não colocar secrets diretamente no código.

Nunca versionar:

```text
senha
token
JWT secret
API key
private key
credentials
```

Utilizar mecanismos apropriados de configuração:

```text
application.properties
application.yml
variáveis de ambiente
Docker secrets
secret managers
```

conforme a arquitetura existente.

Arquivos contendo secrets não devem ser adicionados ao Git.

---

# 22. Angular

Respeitar a arquitetura existente do frontend.

Antes de modificar componentes:

* localizar services;
* verificar interfaces/types;
* verificar interceptors;
* verificar guards;
* verificar rotas;
* verificar tratamento de erros;
* verificar autenticação;
* verificar gerenciamento de estado existente.

Não duplicar chamadas HTTP ou lógica de autenticação.

---

# 23. Autenticação no Angular

Verificar especialmente:

* interceptor HTTP;
* armazenamento do JWT;
* inclusão do header `Authorization`;
* refresh token, se existente;
* guards;
* tratamento de `401`;
* tratamento de `403`;
* CORS;
* URLs de API.

Formato esperado quando aplicável:

```http
Authorization: Bearer <JWT>
```

Nunca exibir ou registrar o JWT no console.

---

# 24. Testes

Após alterações relevantes no backend, executar:

```bash
mvn test
```

e, quando apropriado:

```bash
mvn verify
```

Para alterações no frontend, executar também o processo de validação/build definido pelo projeto.

---

# 25. Testes Unitários

Utilizar, quando aplicável:

* JUnit;
* Mockito;
* Spring Boot Test.

Testar principalmente:

* regras de negócio;
* casos de sucesso;
* casos de erro;
* validações;
* exceções;
* autorização quando relevante;
* comportamentos de fronteira.

Não criar testes artificiais apenas para aumentar cobertura.

Testes devem verificar comportamento.

---

# 26. Testes de Integração

Quando uma alteração envolver múltiplas camadas, considerar testes de integração.

Especialmente para:

* Controller + Security;
* JWT;
* Repository + PostgreSQL;
* transações;
* serialização;
* filtros;
* integração entre componentes.

Não substituir testes de integração por mocks quando o comportamento real da infraestrutura for parte importante do problema.

---

# 27. Build

Antes de considerar uma alteração concluída, verificar o build correspondente.

Backend:

```bash
mvn test
mvn verify
```

Frontend:

```bash
npm test
npm run build
```

Somente executar comandos realmente existentes no `package.json`.

Não inventar scripts.

---

# 28. Git

Utilizar Conventional Commits.

Exemplos:

```text
feat: adiciona autenticação JWT
fix: corrige autorização de endpoints
refactor: reorganiza camada de serviços
test: adiciona testes para autenticação
docs: atualiza documentação da API
chore: atualiza dependências
```

Respeitar o padrão de branches já utilizado pelo repositório.

---

# 29. Preservação de Alterações

Nunca descartar alterações existentes do usuário.

Antes de executar operações potencialmente destrutivas:

```bash
git reset
git restore
git checkout
git clean
```

verificar o estado do repositório.

Utilizar:

```bash
git status
git diff
```

quando necessário.

Nunca assumir que alterações não commitadas são lixo.

---

# 30. Dependências

Antes de adicionar uma dependência:

1. verificar se já existe solução no projeto;
2. verificar dependências existentes;
3. avaliar compatibilidade;
4. verificar impacto no build;
5. justificar a necessidade.

Evitar dependências redundantes.

Não atualizar versões major sem avaliar compatibilidade.

---

# 31. Alterações Mínimas

Preferir mudanças pequenas e localizadas.

Uma correção deve modificar somente o que for necessário para resolver o problema.

Evitar alterações não relacionadas, como:

* formatação global;
* renomeações em massa;
* reorganização completa de pacotes;
* atualização indiscriminada de dependências;
* refatoração não solicitada.

Se uma refatoração estrutural for necessária, explicar o motivo.

---

# 32. Revisão do Diff

Após modificar código:

```bash
git diff
```

Revisar:

* alterações inesperadas;
* código duplicado;
* imports;
* logs;
* secrets;
* mudanças de contrato;
* regressões;
* código temporário;
* TODOs introduzidos;
* arquivos modificados indevidamente.

Remover código de diagnóstico antes da conclusão.

---

# 33. Logs

Logs devem ser úteis para diagnóstico sem expor informações sensíveis.

Nunca registrar:

* senha;
* JWT;
* refresh token;
* API key;
* secret;
* credenciais;
* dados sensíveis desnecessários.

Preferir logs estruturados e contextualizados.

---

# 34. Tratamento de Erros

Ao encontrar um erro:

1. capturar a mensagem completa;
2. identificar o componente responsável;
3. localizar o primeiro ponto relevante da stack trace;
4. verificar configuração relacionada;
5. reproduzir;
6. formular hipótese;
7. testar a hipótese;
8. corrigir a causa raiz;
9. executar testes;
10. revisar o diff.

Não mascarar erros.

---

# 35. Ambiguidade

Quando uma instrução puder resultar em alterações incompatíveis ou destrutivas, solicitar esclarecimento.

Exemplos:

* alteração de contrato REST;
* alteração de schema destrutiva;
* remoção de dados;
* mudança de mecanismo de autenticação;
* alteração de infraestrutura;
* atualização major de framework;
* remoção de funcionalidade existente.

Quando houver uma opção segura e reversível, pode-se seguir por ela, desde que isso preserve a arquitetura existente.

---

# 36. Ordem de Execução Obrigatória

Para tarefas de desenvolvimento, seguir preferencialmente:

```text
1. CONTEXTUALIZAR
   ↓
2. INVESTIGAR
   ↓
3. IDENTIFICAR CAUSA RAIZ
   ↓
4. PLANEJAR ALTERAÇÃO
   ↓
5. IMPLEMENTAR
   ↓
6. TESTAR
   ↓
7. REVISAR DIFF
   ↓
8. VALIDAR SEGURANÇA
   ↓
9. INFORMAR RESULTADO
```

---

# 37. Checklist de Conclusão

Antes de finalizar uma tarefa, verificar:

### Código

* [ ] Arquitetura existente foi respeitada.
* [ ] Responsabilidades estão separadas.
* [ ] Não foram introduzidas duplicações desnecessárias.
* [ ] Não existem soluções temporárias sem justificativa.
* [ ] Não existem logs de diagnóstico indevidos.

### Segurança

* [ ] Autenticação foi preservada.
* [ ] Autorização foi preservada.
* [ ] JWT não foi exposto.
* [ ] Secrets não foram expostos.
* [ ] CORS foi tratado corretamente.
* [ ] CSRF não foi alterado sem justificativa.

### Banco

* [ ] Compatibilidade foi considerada.
* [ ] Dados existentes foram preservados.
* [ ] Alterações destrutivas não foram executadas sem autorização.
* [ ] Migração foi considerada quando necessária.

### Testes

* [ ] `mvn test` executado quando aplicável.
* [ ] `mvn verify` executado quando aplicável.
* [ ] Testes relevantes foram criados/atualizados.
* [ ] Frontend foi validado quando aplicável.

### Git

* [ ] Alterações existentes foram preservadas.
* [ ] `git diff` foi revisado.
* [ ] Nenhum arquivo indevido foi alterado.
* [ ] Conventional Commit foi utilizado quando aplicável.

---

# 38. Formato do Relatório Final

Ao concluir uma tarefa, informar objetivamente:

## Alterações

Listar o que foi alterado.

## Causa raiz

Explicar a causa identificada quando a tarefa envolver correção de problema.

## Testes

Informar os comandos executados e respectivos resultados.

Exemplo:

```text
mvn test   → PASS
mvn verify → PASS
npm run build → PASS
```

## Segurança

Informar alterações relevantes em:

* autenticação;
* autorização;
* JWT;
* CORS;
* CSRF.

## Observações

Informar limitações, riscos, decisões ou itens que não puderam ser validados.

Nunca afirmar que um teste foi executado se ele não foi realmente executado.

---

# 39. Regra Final

O agente deve agir como um engenheiro de software responsável pela manutenção de um sistema existente.

A prioridade é:

```text
Entender antes de alterar.
Alterar somente o necessário.
Preservar segurança.
Preservar dados.
Preservar contratos.
Testar.
Revisar.
Documentar.
```

Em caso de conflito entre conveniência e segurança, preservar a segurança.
Em caso de conflito entre uma solução rápida e a arquitetura existente, investigar a causa antes de alterar a arquitetura.

## Agente de Aprendizagem

O agente de aprendizagem está definido em:

.agents/learning.md

Durante tarefas relevantes, conhecimentos arquiteturais, padrões recorrentes,
soluções de troubleshooting e decisões técnicas confirmadas podem ser
registrados em:

.agents/knowledge/

Conhecimento deve ser baseado em evidências e não deve conter secrets,
tokens, credenciais ou dados sensíveis.
