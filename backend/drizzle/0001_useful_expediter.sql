ALTER TABLE "usuarios" ADD COLUMN "refresh_token" varchar(255);--> statement-breakpoint
ALTER TABLE "usuarios" ADD COLUMN "reset_token" text;--> statement-breakpoint
ALTER TABLE "usuarios" ADD COLUMN "reset_token_expiry" timestamp;