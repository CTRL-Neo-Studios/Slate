CREATE TABLE `pages` (
	`uuid` text PRIMARY KEY NOT NULL,
	`name` text DEFAULT 'Untitled Page' NOT NULL,
	`icon` text DEFAULT 'lucide:file' NOT NULL,
	`content` text DEFAULT '' NOT NULL,
	`parentPageId` text,
	`persistent_data` text,
	`reference_to` text,
	`created_at` integer,
	`modified_at` integer,
	FOREIGN KEY (`parentPageId`) REFERENCES `pages`(`uuid`) ON UPDATE no action ON DELETE cascade
);
