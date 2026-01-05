ALTER TABLE `managed_users` ADD `username` varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `username` varchar(50);--> statement-breakpoint
ALTER TABLE `managed_users` ADD CONSTRAINT `managed_users_username_unique` UNIQUE(`username`);--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_username_unique` UNIQUE(`username`);