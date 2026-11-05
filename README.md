# StockAPI

API REST de **controle de estoque e pedidos**, construída ao longo da disciplina de **Desenvolvimento Back-end II** (IFRO).

- **Stack:** Node.js · Express · MySQL (`mysql2`, sem ORM) · JWT · bcrypt
- **Padrão de código:** ES Modules (`import`/`export`), `async/await`
- **Documentação da API:** [`docs/openapi.yaml`](docs/openapi.yaml) (OpenAPI 3.0)
- **Testes manuais:** coleção do Postman em [`postman/`](postman/)

> Todos os arquivos de código têm comentários em português explicando **o que** cada parte faz e **por que**. Leia o código com calma: ele é o material de estudo.

---

## Sumário

1. [Como rodar](#1-como-rodar)
2. [Estrutura de pastas](#2-estrutura-de-pastas)
3. [Como uma requisição percorre a API](#3-como-uma-requisição-percorre-a-api)
4. [Banco de dados](#4-banco-de-dados)
5. [Endpoints](#5-endpoints)
6. [Autenticação](#6-autenticação)
7. [Erros e status codes](#7-erros-e-status-codes)
8. [Documentação e Postman](#8-documentação-e-postman)
9. [Problemas comuns](#9-problemas-comuns)

---

## 1. Como rodar

**Pré-requisitos:** [Node.js](https://nodejs.org) 18 ou superior e MySQL instalado e em execução.

```bash
# 1. Baixe o projeto e entre na pasta
git clone <url-do-repositorio>
cd stockapi

# 2. Instale as dependências (precisa de internet)
npm install

# 3. Crie o banco e as tabelas
mysql -u root -p < database/schema.sql

# 4. (Opcional) Carregue dados de exemplo
mysql -u root -p stockapi < database/seed.sql

# 5. Crie o seu arquivo de configuração
cp .env.example .env        # no Windows: copy .env.example .env
```

Abra o `.env` e preencha com os **seus** valores (principalmente `DB_PASSWORD` e `JWT_SECRET`):

| Variável | Para que serve |
|---|---|
| `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Conexão com o MySQL |
| `PORT` | Porta da API (padrão `3000`) |
| `JWT_SECRET` | Segredo que assina os tokens de login. Qualquer frase longa serve |

```bash
# 6. Inicie a API
npm run dev      # reinicia sozinho a cada alteração (nodemon)
# ou
npm start        # execução simples
```

Teste: abra <http://localhost:3000/> — deve aparecer `StockAPI no ar`.
A API fica em <http://localhost:3000/api>.

> **Nunca** envie o arquivo `.env` ao Git. Ele já está no `.gitignore`; só o `.env.example` (sem segredos) é versionado.

---

## 2. Estrutura de pastas

```
stockapi/
├─ index.js                  ← ponto de entrada: monta o servidor, registra rotas, 404 e tratamento de erros
├─ config/
│  └─ db.js                  ← pool de conexões com o MySQL
├─ routes/                   ← liga MÉTODO + CAMINHO → middlewares → controller
│  ├─ produtosRoutes.js
│  ├─ categoriasRoutes.js
│  ├─ clientesRoutes.js
│  ├─ pedidosRoutes.js
│  ├─ itensPedidoRoutes.js
│  └─ usuariosRoutes.js
├─ middlewares/              ← funções que rodam ANTES do controller
│  ├─ validarProduto.js      ← valida o corpo da requisição (um por entidade)
│  ├─ validarCategoria.js
│  ├─ validarCliente.js
│  ├─ validarPedido.js
│  ├─ validarItemPedido.js
│  ├─ validarUsuario.js
│  └─ autenticar.js          ← confere o token JWT (rotas protegidas)
├─ controllers/              ← recebe req, chama o service, decide a resposta (status + JSON)
├─ services/                 ← único lugar com SQL
├─ utils/
│  ├─ respostasErro.js       ← formato ÚNICO das respostas de erro de validação
│  └─ montarAtualizacao.js   ← monta o UPDATE dinâmico dos PATCH
├─ database/
│  ├─ schema.sql             ← cria o banco e as 6 tabelas
│  └─ seed.sql               ← dados de exemplo (opcional)
├─ docs/
│  └─ openapi.yaml           ← especificação da API (contrato)
├─ postman/
│  ├─ StockAPI.postman_collection.json
│  └─ StockAPI_Local.postman_environment.json
├─ .env.example              ← modelo do .env
└─ package.json
```

Cada entidade (produtos, categorias, clientes, pedidos, itens de pedido) segue **o mesmo desenho em camadas**, com um arquivo em cada pasta: `routes` → `middlewares` → `controllers` → `services`. Aprendeu uma, aprendeu todas.

---

## 3. Como uma requisição percorre a API

Exemplo: `PATCH /api/produtos/3`

```
Cliente (Postman)
   │  PATCH /api/produtos/3  { "preco": 20 }
   ▼
index.js              express.json() transforma o corpo em objeto (req.body)
   ▼
routes                encontra a rota PATCH /produtos/:id
   ▼
middleware            validarProduto confere o corpo
   │                    └─ inválido? responde 400 e PARA aqui
   ▼
controller            confere se o produto existe (404 se não)
   ▼
service               executa o UPDATE no MySQL
   ▼
controller            monta a resposta (200 + JSON)
   ▼
Cliente

Qualquer exceção em qualquer etapa → next(erro) → errorHandler (index.js) → 400 ou 500
```

| Camada | Responsabilidade | Nunca faz |
|---|---|---|
| **routes** | Ligar caminho e método ao controller | Lógica ou SQL |
| **middlewares** | Validar a entrada / autenticar | Falar com o banco |
| **controllers** | Decidir status code e corpo da resposta | SQL |
| **services** | SQL e acesso ao banco | Usar `req`/`res` ou status code |

---

## 4. Banco de dados

```
categorias ──< produtos >──< itens_pedido >── pedidos >── clientes

usuarios  (independente: só serve para o login)
```

| Tabela | Chaves estrangeiras | Observações |
|---|---|---|
| `categorias` | — | |
| `clientes` | — | `email` e `telefone` opcionais |
| `usuarios` | — | `email` é `UNIQUE`; guarda `senha_hash`, nunca a senha |
| `produtos` | `categoria_id → categorias` | `categoria_id` aceita `NULL` |
| `pedidos` | `cliente_id → clientes` | `status` padrão: `pendente` |
| `itens_pedido` | `pedido_id → pedidos`, `produto_id → produtos` | liga pedidos a produtos (N:N) |

**JOINs usados nas consultas:**

| Consulta | JOIN | Por quê |
|---|---|---|
| Produtos | `LEFT JOIN categorias` | `categoria_id` pode ser `NULL`; com `INNER JOIN` esses produtos sumiriam |
| Pedidos | `INNER JOIN clientes` | todo pedido tem cliente |
| Itens de pedido | `INNER JOIN produtos` e `INNER JOIN pedidos` | todo item tem pedido e produto |

---

## 5. Endpoints

Prefixo de todas as rotas: **`/api`**. 🔒 = exige token.

### Auth

| Método | Rota | Descrição | Sucesso |
|---|---|---|---|
| POST | `/usuarios/registro` | Cria um usuário | 201 |
| POST | `/usuarios/login` | Devolve o token JWT | 200 |

### Produtos · Categorias · Clientes · Pedidos · Itens de pedido

Todos os recursos seguem o mesmo CRUD:

| Método | Rota | Descrição | Sucesso | Erros possíveis |
|---|---|---|---|---|
| POST | `/{recurso}` | Cria | 201 | 400 |
| GET | `/{recurso}` | Lista todos | 200 | — |
| GET | `/{recurso}/:id` | Busca um | 200 | 404 |
| PATCH ou PUT | `/{recurso}/:id` | Atualiza (ver abaixo qual cada recurso usa) | 200 | 400, 404 |
| DELETE | `/{recurso}/:id` | Remove | 204 | 400, 404 (e 401 nas rotas 🔒) |

`{recurso}` = `produtos`, `categorias`, `clientes`, `pedidos` ou `itens_pedido`.

**Particularidades de cada recurso:**

| Recurso | O que é diferente |
|---|---|
| `produtos` | POST exige `nome` e `preco` (> 0). Listagem traz o nome da categoria. Atualiza por **PATCH**. **DELETE 🔒** |
| `categorias` | Só tem `nome`. Atualiza por **PUT**. **DELETE 🔒** |
| `clientes` | POST exige só `nome`. Atualiza por **PATCH** |
| `pedidos` | POST exige `cliente_id`. Atualiza por **PUT**, e só o `status` pode mudar |
| `itens_pedido` | POST exige `pedido_id`, `produto_id`, `quantidade`, `preco_unitario`. Atualiza por **PATCH** (`quantidade` e/ou `preco_unitario`) |

### PATCH x PUT: qual usar?

| | PATCH | PUT |
|---|---|---|
| Ideia | Atualização **parcial** | **Substituição completa** |
| Corpo | Só os campos que mudam (pelo menos um) | Todos os campos do recurso |
| Usado em | `produtos`, `clientes`, `itens_pedido` | `categorias`, `pedidos` |

O critério é simples: **PATCH faz sentido quando o recurso tem vários campos editáveis** e é comum mudar só um deles (o preço de um produto, o telefone de um cliente, a quantidade de um item). Já `categorias` só tem o `nome`, e `pedidos` só permite mudar o `status`: com um único campo editável não existe "atualização parcial", então o `PUT` basta.

```json
PATCH /api/produtos/1
{ "preco": 17.5 }
```

→ só o preço muda; nome, descrição, estoque e categoria continuam como estavam. A resposta traz o produto completo.

Para **apagar** um campo opcional (descrição, categoria, e-mail, telefone), envie-o com valor `null`:

```json
PATCH /api/produtos/1
{ "categoria_id": null }
```

Um `PATCH` com corpo vazio (`{}`) ou só com campos desconhecidos devolve 400: é preciso enviar pelo menos um campo válido.

### Exemplo de uso

```bash
# Criar produto
curl -X POST http://localhost:3000/api/produtos \
  -H "Content-Type: application/json" \
  -d '{"nome":"Caderno 96 folhas","preco":15.9,"quantidade_estoque":40}'
# → 201 {"id":1,"nome":"Caderno 96 folhas","preco":15.9,"quantidade_estoque":40}

# Listar
curl http://localhost:3000/api/produtos
```

Exemplos de todas as rotas, com corpo e respostas: [`docs/openapi.yaml`](docs/openapi.yaml).

---

## 6. Autenticação

Só os `DELETE` de **produtos** e **categorias** exigem token. As demais rotas são abertas.

```
1. POST /api/usuarios/registro   { "nome", "email", "senha" }   → 201  (uma vez)
2. POST /api/usuarios/login      { "email", "senha" }           → 200  { "token": "eyJ..." }
3. DELETE /api/produtos/1
   Header:  Authorization: Bearer eyJ...                        → 204
```

- A senha é guardada como **hash bcrypt** — nem o administrador do banco vê a senha original.
- O token JWT vale **1 hora**; depois disso, faça login de novo.
- No Postman, o token é gravado automaticamente no ambiente pelo script do request **Login**.

| Situação | Resposta |
|---|---|
| Sem o header `Authorization` | 401 `{ "erro": "sem token" }` |
| Token falso, adulterado ou expirado | 401 `{ "erro": "token invalido" }` |
| E-mail inexistente **ou** senha errada | 401 `{ "erro": "invalido" }` (a mesma resposta para os dois, de propósito) |
| E-mail já cadastrado no registro | 400 `{ "erro": "email em uso" }` |

---

## 7. Erros e status codes

| Código | Quando | Exemplo de corpo |
|---|---|---|
| **200** OK | Consulta ou atualização feita | o recurso |
| **201** Created | Registro criado | o recurso com o `id` |
| **204** No Content | Remoção feita | *(sem corpo)* |
| **400** Bad Request | Dados inválidos; referência inexistente; remoção bloqueada por vínculo; JSON malformado | `{ "erro": "Dados inválidos", "detalhes": [...] }` ou `{ "erro": "..." }` |
| **401** Unauthorized | Token ausente/inválido; login errado | `{ "erro": "..." }` |
| **404** Not Found | Id inexistente ou rota inexistente | `{ "erro": "Produto não encontrado" }` |
| **500** Internal Server Error | Erro inesperado no servidor | `{ "erro": "Erro interno do servidor" }` |

**Erros do MySQL traduzidos pelo `errorHandler` (`index.js`):**

| Código do MySQL | Situação | Resposta da API |
|---|---|---|
| `ER_NO_REFERENCED_ROW_2` | Gravar uma FK que não existe (ex.: `categoria_id: 999`) | 400 `referência inválida — o registro relacionado não existe` |
| `ER_ROW_IS_REFERENCED_2` | Apagar um registro que outra tabela ainda usa (ex.: categoria com produtos) | 400 `não é possível remover — existem registros vinculados a este` |
| `ER_DUP_ENTRY` | E-mail repetido no registro | 400 `email em uso` (tratado no controller de usuários) |

**Formato único de erro.** Toda resposta de erro traz o texto principal em **`erro`** (sempre uma string). Quando há uma lista de problemas — só na validação do corpo da requisição — o objeto também traz **`detalhes`**:

```json
// erro simples
{ "erro": "Produto não encontrado" }

// erro de validação (400): todos os problemas de uma vez
{
  "erro": "Dados inválidos",
  "detalhes": [
    "nome é obrigatório",
    "preco deve ser um número maior que zero e até 99999999.99"
  ]
}
```

O formato da validação fica em `utils/respostasErro.js`; os demais erros são montados nos controllers, nos middlewares e no `errorHandler` do `index.js`.

### O que é validado

Os middlewares `validar*.js` barram a requisição **antes** do controller. Além de "obrigatório" e "tipo certo", conferem os limites das colunas do banco — sem isso, o MySQL recusaria o valor e o resultado seria um erro 500.

| Regra | Exemplos |
|---|---|
| Campo obrigatório | `nome` e `preco` em produtos; `cliente_id` em pedidos |
| Tipo | `preco` é número; `nome` é texto não vazio; ids e quantidades são inteiros |
| Faixa | `preco` e `preco_unitario` > 0; `quantidade` > 0; `quantidade_estoque` ≥ 0 |
| Tamanho | `nome` de categoria até 60 caracteres; de produto e cliente até 100; `telefone` até 20; `status` até 20 |
| Formato | `email` de cliente e de usuário precisam parecer um e-mail (`nome@dominio.com`) |
| Senha | de 6 a 72 caracteres |
| Existência da referência | **não** é conferida no middleware: quem barra é o banco (chave estrangeira), e o `errorHandler` traduz para 400 |

**Por que o `atualizar` busca o registro antes de dar `UPDATE`?** Se o `PATCH` (ou `PUT`) enviar exatamente os mesmos valores que já estão salvos, o MySQL devolve `affectedRows = 0` — e checar isso depois do `UPDATE` causaria um falso 404. Buscar antes evita o problema. (No `DELETE` não há esse risco: ou apagou 1 linha, ou 0.)

---

## 8. Documentação e Postman

### `docs/openapi.yaml`

Descreve todas as rotas, o que cada uma recebe e o que devolve (OpenAPI 3.0). Formas de visualizar:

- **Postman:** *Import* → arraste o arquivo (gera uma Collection a partir da especificação)
- **VS Code:** extensão *OpenAPI (Swagger) Editor*
- **Navegador:** cole o conteúdo em <https://editor.swagger.io>

Se você alterar uma rota da API, **atualize o `openapi.yaml`** — documentação desatualizada é pior que nenhuma.

### `postman/`

1. No Postman: *Import* → arraste os dois arquivos da pasta `postman/`.
2. Selecione o ambiente **StockAPI Local** (canto superior direito).
3. Rode **Auth ▸ Registrar usuário** (uma vez) e **Auth ▸ Login** — o token é gravado sozinho.
4. Use as pastas **Produtos** e **Categorias**.

> **Com o `seed.sql` carregado:** os requests **Deletar produto** e **Deletar categoria** (que usam o id `1`) devolvem **400**, porque esses registros têm vínculos — é o comportamento esperado, não um erro. Para ver o `204`, apague um registro sem vínculos (ex.: produto `5` ou categoria `3` do seed) ou um que você mesmo criou. O request **Registrar usuário** só funciona uma vez por e-mail (a segunda tentativa devolve 400 `email em uso`).

O ambiente tem duas variáveis: `baseUrl` (`http://localhost:3000/api`) e `token`. **Antes de qualquer commit, confira se o `token` está vazio no JSON do ambiente.**

---

## 9. Problemas comuns

| Sintoma | Causa provável | O que fazer |
|---|---|---|
| `Access denied for user` ao iniciar | `DB_USER`/`DB_PASSWORD` errados no `.env` | Corrija o `.env` e reinicie |
| `Unknown database 'stockapi'` | `schema.sql` não foi executado | Rode o passo 3 |
| `ECONNREFUSED` ao iniciar | MySQL não está rodando, ou `DB_HOST` errado | Inicie o MySQL |
| `EADDRINUSE` | A porta já está em uso (outra instância da API) | Feche o outro processo ou mude `PORT` |
| Login/DELETE falham e aparece o aviso `JWT_SECRET não definido` | `JWT_SECRET` ausente no `.env` | Preencha e reinicie |
| 401 `sem token` no DELETE | Token não chegou | Faça o login; confira a autenticação **Bearer** no Postman |
| 401 `token invalido` | Token expirado (1 h), cópia incompleta ou com aspas | Faça login de novo |
| 400 `referência inválida…` | `categoria_id`/`cliente_id`/… que não existe | Confira o id na listagem |
| 400 `não é possível remover…` | Existem registros usando este | Apague primeiro os dependentes (ex.: itens → pedido → cliente) |
| `Cannot find module` | Faltou `npm install` | Rode `npm install` |
| Alterei o código e nada mudou | Está usando `npm start` | Use `npm run dev` ou reinicie |
| 404 `Rota GET /produtos não encontrada` | Faltou o prefixo `/api` | Use `/api/produtos` |
