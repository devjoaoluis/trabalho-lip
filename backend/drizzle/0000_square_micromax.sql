CREATE TYPE "public"."prioridade" AS ENUM('BAIXA', 'MEDIA', 'ALTA');--> statement-breakpoint
CREATE TYPE "public"."status_tarefa" AS ENUM('PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDA');--> statement-breakpoint
CREATE TABLE "relatorios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"usuario_id" uuid NOT NULL,
	"total_concluidas" integer NOT NULL,
	"total_pendentes" integer NOT NULL,
	"concluidas_por_dia" json NOT NULL,
	"periodo_inicio" date NOT NULL,
	"periodo_fim" date NOT NULL,
	"gerado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tarefas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"usuario_id" uuid NOT NULL,
	"titulo" varchar(255) NOT NULL,
	"descricao" text,
	"prioridade" "prioridade" DEFAULT 'MEDIA' NOT NULL,
	"status" "status_tarefa" DEFAULT 'PENDENTE' NOT NULL,
	"data_limite" date,
	"concluida_em" timestamp,
	"criado_em" timestamp DEFAULT now() NOT NULL,
	"atualizado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "usuarios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"senha_hash" varchar(255) NOT NULL,
	"criado_em" timestamp DEFAULT now() NOT NULL,
	"atualizado_em" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "usuarios_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "relatorios" ADD CONSTRAINT "relatorios_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tarefas" ADD CONSTRAINT "tarefas_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;