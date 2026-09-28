import "dotenv/config";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import * as bcrypt from "bcrypt";

import { tarefas, usuarios } from "./schema.js";

async function main() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL não encontrada no .env");
  }

  const pool = new Pool({
    connectionString: databaseUrl,
  });

  const db = drizzle(pool);

  const emailSeed = "joao@gmail.com";

  console.log("Limpando usuário seed antigo...");

  await db.delete(usuarios).where(eq(usuarios.email, emailSeed));

  console.log("Criando usuário seed...");

  const senhaHash = await bcrypt.hash("senha123", 10);

  const [usuario] = await db
    .insert(usuarios)
    .values({
      nome: "Joao Luis",
      email: emailSeed,
      senhaHash,
      refreshToken: null,
      fotoUrl:
        "https://res.cloudinary.com/da3niabkt/image/upload/v1782668892/task-lip/users/ipn9eue8qqj7wv8bg8kh.jpg",
    })
    .returning();

  console.log("Usuário criado:", usuario.email);

  console.log("Criando tarefas seed...");

  await db.insert(tarefas).values([
    {
      usuarioId: usuario.id,
      titulo: "Implementar autenticação JWT",
      descricao: "Criar login, registro, refresh token e logout.",
      prioridade: "ALTA",
      status: "CONCLUIDA",
      dataLimite: "2026-06-10",
      concluidaEm: new Date("2026-06-08T14:30:00.000Z"),
    },
    {
      usuarioId: usuario.id,
      titulo: "Documentar API com Swagger",
      descricao: "Adicionar decorators nas rotas de Auth, Users, Tasks e Reports.",
      prioridade: "MEDIA",
      status: "CONCLUIDA",
      dataLimite: "2026-06-15",
      concluidaEm: new Date("2026-06-14T10:00:00.000Z"),
    },
    {
      usuarioId: usuario.id,
      titulo: "Implementar relatório de tarefas",
      descricao: "Gerar relatório com tarefas concluídas, pendentes e concluídas por dia.",
      prioridade: "ALTA",
      status: "CONCLUIDA",
      dataLimite: "2026-06-20",
      concluidaEm: new Date("2026-06-18T16:45:00.000Z"),
    },
    {
      usuarioId: usuario.id,
      titulo: "Integrar Cloudinary",
      descricao: "Permitir upload de foto de perfil e salvar a URL no banco.",
      prioridade: "ALTA",
      status: "EM_ANDAMENTO",
      dataLimite: "2026-06-25",
      concluidaEm: null,
    },
    {
      usuarioId: usuario.id,
      titulo: "Dockerizar backend",
      descricao: "Criar Dockerfile e configurar backend no docker-compose.",
      prioridade: "MEDIA",
      status: "PENDENTE",
      dataLimite: "2026-06-28",
      concluidaEm: null,
    },
    {
      usuarioId: usuario.id,
      titulo: "Criar testes das rotas principais",
      descricao: "Testar autenticação, tarefas e relatórios.",
      prioridade: "BAIXA",
      status: "PENDENTE",
      dataLimite: "2026-07-01",
      concluidaEm: null,
    },
    {
      usuarioId: usuario.id,
      titulo: "Melhorar validações dos DTOs",
      descricao: "Adicionar mensagens customizadas nos DTOs da aplicação.",
      prioridade: "MEDIA",
      status: "EM_ANDAMENTO",
      dataLimite: "2026-06-30",
      concluidaEm: null,
    },
  ]);

  console.log("Seed executada com sucesso!");
  console.log("");
  console.log("Usuário para teste:");
  console.log(`Email: ${emailSeed}`);
  console.log("Senha: senha123");

  await pool.end();
}

main().catch(async error => {
  console.error("Erro ao executar seed:", error);
  process.exit(1);
});
