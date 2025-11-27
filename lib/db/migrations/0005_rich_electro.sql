CREATE TABLE "cv_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"status" varchar(50) DEFAULT 'offen' NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"birth_date" varchar(50),
	"phone" varchar(50),
	"email" varchar(255) NOT NULL,
	"street" varchar(255),
	"house_number" varchar(20),
	"zip_code" varchar(20),
	"city" varchar(100),
	"country" varchar(100),
	"work_experience" text,
	"education" text,
	"skills" text,
	"other" text,
	"photo_path" text,
	"job_description" text,
	"language" varchar(50) DEFAULT 'Deutsch',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "letter_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"status" varchar(50) DEFAULT 'offen' NOT NULL,
	"job_title" varchar(255) NOT NULL,
	"company_name" varchar(255) NOT NULL,
	"location" varchar(255),
	"job_country" varchar(100),
	"job_posting_url" text,
	"job_description_text" text,
	"experiences_to_highlight" text,
	"strengths" text,
	"additional_notes" text,
	"cv_request_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cv_requests" ADD CONSTRAINT "cv_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "letter_requests" ADD CONSTRAINT "letter_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "letter_requests" ADD CONSTRAINT "letter_requests_cv_request_id_cv_requests_id_fk" FOREIGN KEY ("cv_request_id") REFERENCES "public"."cv_requests"("id") ON DELETE no action ON UPDATE no action;