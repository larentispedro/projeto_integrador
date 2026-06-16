<div align="center">

# 📹 G12 — Telemedicina
### Sistema de Saúde Integrado · Projeto Integrador 2026
#### Curso de Sistemas de Informação — Unoesc Chapecó

</div>

---

## Sobre o Módulo

O módulo **G12 — Telemedicina** é responsável pelo ciclo de vida completo dos **atendimentos médicos realizados de forma remota** dentro do ecossistema *Sistema de Saúde Integrado*.

O sistema permite registrar consultas remotas, acompanhar seu andamento, registrar o diagnóstico clínico digital e fornecer os dados necessários para o faturamento — tudo integrado aos demais módulos do ecossistema via API REST.

---

## Arquitetura e Integrações

```
┌─────────────────────────────────────────────────────┐
│                  G12 — Telemedicina                 │
│                                                     │
│   React (Front-end)  ←→  Node.js/Express (API)     │
│                               ↕                     │
│                         PostgreSQL                  │
└──────────┬────────────────────┬─────────────────────┘
           │                    │
     CONSOME                 FORNECE
           │                    │
  ┌────────▼──────┐    ┌────────▼───────┐
  │ G1 — Pacientes│    │G10 — Faturamento│
  │  (validação)  │    │   (cobranças)  │
  └───────────────┘    └────────────────┘
           │
  ┌────────▼───────┐
  │ G5 — Prontuário│
  │  (histórico)   │
  └────────────────┘
```

| Tipo | Módulo | Finalidade |
|------|--------|------------|
|  Consome | **G1 — Pacientes** | Valida existência e status do paciente antes de registrar a consulta |
|  Consome | **G5 — Prontuário** | Consulta histórico clínico durante o atendimento remoto |
|  Fornece | **G10 — Faturamento** | Dados do atendimento finalizado para geração de cobranças |

---

## Stack Tecnológica

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Back-end | Node.js + Express | Express ^5.2.1 |
| Front-end | React + React Router | — |
| Banco de Dados | PostgreSQL | — |
| ORM | Sequelize | ^6.37.8 |
| Variáveis de Ambiente | dotenv | ^17.4.2 |
| HTTP Client | Axios | ^1.17.0 |
| CORS | cors | ^2.8.6 |
| Dev | Nodemon | ^3.1.14 |

---

## Como Rodar Localmente

### Pré-requisitos

- [Node.js](https://nodejs.org/) instalado
- [PostgreSQL](https://www.postgresql.org/) rodando localmente
- Módulos G1 (porta padrão) e G5 (porta 3005) disponíveis para integração

### 1. Clone o repositório

```bash
git clone https://github.com/larentispedro/projeto_integrador
cd projeto_integrador-main
```

### 2. Instale as dependências do back-end

```bash
cd back
npm install
```

### 3. Configure o banco de dados

Abra o arquivo `g12_banco.sql` no seu cliente PostgreSQL (psql ou pgAdmin) e execute o script completo. Ele irá criar:

- Tabelas: `consulta_remota`, `registro_clinico`, `log_status_consulta`
- Stored procedure: `sp_atualizar_status`
- Triggers: `trg_log_status`, `fn_bloquear_edicao`
- View: `vw_consultas_detalhadas`

```bash
# Via linha de comando:
psql -U postgres -d g12_telemedicina -f g12_banco.sql
```

### 4. Configure as variáveis de ambiente

Dentro da pasta `back/`, copie o arquivo de exemplo e preencha com suas credenciais:

```bash
cp .env.example .env
```

Abra o `.env` e preencha com os dados do seu PostgreSQL local:

```env
DB_NOME=g12_telemedicina
DB_USUARIO=postgres
DB_SENHA=sua_senha_aqui
DB_HOST=localhost
DB_PORTA=5432
```

> ⚠️ O arquivo `.env` **não deve ser commitado** no repositório. Certifique-se de que ele está listado no `.gitignore`.

### 5. Inicie o servidor

```bash
# Produção
node index.js
```

A API estará disponível em: **http://localhost:3001**

### 6. Inicie o front-end

```bash
cd ../front
npm install
npm start
```

O front-end estará disponível em: **http://localhost:3000**

---

## Endpoints da API

Base URL: `http://localhost:3001`

### Consultas Remotas

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/api/telemedicina/consultas` | Registrar nova consulta remota |
| `GET` | `/api/telemedicina/consultas` | Listar consultas (filtros por `status`, `idPaciente`, `idProfissional`) |
| `GET` | `/api/telemedicina/consultas/:id` | Detalhar consulta (inclui registro clínico) |
| `PATCH` | `/api/telemedicina/consultas/:id/status` | Atualizar status da consulta |

### Registro Clínico

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/api/telemedicina/consultas/:id/registro-clinico` | Criar ou atualizar registro clínico digital |

### Integrações

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/telemedicina/consultas/:id/historico` | Consultar histórico clínico via G5 |
| `GET` | `/api/telemedicina/consultas/:id/faturamento` | Obter payload de faturamento para G10 |

### Relatório

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/telemedicina/relatorio` | Relatório consolidado via view `vw_consultas_detalhadas` |

---

## Ciclo de Vida da Consulta

```
AGENDADA ──→ EM_ANDAMENTO ──→ FINALIZADA
    │
    └──→ CANCELADA
```

> ⚠️ Transições inválidas retornam **HTTP 422**. Status `FINALIZADA` e `CANCELADA` são imutáveis.

---

## Estrutura do Banco de Dados

```
consulta_remota
├── id (SERIAL PK)
├── id_paciente
├── id_profissional
├── data_hora
├── canal
├── motivo
└── status (AGENDADA | EM_ANDAMENTO | FINALIZADA | CANCELADA)

registro_clinico
├── id (SERIAL PK)
├── id_consulta (FK → consulta_remota)
├── diagnostico
├── sintomas
├── observacoes
├── orientacoes
└── finalizado (boolean)

log_status_consulta
├── id (SERIAL PK)
├── consulta_id (FK)
├── status_anterior
├── status_novo
└── alterado_em
```

---

## Estrutura do Projeto

```
projeto_integrador-main/
├── back/
│   ├── controllers/
│   │   └── ConsultaController.js   # Lógica de negócio e rotas
│   ├── models/
│   │   ├── ConsultaRemota.js       # Model Sequelize
│   │   └── RegistroClinico.js      # Model Sequelize
│   ├── banco.js                    # Configuração Sequelize + dotenv
│   ├── index.js                    # Entry point + rotas Express
│   ├── .env.example                # Modelo de variáveis de ambiente
│   ├── .env                        # Suas credenciais locais (não commitar)
│   └── package.json
├── front/
│   └── src/
│       ├── pages/
│       │   ├── Consulta/
│       │   │   ├── ListaConsulta.js
│       │   │   ├── FormConsulta.js
│       │   │   └── DetalheConsulta.js
│       │   └── Relatorio/
│       │       └── Relatorio.js
│       ├── componentes/
│       │   └── Menu.js
│       ├── servicos/
│       │   └── api.js              # Axios config (baseURL: localhost:3001)
│       └── App.js
└── g12_banco.sql                   # Schema completo do banco
```

---

## Equipe

| Nome | E-mail | GitHub |
|---|---|---|
| Emily Cardoso | emilyfragoso@outlook.com.br | emily-squena |
| Isadora Costa | isadora.c412@gmail.com | iss |
| Pedro Maldaner | pedro.augusto@unoesc.edu.br | larentispedro |

---

## Contexto Acadêmico

Projeto desenvolvido como **Projeto Integrador 2026** no Curso de Sistemas de Informação da **Unoesc Chapecó**, integrando as disciplinas:

- **Programação Web** — Implementação full stack (Node.js + React)
- **Banco de Dados Relacionais** — Modelagem, stored procedures, triggers e views (PostgreSQL)
- **Engenharia de Software** — Requisitos, UML, processo ágil e qualidade

---

<div align="center">
  <sub>G12 — Telemedicina · Sistema de Saúde Integrado · 2026</sub>
</div>
