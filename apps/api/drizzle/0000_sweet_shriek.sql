CREATE TYPE "public"."assignment_slot" AS ENUM('full', 'am', 'pm');--> statement-breakpoint
CREATE TYPE "public"."destination_type" AS ENUM('job_site', 'leave', 'training', 'unassigned');--> statement-breakpoint
CREATE TYPE "public"."job_site_status" AS ENUM('active', 'complete');--> statement-breakpoint
CREATE TYPE "public"."leave_source" AS ENUM('manual', 'import');--> statement-breakpoint
CREATE TYPE "public"."resource_type" AS ENUM('person', 'plant', 'hire', 'contractor');--> statement-breakpoint
CREATE TABLE "assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"resource_id" uuid NOT NULL,
	"date" date NOT NULL,
	"slot" "assignment_slot" DEFAULT 'full' NOT NULL,
	"destination_type" "destination_type" NOT NULL,
	"destination_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "day_notes" (
	"job_site_id" uuid NOT NULL,
	"date" date NOT NULL,
	"text" text NOT NULL,
	CONSTRAINT "day_notes_job_site_id_date_pk" PRIMARY KEY("job_site_id","date")
);
--> statement-breakpoint
CREATE TABLE "job_sites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"job_number" text NOT NULL,
	"crew" text DEFAULT 'road-construction' NOT NULL,
	"start_date" date,
	"end_date" date,
	"status" "job_site_status" DEFAULT 'active' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leave_records" (
	"resource_id" uuid NOT NULL,
	"date" date NOT NULL,
	"source" "leave_source" DEFAULT 'manual' NOT NULL,
	CONSTRAINT "leave_records_resource_id_date_pk" PRIMARY KEY("resource_id","date")
);
--> statement-breakpoint
CREATE TABLE "resources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"type" "resource_type" NOT NULL,
	"crew" text DEFAULT 'road-construction' NOT NULL,
	"rate" numeric,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "traffic_control" (
	"job_site_id" uuid NOT NULL,
	"date" date NOT NULL,
	"count" integer NOT NULL,
	"provider" text NOT NULL,
	CONSTRAINT "traffic_control_job_site_id_date_pk" PRIMARY KEY("job_site_id","date")
);
--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_resource_id_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_destination_id_job_sites_id_fk" FOREIGN KEY ("destination_id") REFERENCES "public"."job_sites"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "day_notes" ADD CONSTRAINT "day_notes_job_site_id_job_sites_id_fk" FOREIGN KEY ("job_site_id") REFERENCES "public"."job_sites"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leave_records" ADD CONSTRAINT "leave_records_resource_id_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "traffic_control" ADD CONSTRAINT "traffic_control_job_site_id_job_sites_id_fk" FOREIGN KEY ("job_site_id") REFERENCES "public"."job_sites"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "assignments_resource_date_idx" ON "assignments" USING btree ("resource_id","date","created_at");--> statement-breakpoint
CREATE INDEX "assignments_date_idx" ON "assignments" USING btree ("date");