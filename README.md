# G12 — Telemedicina

Módulo de Telemedicina do **Sistema de Saúde Integrado** — Projeto Integrador 2026 (Sistemas de Informação).

Responsável pelo ciclo de vida dos atendimentos remotos: registro de consultas, gerenciamento de status, registro clínico digital, consulta de histórico do paciente e fornecimento de dados para faturamento.

## Stack Tecnológica

- **Back-end**: Node.js + Express (ES Modules)
- **Front-end**: React (Create React App) + Bootstrap 5
- **ORM**: Sequelize
- **Banco de dados**: PostgreSQL
- **Versionamento**: Git + GitHub

## Estrutura do Repositório

```
back/                  API REST (porta 3001)
  controllers/
  models/
  banco.js             configuração da conexão com o PostgreSQL
  index.js             rotas e inicialização do servidor
front/                  Interface React (porta 3000)
g12_banco.sql           script de criação do banco (tabelas, view, function, triggers)
diagrama.pgerd          diagrama físico do banco
```

## Integrações com Outros Módulos

| Tipo | Módulo | Finalidade |
|---|---|---|
| Consome | G5 — Prontuário | Consulta do histórico clínico do paciente durante o atendimento |
| Fornece | G10 — Faturamento | Dados do atendimento finalizado para geração de cobranças |

## Como Rodar Localmente

### Pré-requisitos

- Node.js 18+
- PostgreSQL 14+ em execução local

### 1. Banco de dados

Crie o banco `g12_telemedicina` no PostgreSQL e execute o script `g12_banco.sql` (raiz do repositório). Ele cria as tabelas, a view, a stored procedure e as triggers utilizadas pelo sistema.

Ajuste o usuário/senha/porta de conexão em `back/banco.js` caso sejam diferentes do seu ambiente.

### 2. Back-end (porta 3001)

```bash
cd back
npm install
node index.js
```

> Durante o desenvolvimento, é possível usar `npx nodemon index.js` para reiniciar o servidor automaticamente a cada alteração.

### 3. Front-end (porta 3000)

```bash
cd front
npm install
npm start
```

A interface ficará disponível em `http://localhost:3000` e consome a API em `http://localhost:3001`.

## Endpoints da API

Base URL: `http://localhost:3001`

Todos os endpoints recebem e retornam `application/json`.

### Criar consulta remota

```
POST /api/telemedicina/consultas
```

**Body:**
```json
{
  "idPaciente": "string",
  "idProfissional": "string",
  "dataHora": "2026-06-20T14:00:00Z",
  "canal": "video | audio | chat",
  "motivo": "string"
}
```

**Resposta `201`:** objeto da consulta criada, com `status: "AGENDADA"` e `id` gerado.
**Resposta `400`:** `{ "erro": "..." }` em caso de campos obrigatórios ausentes/inválidos.

---

### Listar consultas

```
GET /api/telemedicina/consultas
```

**Query params (opcionais):**
- `status` — `AGENDADA | EM_ANDAMENTO | FINALIZADA | CANCELADA`
- `idPaciente`
- `idProfissional`

**Resposta `200`:** array de consultas, ordenadas por `dataHora` decrescente.

---

### Detalhar consulta

```
GET /api/telemedicina/consultas/:id
```

**Resposta `200`:** dados da consulta, incluindo `registroClinico` (objeto ou `null`).
**Resposta `404`:** `{ "erro": "Consulta não encontrada" }`

---

### Atualizar status da consulta

```
PATCH /api/telemedicina/consultas/:id/status
```

**Body:**
```json
{ "status": "EM_ANDAMENTO" }
```

**Transições permitidas:**
- `AGENDADA → EM_ANDAMENTO`
- `AGENDADA → CANCELADA`
- `EM_ANDAMENTO → FINALIZADA`

**Resposta `200`:** consulta atualizada.
**Resposta `422`:** `{ "erro": "Transição inválida: ..." }`
**Resposta `404`:** consulta não encontrada.

---

### Registrar/atualizar registro clínico

```
POST /api/telemedicina/consultas/:id/registro-clinico
```

**Body:**
```json
{
  "diagnostico": "string (obrigatório)",
  "sintomas": "string",
  "observacoes": "string",
  "orientacoes": "string",
  "finalizado": false
}
```

- Se a consulta ainda não tem registro clínico, cria um novo (`201`).
- Se já existe e ainda não foi finalizado, atualiza (`200`).
- Se já existe e `finalizado: true`, retorna `403` — registros finalizados são imutáveis.

---

### Histórico do paciente (integração G5)

```
GET /api/telemedicina/consultas/:id/historico
```

Busca os dados da consulta e consulta o módulo G5 (Prontuário, `GET /prontuario/paciente/:idPaciente` na porta 3005) pelo `idPaciente`.

**Resposta `200`:**
```json
{
  "dadosConsulta": { /* dados da consulta */ },
  "prontuarioPaciente": { "prontuario": { /* ... */ }, "registros": [ /* registros do G5 */ ] }
}
```

Se o paciente não tiver prontuário no G5, `prontuarioPaciente` retorna `{ "aviso": "Paciente sem prontuário registrado no módulo G5." }`.
Se o G5 estiver indisponível, `prontuarioPaciente` retorna `{ "aviso": "Módulo G5 indisponível no momento." }` em vez de erro.

---

### Dados para faturamento (integração G10)

```
GET /api/telemedicina/consultas/:id/faturamento
```

Endpoint consumido pelo módulo **G10 — Faturamento**. Disponível apenas para consultas com `status: "FINALIZADA"`.

**Resposta `200`:**
```json
{
  "consultaId": 1,
  "pacienteId": "string",
  "profissionalId": "string",
  "dataAtendimento": "2026-06-20T14:00:00.000Z",
  "tipoServico": "TELEMEDICINA"
}
```

**Resposta `422`:** `{ "erro": "Faturamento disponível apenas para consultas finalizadas." }`
**Resposta `404`:** consulta não encontrada.

---

### Relatório de consultas

```
GET /api/telemedicina/relatorio
```

Retorna os dados da view `vw_consultas_detalhadas` (consulta + registro clínico associado, quando existir).

**Resposta `200`:** array de objetos:
```json
{
  "consulta_id": 1,
  "paciente_id": "string",
  "profissional_id": "string",
  "data_hora": "2026-06-20T14:00:00.000Z",
  "canal": "video",
  "motivo": "string",
  "status": "FINALIZADA",
  "diagnostico": "string | null",
  "sintomas": "string | null",
  "finalizado": true
}
```

## Equipe

| Nome | E-mail | GitHub |
|---|---|---|
| Emily Cardoso | | |
| Isadora Costa | | |
| Pedro Maldaner | pedro.augusto@unoesc.edu.br | larentispedro |