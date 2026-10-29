# API School Student

API REST para cadastro de funcionários e alunos e registro de notas, construída com Node.js, TypeScript, Express, Prisma ORM 7 e PostgreSQL.

## Requisitos

- Node.js e npm
- Uma instância PostgreSQL acessível

## Instalação

Clone o repositório e entre na pasta do projeto:

```bash
git clone <URL_DO_REPOSITORIO>
cd api-school-student
npm install
```

Crie o arquivo `.env` na raiz do projeto. Ele é ignorado pelo Git; não compartilhe nem comite os valores:

```env
DATABASE_URL="postgresql://USUARIO:SENHA@HOST:5432/NOME_DO_BANCO?schema=public"
JWT_SECRET=""
PORT=3333
```

Gere uma chave para assinar os tokens com:

```bash
openssl rand -base64 32
```

Copie o resultado para `JWT_SECRET`. O servidor exige uma chave com pelo menos 32 bytes.

## Banco de dados e Prisma

Com o PostgreSQL ativo e `DATABASE_URL` configurada, instale as dependências, gere o Prisma Client e aplique as migrações locais:

```bash
npx prisma generate
npx prisma migrate dev
```

O schema está em `prisma/schema.prisma`; a configuração da CLI fica em `prisma7.config.ts`.

## Primeiro administrador

Se ainda não houver um administrador, acrescente temporariamente ao `.env`:

```env
INITIAL_ADMIN_NOME="Administrador"
INITIAL_ADMIN_USUARIO="admin"
INITIAL_ADMIN_PASSWORD="use-uma-senha-forte-com-12-caracteres-ou-mais"
```

Crie a conta:

```bash
npm run admin:create
```

O script cria o funcionário com cargo `ADMIN` e armazena a senha em hash. Ele não altera uma conta que já exista com o mesmo usuário. Depois da criação, remova do `.env` as três variáveis `INITIAL_ADMIN_*`; mantenha `DATABASE_URL`, `JWT_SECRET` e, se quiser, `PORT`.

Se o administrador já foi criado, pule esta etapa.

## Iniciar o servidor

```bash
npm run dev
```

O servidor usa a porta de `PORT`; sem essa variável, usa `5000`. Com `PORT=3333`, a URL base é `http://localhost:3333`.

Verifique se está no ar:

```bash
curl http://localhost:3333/health/
```

Resposta esperada:

```json
{"message":"API ligada e funcionando!"}
```

## Autenticação

Faça login com um funcionário cadastrado:

```bash
curl -X POST http://localhost:3333/login/ \
  -H 'Content-Type: application/json' \
  -d '{"usuario":"admin","password":"SUA_SENHA"}'
```

A resposta inclui um token JWT. Envie-o nas rotas protegidas no cabeçalho:

```text
Authorization: Bearer SEU_TOKEN
```

Tokens expiram após uma hora. As senhas de novos funcionários são armazenadas com hash.

## Rotas

| Método | Caminho | Acesso | Descrição |
| --- | --- | --- | --- |
| `GET` | `/health/` | Público | Confirma que a API está no ar |
| `POST` | `/login/` | Público | Autentica um funcionário e retorna um token |
| `POST` | `/funcionario/` | `ADMIN` | Cadastra um funcionário com cargo `PROFESSOR` |
| `GET` | `/funcionario/` | `ADMIN` | Lista funcionários sem retornar senhas |
| `POST` | `/aluno/` | `ADMIN` | Cadastra um aluno |
| `GET` | `/aluno/` | `PROFESSOR` ou `ADMIN` | Lista alunos |
| `POST` | `/aluno/:alunoId/notas/` | `PROFESSOR` ou `ADMIN` | Atribui uma nota ao aluno autenticado como autor |
| `GET` | `/aluno/:alunoId/notas/` | `PROFESSOR` ou `ADMIN` | Lista as notas de um aluno e quem as atribuiu |

Todas as rotas, exceto `/health/` e `/login/`, exigem o cabeçalho `Authorization: Bearer SEU_TOKEN`.

## Exemplos de uso

Nos exemplos abaixo, substitua `3333` se estiver usando outra porta e substitua `SEU_TOKEN` pelo token do login.

### Criar um funcionário professor

Somente um administrador pode criar funcionários. A senha precisa ter pelo menos 12 caracteres.

```bash
curl -X POST http://localhost:3333/funcionario/ \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer SEU_TOKEN' \
  -d '{"nome":"João Professor","usuario":"joao","password":"senha-forte-com-12-caracteres"}'
```

Funcionários criados por esta rota recebem o cargo `PROFESSOR`. Para usar a conta, faça login em `/login/` com o usuário e a senha cadastrados.

### Cadastrar um aluno

Somente um administrador pode cadastrar alunos. A idade deve ser um número inteiro de 1 a 120.

```bash
curl -X POST http://localhost:3333/aluno/ \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer SEU_TOKEN' \
  -d '{"nome":"Ana Silva","idade":12}'
```

A resposta inclui o `id` do aluno, necessário para registrar ou consultar notas.

### Atribuir uma nota

Um professor ou administrador pode atribuir uma nota. O autor é obtido do token; não envie `funcionarioId` no corpo.

```bash
curl -X POST http://localhost:3333/aluno/1/notas/ \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer SEU_TOKEN' \
  -d '{"valor":9}'
```

O schema atual aceita nota como número inteiro de `0` a `99` (`Decimal(2, 0)`).

### Consultar notas

```bash
curl http://localhost:3333/aluno/1/notas/ \
  -H 'Authorization: Bearer SEU_TOKEN'
```

## Códigos de resposta comuns

- `200`: consulta ou login realizado com sucesso.
- `201`: recurso criado.
- `400`: corpo da requisição ou parâmetro inválido.
- `401`: token ausente/inválido ou credenciais incorretas.
- `403`: usuário autenticado sem permissão para a operação.
- `404`: aluno não encontrado.
- `409`: usuário de funcionário já cadastrado.

## Limites atuais

- Não há login de aluno; funcionários autenticados consultam as notas pela API.
- As notas são inteiras de `0` a `99` no schema atual.
- O cadastro pela rota `/funcionario/` cria professores; o primeiro administrador é criado pelo script `npm run admin:create`.
