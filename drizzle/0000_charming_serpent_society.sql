CREATE TABLE "activities" (
	"hash" text PRIMARY KEY NOT NULL,
	"athlete_name" text NOT NULL,
	"km" numeric(10, 4) DEFAULT '0' NOT NULL,
	"first_seen" timestamp with time zone DEFAULT now() NOT NULL
);
