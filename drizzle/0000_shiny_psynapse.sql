CREATE TABLE "module_vet_staff_vet_professionals" (
	"id" text PRIMARY KEY NOT NULL,
	"staff_id" text NOT NULL,
	"license_number" text NOT NULL,
	"license_college" text,
	"specialty" text,
	"senasa_number" text,
	"is_active" boolean NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
