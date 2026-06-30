# TaskLip — Sistema de Gerenciamento de Tarefas

Aplicação web fullstack para gerenciamento de tarefas com autenticação JWT, upload de imagens via Cloudinary, notificações push e relatórios estatísticos. Desenvolvida com NestJS no backend, React + Vite no frontend e PostgreSQL como banco de dados.


## Sumário

- [Sobre o Projeto](#sobre-o-projeto)
- [Tecnologias](#tecnologias)
- [Estrutura do Repositório](#estrutura-do-repositório)
- [Funcionalidades](#funcionalidades)
- [Endpoints da API](#endpoints-da-api)
- [Como Rodar](#como-rodar)
  - [Com Docker (recomendado)](#com-docker-recomendado)
  - [Sem Docker](#sem-docker)
- [Configuração de Variáveis de Ambiente](#configuração-de-variáveis-de-ambiente)


## Sobre o Projeto

TaskLip é uma aplicação de produtividade pessoal que permite criar, organizar e acompanhar tarefas com diferentes prioridades e status. Conta com painel de relatórios com gráficos, upload de imagens por tarefa e foto de perfil via Cloudinary, além de notificações push via Web Push API.


## Tecnologias

| Camada         | Tecnologia                                               |
|----------------|----------------------------------------------------------|
| Frontend       | React 18, Vite, TypeScript, TailwindCSS, Lucide React    |
| Backend        | NestJS, Node.js, TypeScript                              |
| Banco de Dados | PostgreSQL 14+                                           |
| ORM            | Drizzle ORM                                              |
| Autenticação   | JWT + bcrypt                                             |
| Uploads        | Cloudinary                                               |
| Notificações   | Web Push API                                             |
| Infra          | Docker, Docker Compose                                   |


## Estrutura do Repositório

```
trabalho-lip/
├── backend/                        # API NestJS (porta 3300)
│   ├── src/
│   │   ├── auth/                   # Autenticação e JWT
│   │   ├── cloudinary/             # Integração com Cloudinary
│   │   ├── db/                     # Configuração do Drizzle ORM e migrações
│   │   ├── notifications/          # Web Push e envio de e-mails
│   │   ├── task/                   # CRUD de tarefas
│   │   └── users/                  # Gerenciamento de usuários e perfil
│   ├── .env                        # Variáveis de ambiente do backend (não versionado)
│   ├── .env.example                # Template de variáveis de ambiente
│   └── Dockerfile
│
├── frontend/                       # React + Vite (porta 5173)
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboard/          # Componentes do dashboard
│   │   │   ├── layout/             # Sidebar, Topbar, Header
│   │   │   ├── login/              # Componentes de login
│   │   │   ├── profile/            # Componentes de perfil
│   │   │   ├── register/           # Componentes de registro
│   │   │   └── relatorios/         # Componentes de relatórios
│   │   └── ...
│   ├── .env.example                # Template de variáveis de ambiente
│   └── Dockerfile
│
└── docker-compose.yml              # Orquestra db + backend + frontend
```


## Funcionalidades

### Autenticação

- Registro com validação de e-mail
- Login seguro com JWT
- Refresh token para renovação de sessão
- Esqueci minha senha (e-mail de reset)
- Logout

### Tarefas

- Listar, criar, editar e excluir tarefas
- Prioridades: baixa, média e alta
- Filtro por status: pendente, em andamento, concluída
- Upload de imagens por tarefa (Cloudinary)

### Relatórios

- Estatísticas: total de tarefas, concluídas e pendentes
- Gráficos de tarefas concluídas por dia
- Filtros por período (7, 15, 30 dias ou personalizado)

### Perfil

- Visualização e edição de dados (nome, e-mail)
- Upload de foto de perfil (Cloudinary)

### Notificações

- Preferências de notificação por e-mail e push
- Notificações push via Web Push API


## Endpoints da API

### Autenticação

| Método | Rota                      | Auth | Descrição                          |
|--------|---------------------------|------|------------------------------------|
| `POST` | `/auth/register`          | Não  | Registrar novo usuário             |
| `POST` | `/auth/login`             | Não  | Login e geração de token JWT       |
| `POST` | `/auth/refresh`           | JWT  | Renovar token de acesso            |
| `POST` | `/auth/forgot-password`   | Não  | Solicitar reset de senha por e-mail|
| `POST` | `/auth/reset-password`    | Não  | Redefinir senha com token          |
| `POST` | `/auth/logout`            | JWT  | Logout                             |

### Tarefas

| Método   | Rota          | Auth | Descrição                    |
|----------|---------------|------|------------------------------|
| `GET`    | `/tasks`      | JWT  | Listar todas as tarefas      |
| `GET`    | `/tasks/:id`  | JWT  | Buscar tarefa por ID         |
| `POST`   | `/tasks`      | JWT  | Criar nova tarefa            |
| `PATCH`  | `/tasks/:id`  | JWT  | Atualizar tarefa             |
| `DELETE` | `/tasks/:id`  | JWT  | Excluir tarefa               |

### Relatórios

| Método | Rota               | Auth | Descrição                        |
|--------|--------------------|------|----------------------------------|
| `GET`  | `/reports/me`      | JWT  | Relatório personalizado          |
| `GET`  | `/reports/default` | JWT  | Relatório padrão (últimos 7 dias)|

### Usuários

| Método  | Rota                          | Auth | Descrição                          |
|---------|-------------------------------|------|------------------------------------|
| `GET`   | `/users/me`                   | JWT  | Perfil do usuário atual            |
| `GET`   | `/users/me/preferences`       | JWT  | Preferências de notificação        |
| `PATCH` | `/users/me`                   | JWT  | Atualizar perfil                   |
| `PATCH` | `/users/me/preferences`       | JWT  | Atualizar preferências             |
| `POST`  | `/users/me/subscribe-push`    | JWT  | Inscrever para notificações push   |
| `POST`  | `/users/me/unsubscribe-push`  | JWT  | Cancelar inscrição push            |
| `POST`  | `/users/me/test-notification` | JWT  | Enviar notificação de teste        |


## Como Rodar

### Com Docker (recomendado)

**Pré-requisitos:** [Docker](https://docs.docker.com/get-docker/) e Docker Compose instalados.

```bash
# 1. Clone o repositório
git clone <url-do-repositorio>
cd trabalho-lip

# 2. Configure as variáveis de ambiente do backend
cp backend/.env.example backend/.env
# Edite o backend/.env com seus valores reais (JWT_SECRET, Cloudinary, e-mail, etc.)

# 3. Suba todos os serviços
docker compose up --build
```

O Docker Compose sobe três serviços em ordem:

1. **db** — PostgreSQL 16 (aguarda healthcheck antes de liberar os outros)
2. **backend** — NestJS (executa `drizzle-kit push` + seed automaticamente ao iniciar)
3. **frontend** — React/Vite

| Serviço  | URL                                            |
|----------|------------------------------------------------|
| Frontend | [http://localhost:5173](http://localhost:5173) |
| Backend  | [http://localhost:3300](http://localhost:3300) |
| Banco    | `localhost:5433` (PostgreSQL)                  |

Para parar e remover os containers:

```bash
docker compose down

# Para remover também o volume do banco (apaga todos os dados):
docker compose down -v
```

---

### Sem Docker

**Pré-requisitos:** [Node.js 18+](https://nodejs.org/) e PostgreSQL rodando localmente.

```bash
# 1. Clone o repositório
git clone <url-do-repositorio>
cd trabalho-lip
```

#### Backend

```bash
# 2. Acesse o diretório do backend
cd backend

# 3. Instale as dependências
npm install

# 4. Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com seus valores reais (DATABASE_URL, JWT_SECRET, Cloudinary, etc.)

# 5. Execute as migrações do banco de dados
npm run db:push:migrate

# 6. (Opcional) Popule o banco com dados iniciais
npm run db:seed

# 7. Inicie o servidor em modo desenvolvimento
npm run dev
```

> O backend estará disponível em [http://localhost:3300](http://localhost:3300).

#### Frontend

Em um novo terminal:

```bash
# 8. Acesse o diretório do frontend
cd frontend

# 9. Instale as dependências
npm install

# 10. Configure as variáveis de ambiente (se necessário)
# Copie e ajuste a VITE_API_URL conforme seu ambiente
cp .env.example .env

# 11. Inicie o servidor de desenvolvimento
npm run dev
```

> O frontend estará disponível em [http://localhost:5173](http://localhost:5173).


## Configuração de Variáveis de Ambiente

### `backend/.env`

| Variável                  | Descrição                                         | Exemplo                                         |
|---------------------------|---------------------------------------------------|-------------------------------------------------|
| `DATABASE_URL`            | String de conexão com o PostgreSQL                | `postgresql://user:pass@localhost:5432/tasklip` |
| `JWT_SECRET`              | Segredo para assinatura dos tokens JWT            | `meu-segredo-super-secreto`                     |
| `JWT_EXPIRES_IN`          | Tempo de expiração do token                       | `7d`                                            |
| `EMAIL_HOST`              | Host do servidor de e-mail (SMTP)                 | `smtp.gmail.com`                                |
| `EMAIL_PORT`              | Porta do servidor SMTP                            | `587`                                           |
| `EMAIL_USER`              | Usuário de autenticação SMTP                      | `seu@email.com`                                 |
| `EMAIL_PASSWORD`          | Senha do e-mail SMTP                              | `sua-senha`                                     |
| `CLOUDINARY_CLOUD_NAME`   | Nome do cloud no Cloudinary                       | `meu-cloud`                                     |
| `CLOUDINARY_API_KEY`      | Chave de API do Cloudinary                        | `123456789`                                     |
| `CLOUDINARY_API_SECRET`   | Segredo de API do Cloudinary                      | `abc123xyz`                                     |

### `frontend/.env`

| Variável       | Descrição                      | Exemplo                       |
|----------------|--------------------------------|-------------------------------|
| `VITE_API_URL` | URL base da API do backend     | `http://localhost:3300`       |

### Dados Iniciais (Seed)

Após executar o seed (`npm run db:seed`), um usuário administrador é criado:

| Campo | Valor           |
|-------|-----------------|
| Email | `admin@tasklip.com` |
| Senha | `password123`   |