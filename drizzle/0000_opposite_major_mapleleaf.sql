CREATE TABLE `features` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`lane_id` text NOT NULL,
	`start_quarter` integer NOT NULL,
	`end_quarter` integer NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`link_url` text,
	`color` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`lane_id`) REFERENCES `lanes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `lanes` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`order` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `published_roadmap` (
	`id` text PRIMARY KEY NOT NULL,
	`data` text NOT NULL,
	`published_at` integer DEFAULT (unixepoch()) NOT NULL
);
