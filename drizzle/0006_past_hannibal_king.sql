CREATE TABLE `tracker_checkins` (
	`id` int AUTO_INCREMENT NOT NULL,
	`trackerItemId` int NOT NULL,
	`userId` int NOT NULL,
	`checkedAt` timestamp NOT NULL,
	`value` decimal(10,2) NOT NULL DEFAULT '1',
	`status` enum('done','skipped') NOT NULL DEFAULT 'done',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tracker_checkins_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tracker_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`categoryId` int,
	`title` varchar(255) NOT NULL,
	`description` text,
	`type` enum('task','habit') NOT NULL,
	`group` enum('personal','professional','health') NOT NULL DEFAULT 'personal',
	`targetPeriod` enum('daily','weekly','monthly') NOT NULL DEFAULT 'daily',
	`targetValue` decimal(10,2) NOT NULL DEFAULT '1',
	`unit` varchar(50) NOT NULL DEFAULT 'check',
	`activeDays` varchar(50),
	`timeWindowStart` varchar(5),
	`timeWindowEnd` varchar(5),
	`icon` varchar(50),
	`color` varchar(20),
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tracker_items_id` PRIMARY KEY(`id`)
);
