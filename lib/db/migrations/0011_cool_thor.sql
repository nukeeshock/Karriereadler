CREATE TABLE "order_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"product_type" varchar(50) NOT NULL,
	"status" varchar(50) DEFAULT 'PENDING_PAYMENT' NOT NULL,
	"customer_name" varchar(255),
	"customer_email" varchar(255) NOT NULL,
	"customer_phone" varchar(100),
	"basic_info" jsonb,
	"form_data" jsonb,
	"stripe_session_id" varchar(255),
	"stripe_payment_intent_id" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "order_requests_stripe_session_id_unique" UNIQUE("stripe_session_id")
);
--> statement-breakpoint
ALTER TABLE "order_requests" ADD CONSTRAINT "order_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;