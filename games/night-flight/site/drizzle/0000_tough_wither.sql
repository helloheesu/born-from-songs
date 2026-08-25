CREATE TABLE `orbit_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`message` text NOT NULL,
	`palette_json` text NOT NULL,
	`status` text DEFAULT 'visible' NOT NULL,
	`sample_key` integer NOT NULL,
	`client_hash` text NOT NULL,
	`created_at` integer NOT NULL,
	`report_count` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_orbit_messages_visible_sample` ON `orbit_messages` (`status`,`sample_key`);--> statement-breakpoint
CREATE INDEX `idx_orbit_messages_client_created` ON `orbit_messages` (`client_hash`,`created_at`);