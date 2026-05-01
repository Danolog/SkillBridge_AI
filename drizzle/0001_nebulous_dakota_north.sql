CREATE TYPE "public"."project_competency_role" AS ENUM('required', 'acquired');--> statement-breakpoint
CREATE TYPE "public"."project_level" AS ENUM('L1', 'L2', 'L3', 'L4', 'L5');--> statement-breakpoint
CREATE TYPE "public"."project_source_type" AS ENUM('open_data', 'oss', 'partner', 'ngo', 'faculty');--> statement-breakpoint
CREATE TYPE "public"."submission_status" AS ENUM('in_progress', 'submitted', 'verified', 'rejected');--> statement-breakpoint
CREATE TABLE "project_competencies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"competency_name" text NOT NULL,
	"role" "project_competency_role" DEFAULT 'required' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "project_source_type" NOT NULL,
	"url" text NOT NULL,
	"last_synced_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "project_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"repo_url" text,
	"notebook_url" text,
	"additional_urls" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"submitted_at" timestamp with time zone,
	"ai_review_json" jsonb,
	"score" integer,
	"status" "submission_status" DEFAULT 'in_progress' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"level" "project_level" NOT NULL,
	"estimated_hours" integer NOT NULL,
	"source_type" "project_source_type" NOT NULL,
	"source_url" text,
	"partner_id" text,
	"exclusivity" boolean DEFAULT false NOT NULL,
	"brief_template" text,
	"rubric_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "projects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "project_competencies" ADD CONSTRAINT "project_competencies_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_submissions" ADD CONSTRAINT "project_submissions_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_submissions" ADD CONSTRAINT "project_submissions_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_project_competencies_project_id" ON "project_competencies" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_project_submissions_student" ON "project_submissions" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "idx_project_submissions_project" ON "project_submissions" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_projects_slug" ON "projects" USING btree ("slug");