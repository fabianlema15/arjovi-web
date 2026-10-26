CREATE TABLE "portfolio_projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text DEFAULT 'New project' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "portfolio_photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"caption" text DEFAULT '' NOT NULL,
	"media_type" text DEFAULT 'image/jpeg' NOT NULL,
	"data" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "portfolio_photos" ADD CONSTRAINT "portfolio_photos_project_id_portfolio_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."portfolio_projects"("id") ON DELETE cascade ON UPDATE no action;
