## Testar Conexão com Banco de Dados

```bash
npx ts-node src/db/test-connection.ts
```

Coloquei aqui pra vocês testarem caso tenham conflito pra se conectar com o container do banco no Docker

## Criar e Rodar Container Docker

```bash
docker compose up -d        # sobe o container | -d roda em segundo plano
docker compose down         # para e remove o container
docker compose down -v      # para, remove o container E os dados
docker compose logs -f db   # acompanha os logs em tempo real
docker ps                   # mostra os processos do docker
docker exec -it task-manager-db psql -U postgres -d task_manager # acessa o postgres pelo terminal
```

ATENÇÃO: Caso tenha postgres instalado localmente, provavelmente terá conflito se no arquivo docker-compose.yml se as portas estiverem assim '5432:5432', mude para '5433:5432' e tente acessar o banco pelo DBeaver, caso não tenha o Postgres instalado não precisa se preocupar com isso
