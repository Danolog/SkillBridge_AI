CREATE TABLE "faculty_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "faculty_sessions_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE INDEX "idx_faculty_sessions_expires_at" ON "faculty_sessions" USING btree ("expires_at");