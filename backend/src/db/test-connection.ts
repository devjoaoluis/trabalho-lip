import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as dotenv from "dotenv";
dotenv.config();

async function testConnection() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const client = await pool.connect();
    console.log("✅ Conexão com o banco bem sucedida!");

    const result = await client.query("SELECT current_database(), version()");
    console.log("📦 Banco:", result.rows[0].current_database);
    console.log("🐘 Versão:", result.rows[0].version);

    client.release();
  } catch (err) {
    console.error("❌ Erro ao conectar:", err);
  } finally {
    await pool.end();
  }
}

testConnection();
