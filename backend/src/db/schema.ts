import { relations } from "drizzle-orm";
import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  text,
  date,
  timestamp,
  integer,
  json,
} from "drizzle-orm/pg-core";

export const prioridadeEnum = pgEnum("prioridade", ["BAIXA", "MEDIA", "ALTA"]);

export const statusTarefaEnum = pgEnum("status_tarefa", ["PENDENTE", "EM_ANDAMENTO", "CONCLUIDA"]);

export const usuarios = pgTable("usuarios", {
  id: uuid("id").primaryKey().defaultRandom(),
  nome: varchar("nome", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  senhaHash: varchar("senha_hash", { length: 255 }).notNull(),
  refreshToken: varchar("refresh_token", { length: 255 }),
  criadoEm: timestamp("criado_em").defaultNow().notNull(),
  atualizadoEm: timestamp("atualizado_em").defaultNow().notNull(),
  resetToken: text("reset_token"),
  resetTokenExpiry: timestamp("reset_token_expiry"),
  fotoUrl: varchar("foto_url", { length: 500 }),
  fotoPublicId: varchar("foto_public_id", { length: 255 }),
});

export const tarefas = pgTable("tarefas", {
  id: uuid("id").primaryKey().defaultRandom(),
  usuarioId: uuid("usuario_id")
    .notNull()
    .references(() => usuarios.id, { onDelete: "cascade" }),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  prioridade: prioridadeEnum("prioridade").default("MEDIA").notNull(),
  status: statusTarefaEnum("status").default("PENDENTE").notNull(),
  dataLimite: date("data_limite"),
  concluidaEm: timestamp("concluida_em"),
  criadoEm: timestamp("criado_em").defaultNow().notNull(),
  atualizadoEm: timestamp("atualizado_em").defaultNow().notNull(),
});

export const relatorios = pgTable("relatorios", {
  id: uuid("id").primaryKey().defaultRandom(),
  usuarioId: uuid("usuario_id")
    .notNull()
    .references(() => usuarios.id, { onDelete: "cascade" }),
  totalConcluidas: integer("total_concluidas").notNull(),
  totalPendentes: integer("total_pendentes").notNull(),
  concluidasPorDia: json("concluidas_por_dia").$type<Record<string, number>>().notNull(),
  periodoInicio: date("periodo_inicio").notNull(),
  periodoFim: date("periodo_fim").notNull(),
  geradoEm: timestamp("gerado_em").defaultNow().notNull(),
});

export const usuariosRelations = relations(usuarios, ({ many }) => ({
  tarefas: many(tarefas),
  relatorios: many(relatorios),
}));

export const tarefasRelations = relations(tarefas, ({ one }) => ({
  usuario: one(usuarios, {
    fields: [tarefas.usuarioId],
    references: [usuarios.id],
  }),
}));

export const relatoriosRelations = relations(relatorios, ({ one }) => ({
  usuario: one(usuarios, {
    fields: [relatorios.usuarioId],
    references: [usuarios.id],
  }),
}));
