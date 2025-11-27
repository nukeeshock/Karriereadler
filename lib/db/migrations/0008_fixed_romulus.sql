CREATE TABLE "analytics_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"visitor_id" varchar(64) NOT NULL,
	"session_id" varchar(64) NOT NULL,
	"page" varchar(255) NOT NULL,
	"event" varchar(50) DEFAULT 'pageview' NOT NULL,
	"duration_ms" integer,
	"is_new_visitor" boolean DEFAULT false,
	"is_new_session" boolean DEFAULT false,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"subject" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"handled" boolean DEFAULT false NOT NULL
);
