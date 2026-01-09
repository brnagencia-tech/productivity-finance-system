DROP TABLE `task_completions`;--> statement-breakpoint
ALTER TABLE `tasks` ADD `date` timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE `tasks` ADD `time` varchar(5);--> statement-breakpoint
ALTER TABLE `tasks` ADD `hasTime` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `tasks` ADD `status` enum('todo','in_progress','done') DEFAULT 'todo' NOT NULL;--> statement-breakpoint
ALTER TABLE `tasks` ADD `notes` text;--> statement-breakpoint
ALTER TABLE `tasks` DROP COLUMN `categoryId`;--> statement-breakpoint
ALTER TABLE `tasks` DROP COLUMN `description`;--> statement-breakpoint
ALTER TABLE `tasks` DROP COLUMN `frequency`;--> statement-breakpoint
ALTER TABLE `tasks` DROP COLUMN `assignedTo`;--> statement-breakpoint
ALTER TABLE `tasks` DROP COLUMN `targetCompletionRate`;--> statement-breakpoint
ALTER TABLE `tasks` DROP COLUMN `isActive`;