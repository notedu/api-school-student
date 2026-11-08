# Caderno Escolar

O **Caderno Escolar** é um sistema de gestão escolar para cadastrar alunos, professores e matérias, registrar notas bimestrais e acompanhar pedidos de reavaliação. A proposta é reunir essas informações em um só lugar e facilitar o acompanhamento da vida escolar.

O sistema tem três perfis de acesso:

- **Administrador:** gerencia cadastros, matérias, notas, solicitações de acesso e consulta a auditoria.
- **Professor:** consulta os alunos e trabalha com notas e reavaliações relacionadas às matérias que leciona.
- **Aluno:** consulta suas próprias notas e solicita reavaliação quando uma nota é inferior a 6,0.

As notas são organizadas pelos quatro bimestres. Os pedidos de reavaliação podem incluir arquivos como comprovantes, e as decisões ficam registradas para consulta administrativa.

## Proposta acadêmica

Projeto elaborado para o desafio do professor **Nivaldo de Andrade**, na disciplina **Tecnologias para Desenvolvimento Web**, da **UNIFEOB**. A data de início registrada para o projeto é **28 de outubro de 2026**.

## Usar a API com Postman ou Insomnia

Os exemplos abaixo usam a API local em `http://localhost:5000`. Para testar, primeiro configure o banco de dados e inicie o Back-End.

### 1. Preparar o Back-End

Instale as dependências:

```bash
cd backend
npm install
```

Crie `backend/.env` com a conexão do PostgreSQL e uma chave secreta para os tokens. Gere a chave com `openssl rand -base64 48` e cole o resultado em `JWT_SECRET`:

```env
DATABASE_URL="postgresql://USUARIO:SENHA@HOST:5432/NOME_DO_BANCO?schema=public"
JWT_SECRET="COLE_AQUI_A_CHAVE_GERADA"
PORT=5000
```

Com um banco novo já provisionado, gere o cliente Prisma e aplique as migrações existentes:

```bash
npx prisma generate
npx prisma migrate deploy
```

Se ainda não houver administrador, acrescente temporariamente ao `.env` os dados iniciais abaixo. Use um CPF válido e uma senha de pelo menos 8 caracteres com maiúscula, minúscula, número e caractere especial:

```env
INITIAL_ADMIN_NOME="Nome do administrador"
INITIAL_ADMIN_CPF="CPF_VALIDO"
INITIAL_ADMIN_PASSWORD="SenhaForte@2026"
INITIAL_ADMIN_CARGO="DIRETOR"
```

Crie a conta administrativa:

```bash
npm run admin:create
```

Depois, remova do `.env` as variáveis `INITIAL_ADMIN_*`. Mantenha `DATABASE_URL`, `JWT_SECRET` e `PORT`.

Inicie o servidor:

```bash
npm run dev
```

### 2. Criar ambiente no Postman ou Insomnia

Crie um ambiente com estas variáveis:

```json
{
  "baseUrl": "http://localhost:5000",
  "token": ""
}
```

No Postman, selecione esse ambiente no canto superior direito. No Insomnia, selecione-o como ambiente ativo. Nas URLs dos exemplos, use `{{baseUrl}}`.

### 3. Confirmar que a API está ligada

Crie uma requisição **GET** para:

```text
{{baseUrl}}/health/
```

A resposta esperada é uma mensagem confirmando que a API está ligada.

### 4. Fazer login e guardar o token

Crie uma requisição **POST** para `{{baseUrl}}/auth/login`. Em **Body**, escolha JSON e envie:

```json
{
  "identificador": "CPF_DO_ADMINISTRADOR",
  "password": "SENHA_DO_ADMINISTRADOR",
  "tipoConta": "ADMIN"
}
```

O campo `tipoConta` aceita `ADMIN`, `PROFESSOR` ou `ALUNO`. Administradores e professores entram com CPF; alunos entram com RA.

A resposta inclui um campo `token`. Copie-o para a variável `token` do ambiente.

### 5. Autorizar as próximas requisições

Nas requisições protegidas, configure a autenticação como **Bearer Token** e informe `{{token}}` como o token.

- No Postman: abra a aba **Authorization**, escolha **Bearer Token** e use `{{token}}`.
- No Insomnia: escolha **Bearer Token** nas opções de autenticação da requisição e use `{{token}}`.

O token expira após 8 horas. Se expirar, faça login novamente e atualize a variável.

### 6. Fazer uma consulta autenticada

Por exemplo, envie um **GET** para:

```text
{{baseUrl}}/dashboard
```

Se a resposta trouxer os dados do resumo, o token foi aceito.

### 7. Exemplos de cadastros e lançamento de nota

As operações de cadastro abaixo são administrativas. Use IDs existentes retornados pelas respostas da API.

**Cadastrar matéria** — `POST {{baseUrl}}/materias`:

```json
{
  "nome": "Matemática",
  "codigo": "MAT"
}
```

**Cadastrar aluno** — `POST {{baseUrl}}/alunos`:

```json
{
  "nome": "Ana Silva",
  "idade": 14,
  "cpf": "CPF_VALIDO_E_UNICO",
  "ra": "20260001",
  "responsavelLegal": "Responsável da aluna",
  "password": "SenhaForte@2026",
  "dataNascimento": "2012-03-15",
  "cep": "13000000",
  "rua": "Rua das Flores",
  "bairro": "Centro",
  "cidade": "São João da Boa Vista",
  "estado": "SP",
  "numeroCasa": "100",
  "complemento": "Apto 2"
}
```

Substitua o CPF por um CPF válido e ainda não cadastrado.

**Cadastrar professor** — `POST {{baseUrl}}/professores`:

```json
{
  "nome": "João Professor",
  "idade": 35,
  "cpf": "CPF_VALIDO_E_UNICO",
  "password": "SenhaForte@2026",
  "dataNascimento": "1991-03-15",
  "cep": "13000000",
  "rua": "Rua das Flores",
  "bairro": "Centro",
  "cidade": "São João da Boa Vista",
  "estado": "SP",
  "numeroCasa": "100",
  "complemento": "",
  "materiaIds": [1]
}
```

`materiaIds` deve conter pelo menos o ID de uma matéria já cadastrada. Substitua o CPF por um valor válido e único.

**Lançar nota bimestral como administrador** — `POST {{baseUrl}}/notas`:

```json
{
  "alunoId": 1,
  "materiaId": 1,
  "professorId": 1,
  "valor": 8,
  "titulo": "Prova bimestral",
  "periodo": "1º bimestre"
}
```

Use IDs existentes. O valor deve ser um número inteiro de `0` a `10`. Os períodos aceitos são `1º bimestre`, `2º bimestre`, `3º bimestre` e `4º bimestre`. O título deve ser um dos instrumentos disponíveis, como `Prova bimestral`, `Trabalho`, `Projeto` ou `Média bimestral consolidada`. Um professor autenticado não precisa enviar `professorId`; a API usa o professor do token.

## Rotas principais

Todas as rotas abaixo exigem Bearer Token, exceto `/health/`, `POST /auth/login` e `POST /auth/recuperacao`.

| Método | Rota | Acesso | Função |
| --- | --- | --- | --- |
| `GET` | `/health/` | Público | Verifica se a API está ativa |
| `POST` | `/auth/login` | Público | Inicia uma sessão |
| `POST` | `/auth/recuperacao` | Público | Solicita recuperação de acesso |
| `GET` | `/auth/me` | Autenticado | Consulta a conta conectada |
| `POST` | `/auth/senha` | Autenticado | Altera a senha |
| `GET` | `/dashboard` | Autenticado | Consulta o resumo adequado ao perfil |
| `GET` / `POST` | `/alunos` | Consulta: administrador/professor; cadastro: administrador | Lista ou cadastra alunos |
| `GET` | `/alunos/:id` | Administrador | Consulta a ficha completa do aluno |
| `GET` | `/equipe` | Administrador | Lista professores e administradores |
| `POST` | `/professores` | Administrador | Cadastra professor e matérias atribuídas |
| `GET` | `/professores/:id` | Administrador | Consulta o perfil completo do professor |
| `GET` / `POST` | `/materias` | Consulta: autenticado; cadastro: administrador | Lista ou cadastra matérias |
| `GET` / `POST` | `/notas` | Consulta: autenticado; lançamento: administrador/professor | Consulta ou registra notas |
| `PATCH` | `/notas/:id` | Administrador/professor | Atualiza uma nota |
| `GET` / `POST` | `/reavaliacoes` | Consulta: autenticado; solicitação: aluno | Consulta ou solicita reavaliação |
| `GET` | `/reavaliacoes/anexos/:id` | Conforme vínculo com a solicitação | Baixa um comprovante |
| `PATCH` | `/reavaliacoes/:id` | Professor responsável | Aprova ou recusa uma reavaliação |
| `GET` / `PATCH` | `/recuperacoes` e `/recuperacoes/:id` | Administrador | Consulta e resolve pedidos de recuperação |
| `GET` | `/auditoria` | Administrador | Consulta o histórico de atividades |

## Iniciar o Front-End

Em outro terminal, na pasta do Front-End:

```bash
cd frontend
npm install
npm run dev
```

O Vite informa o endereço local da aplicação. Por padrão, o Front-End procura a API em `http://localhost:5000`.
